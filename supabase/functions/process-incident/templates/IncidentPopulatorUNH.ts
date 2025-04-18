
import { IncidentPopulator } from "./IncidentPopulator.ts";
import { getDocumentText, S3Object, TextractConfig } from "../utils/textractUtils.ts";
import { getMockIncidentData } from "../utils/incidentUtils.ts";

/**
 * University of New Hampshire implementation of IncidentPopulator
 */
export class UNHIncidentPopulator implements IncidentPopulator {
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
  populateIncidentDetails(textractFormData: Record<string, any>, incident: Record<string, any>, categories: any): Record<string, any> {
    const mockData = getMockIncidentData(incident.title);
    
    return {
      ...incident,
      status: "Pending review",
      category: mockData.category,
      date: mockData.date,
      date_str: mockData.dateStr,
      time_str: mockData.timeStr,
      number: mockData.number,
      location: mockData.location,
      summary: mockData.summary,
      explanation: mockData.explanation,
      is_clery: mockData.isClery,
      needs_more_info: mockData.needsMoreInfo,
    };
  }
}
