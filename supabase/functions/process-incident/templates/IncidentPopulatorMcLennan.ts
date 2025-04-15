
import { IncidentPopulator } from "./IncidentPopulator.ts";
import { queryAnthropic } from "../utils/anthropicUtils.ts";
import { queryOpenAI } from "../utils/openAiUtils.ts";

/**
 * McLennan Community College implementation of IncidentPopulator
 * Populates incident details according to MCC's format
 */
export class McLennanIncidentPopulator implements IncidentPopulator {
  private aiApiKey: string;
  private aiService: string;

  constructor(aiApiKey: string, aiService: string = 'anthropic') {
    this.aiApiKey = aiApiKey;
    this.aiService = aiService;
  }

  /**
   * Populates incident details from Textract form data using MCC format
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

    const classificationResponse = this.aiService === 'openai'
      ? await queryOpenAI(
          this.aiApiKey,
          textractFormData["Description of crime or incident:"],
          categories.map(element => ({
            name: element.name,
            description: element.description,
          }))
        )
      : await queryAnthropic(
          this.aiApiKey,
          textractFormData["Description of crime or incident:"],
          categories.map(element => ({
            name: element.name,
            description: element.description,
          }))
        );

    return {
      ...incident,
      status: "Pending review",
      category: classificationResponse.category,
      date: parseDate(textractFormData["Date of incident:"]),
      time_str: textractFormData["Time of incident:"],
      number: textractFormData["MCC PD Report #"] || textractFormData["PD Report #"] || textractFormData["2025MCC PD Report #"] || "Unknown",
      location: classificationResponse.location,
      summary: textractFormData["Description of crime or incident:"] || "No description provided.",
      explanation: classificationResponse.explanation,
      is_clery: classificationResponse.isClery,
      needs_more_info: classificationResponse.category.includes("Needs more info"),
    };
  }
}

function parseDate(dateString: string): Date {
  const cleanedDateString = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1');
  
  // Parse the cleaned string into a Date object
  const date = new Date(cleanedDateString);
  
  // Validate that the date is valid
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  
  return date;
}
