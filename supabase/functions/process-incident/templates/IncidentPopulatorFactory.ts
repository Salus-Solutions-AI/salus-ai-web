
import { IncidentPopulator } from "./IncidentPopulator.ts";
import { McLennanIncidentPopulator } from "./IncidentPopulatorMcLennan.ts";
import { DefaultIncidentPopulator } from "./IncidentPopulatorDefault.ts";

/**
 * Factory class to create the appropriate IncidentPopulator based on organization
 */
export class IncidentPopulatorFactory {
  /**
   * Creates an IncidentPopulator instance based on the given organization
   * 
   * @param organization - The organization identifier
   * @param aiApiKey - API key for AI services (Anthropic or OpenAI)
   * @param aiService - AI service to use ('anthropic' or 'openai')
   * @returns The appropriate IncidentPopulator for the organization
   */
  static createIncidentPopulator(
    organization: string | null, 
    aiApiKey: string,
    aiService: string = 'anthropic'
  ): IncidentPopulator {
    if (!organization) {
      return new DefaultIncidentPopulator(aiApiKey, aiService);
    }
    
    const normalizedOrg = organization.toLowerCase().trim();
    if (normalizedOrg == "mclennan_cc") {
      return new McLennanIncidentPopulator(aiApiKey, aiService);
    }

    return new DefaultIncidentPopulator(aiApiKey, aiService);
  }
}
