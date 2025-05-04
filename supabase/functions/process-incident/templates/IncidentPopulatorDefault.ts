
import { IncidentPopulator } from "./IncidentPopulator.ts";
import { pollAnalyzeDocumentJob, S3Object, startAnalyzeDocumentJob, TextractConfig, TextractJobResult } from "../utils/textractUtils.ts";
import { queryAnthropic } from "../utils/anthropicUtils.ts";
import { queryOpenAI } from "../utils/openAiUtils.ts";
import { parseDate } from "../utils/dateUtils.ts";
import { constructClassificationPrompt, parseClassificationResponse, constructTimelyWarningPrompt, parseTimelyWarningResponse } from "../utils/promptUtils.ts";

/**
 * Default implementation of IncidentPopulator
 */
export class DefaultIncidentPopulator implements IncidentPopulator {
  private aiApiKey: string;
  private aiService: string;

  constructor(aiApiKey: string, aiService: string = 'anthropic') {
    this.aiApiKey = aiApiKey;
    this.aiService = aiService;
  }

  /**
   * Runs OCR on the incident PDF to extract document form data
   * @param config - Textract configuration
   * @param s3Object - S3 object containing the incident PDF
   * @returns Document form data
   */
  async runOCR(config: TextractConfig, s3Object: S3Object): Promise<TextractJobResult> {
    const jobId = await startAnalyzeDocumentJob(
      config, 
      s3Object
    )
    
    return pollAnalyzeDocumentJob(
      config,
      jobId,
      600,
      1000,
    )
  }

  /**
   * Populates incident details from Textract form data using default format
   * 
   * @param textractFormData - The form data extracted from Textract
   * @param incident - The incident record to update
   * @returns The updated incident with populated fields
   */
  async populateIncidentDetails(textractFormData: Record<string, any>, incident: Record<string, any>, categories: any): Promise<Record<string, any>> {
    categories.push({
      name: "Needs more info",
      description: "Use this category if the incident needs more information in order to be classified."
    });

    categories.push({
      name: "None of the above",
      description: "Use this category if the incident does not fit into any of the other categories."
    });

    let textractDocument = Object.entries(textractFormData)
      .map(([key, value]) => `${key} ${value}`)
      .join(" ");

    console.log(textractDocument);

    const prompt = constructClassificationPrompt(
      textractDocument,
      categories.map(element => ({
        name: element.name,
        description: element.description,
      })),
      constructAdditionalPromptData());

    const classificationLLMResponse = this.aiService === 'openai'
      ? await queryOpenAI(
          this.aiApiKey,
          prompt,
        )
      : await queryAnthropic(
          this.aiApiKey,
          prompt,
        );
      
    const classificationResponse = parseClassificationResponse(classificationLLMResponse);

    let requiresTimelyWarning = false;
    if (classificationResponse.isClery) {
      // wait one second
      await new Promise(resolve => setTimeout(resolve, 1000));

      const timelyWarningPrompt = constructTimelyWarningPrompt(textractDocument)

      const timelyWarningLLMResponse = this.aiService === 'openai'
        ? await queryOpenAI(this.aiApiKey, timelyWarningPrompt)
        : await queryAnthropic(this.aiApiKey, timelyWarningPrompt);


      const timelyWarningResponse = parseTimelyWarningResponse(timelyWarningLLMResponse);
      requiresTimelyWarning = timelyWarningResponse;
    }

    if (classificationResponse.number.toLowerCase().includes("not provided")) {
      classificationResponse.number = `Report ${classificationResponse.date}`;
    }

    return {
      ...incident,
      status: "Pending Review",
      category: classificationResponse.category,
      date: parseDate(classificationResponse.date),
      time_str: classificationResponse.time,
      number: classificationResponse.number,
      location: classificationResponse.location,
      summary: classificationResponse.summary,
      explanation: classificationResponse.explanation,
      is_clery: classificationResponse.isClery,
      needs_more_info: classificationResponse.needsMoreInfo || classificationResponse.category === "Needs more info" || classificationResponse.category === "Unknown",
      requires_timely_warning: requiresTimelyWarning,
    };
  }
}

function constructAdditionalPromptData(): string {
  return `Date of incident: [date of the incident]

  Time of incident: [time of the incident]

  Report number of incident: [report number of the incident]

  Summary of incident: [summary of the incident]
  ` 
}