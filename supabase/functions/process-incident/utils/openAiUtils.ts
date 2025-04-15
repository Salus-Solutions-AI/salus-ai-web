
interface Category {
    name: string;
    description: string;
}

interface ClassificationResult {
    category: string;
    explanation: string;
    location: string;
    isClery: boolean;
}

export async function queryOpenAI(apiKey: string, documentText: string, categories: Category[]): Promise<ClassificationResult> {
    const prompt = createClassificationPrompt(documentText, categories);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.0
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return parseClassificationResponse(data.choices[0].message.content);
}

function createClassificationPrompt(documentText: string, categories: Category[]): string {
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
    `;
}

function parseClassificationResponse(responseText: string): ClassificationResult {
    const categoryMatch = responseText.match(/Classification decision: (.+?)$/mi);
    const locationMatch = responseText.match(/Location: (.+?)$/mi);
    const isCleryMatch = responseText.match(/IsClery: (.+?)$/mi);
    const explanationMatch = responseText.match(/Explanation:\s*(.+)$/s);

    return {
      category: categoryMatch ? categoryMatch[1].trim() : "Unknown",
      location: locationMatch ? locationMatch[1].trim() : "Unknown",
      explanation: explanationMatch ? explanationMatch[1].trim() : "Unable to classify incident.",
      isClery: isCleryMatch ? isCleryMatch[1].trim().toLowerCase() === "true" : false,
    };
}
