import { Category, ClassificationResult, constructClassificationPrompt, parseClassificationResponse } from './promptUtils';

export async function queryOpenAI(apiKey: string, documentText: string, categories: Category[], additionalData: string): Promise<ClassificationResult> {
    const prompt = constructClassificationPrompt(documentText, categories, additionalData);
    
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
