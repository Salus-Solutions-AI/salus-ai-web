
/**
 * Interface for populating incident details from extracted form data
 */
export interface IncidentPopulator {
  /**
   * Populates incident details based on Textract form data
   * 
   * @param textractFormData - The form data extracted from Textract
   * @param incident - The incident record to update
   * @returns The updated incident with populated fields
   */
  populateIncidentDetails(textractFormData: Record<string, any>, incident: Record<string, any>, categories: any): Record<string, any>;
}
