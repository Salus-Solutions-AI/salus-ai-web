
import { IncidentPopulator } from "./IncidentPopulator.ts";
import { getDocumentText, S3Object, TextractConfig } from "../utils/textractUtils.ts";
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
   * Runs basic OCR on the incident PDF to extract document text
   * @param config 
   * @param s3Object 
   * @returns Document text as a string
   */
  async runOCR(config: TextractConfig, s3Object: S3Object): Promise<string> {
    return getDocumentText(config, s3Object);
  }

  /**
   * Populates incident details from Textract form data using default format
   * 
   * @param textractFormData - The form data extracted from Textract
   * @param incident - The incident record to update
   * @returns The updated incident with populated fields
   */
  async populateIncidentDetails(textractDocument: string, incident: Record<string, any>, categories: any): Promise<Record<string, any>> {
    categories.push({
      name: "Needs more info",
      description: "Use this category if the incident needs more information in order to be classified."
    });

    categories.push({
      name: "None of the above",
      description: "Use this category if the incident does not fit into any of the other categories."
    });
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

    const timelyWarningPrompt = constructTimelyWarningPrompt(textractDocument)

    const timelyWarningLLMResponse = this.aiService === 'openai'
      ? await queryOpenAI(this.aiApiKey, timelyWarningPrompt)
      : await queryAnthropic(this.aiApiKey, timelyWarningPrompt);

    const timelyWarningResponse = parseTimelyWarningResponse(timelyWarningLLMResponse);

    return {
      ...incident,
      status: "Pending review",
      category: classificationResponse.category,
      date: parseDate(classificationResponse.date),
      time_str: classificationResponse.time,
      number: classificationResponse.number,
      location: classificationResponse.location,
      summary: classificationResponse.summary,
      explanation: classificationResponse.explanation,
      is_clery: classificationResponse.isClery,
      needs_more_info: classificationResponse.category.includes("Needs more info"),
      requires_timely_warning: timelyWarningResponse,
    };
  }
}

function constructAdditionalPromptData(): string {
  return `Also provide the following information:

  Date of incident: [date]

  Time of incident: [time]

  Report number of incident: [report number]

  Summary of incident: [summary]
  ` 
}