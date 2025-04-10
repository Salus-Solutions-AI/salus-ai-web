
import { IncidentPopulator } from "./IncidentPopulator.ts";
import { McLennanIncidentPopulator } from "./IncidentPopulatorMcLennan.ts";
import { DefaultIncidentPopulator } from "./IncidentPopulatorDefault.ts";
import { UNHIncidentPopulator } from "./IncidentPopulatorUNH.ts";
import { LongBeachIncidentPopulator } from "./IncidentPopulatorLongBeach.ts";

/**
 * Factory class to create the appropriate IncidentPopulator based on organization
 */
export class IncidentPopulatorFactory {
  /**
   * Creates an IncidentPopulator instance based on the given organization
   * 
   * @param organization - The organization identifier
   * @returns The appropriate IncidentPopulator for the organization
   */
  static createIncidentPopulator(organization: string | null, anthropicApiKey: string): IncidentPopulator {
    if (!organization) {
      console.log("No organization found, using default populator");
      return new DefaultIncidentPopulator();
    }
    
    const normalizedOrg = organization.toLowerCase().trim();
    
    if (normalizedOrg == "mclennan_cc") {
      console.log("Using McLennan Community College populator");
      return new McLennanIncidentPopulator(anthropicApiKey);
    }

    if (normalizedOrg == "unh") {
      console.log("Using UNH populator");
      return new UNHIncidentPopulator();
    }

    if (normalizedOrg == "long beach") {
      console.log("Using Long Beach populator");
      return new LongBeachIncidentPopulator();
    }
    
    console.log(`No specific populator found for '${organization}', using default populator`);
    return new DefaultIncidentPopulator();
  }
}
