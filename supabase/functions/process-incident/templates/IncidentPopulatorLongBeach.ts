
import { IncidentPopulator } from "./IncidentPopulator.ts";
import { getMockIncidentData } from "../utils/incidentUtils.ts";
import { mock } from "node:test";

/**
 * Long Beach implementation of IncidentPopulator
 */
export class LongBeachIncidentPopulator implements IncidentPopulator {
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
