import { TextractConfig } from '../utils/textractUtils.ts';

/**
 * Interface for populating incident details from extracted form data
 */
export interface IncidentPopulator {
  /**
   * Runs OCR on the incident PDF to extract text
   * @param incident - The incident record to process
   * @returns The result of the OCR process
   * @throws Error if the OCR process fails
   */
  runOCR(config: TextractConfig, incident: Record<string, any>): any;
  
  /**
   * Populates incident details based on Textract form data
   * 
   * @param textractData - The data extracted from Textract
   * @param incident - The incident record to update
   * @returns The updated incident with populated fields
   */
  populateIncidentDetails(textractData: any, incident: Record<string, any>, categories: any): Record<string, any>;
}
