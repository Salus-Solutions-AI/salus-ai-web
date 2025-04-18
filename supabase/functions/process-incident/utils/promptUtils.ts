export interface Category {
    name: string;
    description: string;
}

export interface ClassificationResult {
    category: string;
    explanation: string;
    location: string;
    isClery: boolean;
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
        Task: Classify the following document into one of the categories, provide an explanation for the classification, the location of the incident, and whether it qualifies as a Clery crime or not.
        A Clery crime is one that falls into one of the categores (besides "Needs more info") and it must have occured:
          - On campus (including residence halls)
          - On public property within or immediately adjacent to campus
          - In or on non-campus buildings or property owned or controlled by the institution
          - Within the institution's Clery geography
        
        Categories:
        ${formattedCategories}
        
        Document text:
        ${documentText}
        
        Classification decision: [category name]

        Location: [location of the incident]

        IsClery: [true/false]
        
        Explanation: This document is classified as [category name] because...
        (keep your explanation concise, with a maximum of 3 sentences)

        ${additionalData}
    `;
}

export function parseClassificationResponse(responseText: string): ClassificationResult {
    const categoryMatch = responseText.match(/Classification decision: (.+?)$/mi);
    const locationMatch = responseText.match(/Location: (.+?)$/mi);
    const isCleryMatch = responseText.match(/IsClery: (.+?)$/mi);
    const explanationMatch = responseText.match(/Explanation:\s*(.+)$/s);
    const dateMatch = responseText.match(/Date of incident: (.+?)$/mi);
    const timeMatch = responseText.match(/Time of incident: (.+?)$/mi);
    const numberMatch = responseText.match(/Report number of incident: (.+?)$/mi);
    const summaryMatch = responseText.match(/Summary of incident: (.+?)$/mi);

    return {
        category: categoryMatch ? categoryMatch[1].trim() : "Unknown",
        location: locationMatch ? locationMatch[1].trim() : "Unknown",
        explanation: explanationMatch ? explanationMatch[1].trim() : "Unable to classify incident.",
        isClery: isCleryMatch ? isCleryMatch[1].trim().toLowerCase() === "true" : false,
        date: dateMatch ? dateMatch[1].trim() : "Unknown",
        time: timeMatch ? timeMatch[1].trim() : "Unknown",
        number: numberMatch ? numberMatch[1].trim() : "Unknown",
        summary: summaryMatch ? summaryMatch[1].trim() : "No summary provided.",
    };
}