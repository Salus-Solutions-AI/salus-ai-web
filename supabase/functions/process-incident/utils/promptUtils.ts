export interface Category {
    name: string;
    description: string;
}

export interface ClassificationResult {
    category: string;
    explanation: string;
    location: string;
    isClery: boolean;
    needsMoreInfo: boolean;
    date: string;
    time: string;
    number: string;
    summary: string;
}

export function constructClassificationPrompt(documentText: string, categories: Category[], additionalData: string): string {
    const formattedCategories = categories
        .map(cat => `${cat.name}\t${cat.description}`)
        .join('\n');

    return `
        You are a Clery compliance officer who needs to analyze a new incident report that just came in.
        Task: Classify the following document into one of the categories, provide an explanation for the classification, and whether it qualifies as a Clery crime or not.
        A Clery crime is one that falls into one of the categores (besides "Needs more info") and it must have occured:
          - On campus (including residence halls)
          - On public property within or immediately adjacent to campus
          - In or on non-campus buildings or property owned or controlled by the institution
          - Within the institution's Clery geography
        
        Categories:
        ${formattedCategories}
        
        Document text:
        ${documentText}

        Please follow this exact format for your response:
        
        Classification decision: [category name]

        Is Clery: [true/false]

        Needs more info: [true/false]

        Location: [location of the incident]

        ${additionalData}
        
        Explanation: This document is classified as [category name] because...
        (keep your explanation concise, with a maximum of 3 sentences)
    `;
}

export function parseClassificationResponse(responseText: string): ClassificationResult {
    console.log("classification response: " + responseText);
    const categoryMatch = responseText.match(/Classification decision: (.+?)$/mi);
    const needsMoreInfoMatch = responseText.match(/Needs more info: (.+?)$/mi);
    const isCleryMatch = responseText.match(/Is Clery: (.+?)$/mi);
    const locationMatch = responseText.match(/Location: (.+?)$/mi);
    const explanationMatch = responseText.match(/Explanation: \s*(.+)$/s);
    const dateMatch = responseText.match(/Date of incident: (.+?)$/mi);
    const timeMatch = responseText.match(/Time of incident: (.+?)$/mi);
    const numberMatch = responseText.match(/Report number of incident: (.+?)$/mi);
    const summaryMatch = responseText.match(/Summary of incident: (.+?)$/mi);

    return {
        category: categoryMatch ? categoryMatch[1].trim() : "Unknown",
        location: locationMatch ? locationMatch[1].trim() : "Unknown",
        explanation: explanationMatch ? explanationMatch[1].trim() : "Unable to classify incident.",
        isClery: isCleryMatch ? isCleryMatch[1].trim().toLowerCase() === "true" : false,
        needsMoreInfo: needsMoreInfoMatch ? needsMoreInfoMatch[1].trim().toLowerCase() === "true" : false,
        date: dateMatch ? dateMatch[1].trim() : "Unknown",
        time: timeMatch ? timeMatch[1].trim() : "Unknown",
        number: numberMatch ? numberMatch[1].trim() : "Unknown",
        summary: summaryMatch ? summaryMatch[1].trim() : "No summary provided.",
    };
}

export function constructTimelyWarningPrompt(incidentText: string): string {
    return `
        Task: Determine if the incident should be classified as requiring a timely warning.
        An incident should be classified as requiring a timely warning if all of the following conditions are met:
        1. It occured within Clery geography, defined as:
            - On campus (including residence halls)
            - On public property within or immediately adjacent to campus
            - In or on non-campus buildings or property owned or controlled by the institution

        2. There is a serious and ongoing community threat. 
            Each incident should be evaluated on a case by case basis, but in general, an incident should be classified as requiring a timely warning if many of the following are true:   
                - The incident occured in the recent past
                - There was physical injury to the victim
                - There was use of weapons
                - Forced entry and/or tools used in committing the crime
                - The suspect is not in custody and cannot be located by law enforcement

            One example of an incident that should not be classified as requiring a timely warning is if a student may have been sexually assaulted by someone at a party in the past,
            or if there was an altercation on campus the day before, but there is no evidence that the threat is ongoing.

        Incident text:
        ${incidentText}

        Please follow this exact format for your response:

        Classification decision: [true/false]

        Explanation: [explanation for the classification]
    `;
}

export function parseTimelyWarningResponse(responseText: string): boolean {
    console.log("timely warning response: " + responseText);
    const match = responseText.match(/Classification decision: (.+?)$/mi);

    return match ? match[1].trim().toLowerCase() === "true" : false;
}