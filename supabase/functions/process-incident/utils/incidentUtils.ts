
/**
 * Gets mock incident data based on the title
 * @param title - The incident title to check
 * @returns Mock incident data
 */
export function getMockIncidentData(title: string) {
  let number = "UM-ASSLT-2025-114";
  let date = "2025-02-17";
  let dateStr = "February 17, 2025";
  let timeStr = "10:00 PM";
  let category = "Sex Offense (forcible)";
  let location = "3rd floor common area of West Quad Residence Hall.";
  let explanation = "The incident clearly falls under the category of Sex Offense (forcible), as the male acquantance forcefully initiated physical contact with the female student without her consent.";
  let summary = "A female student was in the 3rd floor common area of West Quad Resident Hall when a male acquantaince initiated unwanted physical contact. The suspect, who was attending a gathering in the same area, allegedly touched the victim innaproriately despite her repeated attempts to move away.";
  let isClery = true;
  let needsMoreInfo = false;
  
  if (title.includes("NonClery")) {
    number = "UM-VNDL-2025-53";
    date = "2025-02-18";
    category = "Other";
    location = "East wall of the campus library.";
    explanation = "The incident does not fall into any of the Clery categories.";
    summary = "A male student spray painted graffiti on the wall of the campus library.";
    isClery = false;
  } else if (title.includes("LLEA")) {
    number = "UM-ASSLT-2025-29";
    date = "2025-02-18";
    category = "Aggravated Assault";
    location = "Public sidewalk bordering the university campus at Reginald Hall.";
    explanation = "Needs more information to determine if this is a Clery crime.";
    summary = "There was an altercation between two individuals on the public sidewalk bordering the university campus at Reginald Hall.";
    isClery = false;
    needsMoreInfo = true;
  }
  
  return {
    number,
    date,
    dateStr,
    timeStr,
    category,
    location,
    explanation,
    summary,
    isClery,
    needsMoreInfo
  };
}
