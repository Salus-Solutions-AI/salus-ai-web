export async function queryAnthropic(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1000,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.0
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    return data.content[0].text;
}
