import { BaseAgent } from './BaseAgent.ts';
import { InitialClassification, AgentConfig, AgentContext } from './types.ts';
import { queryOpenAI } from '../utils/openAiUtils.ts';
import { queryAnthropic } from '../utils/anthropicUtils.ts';

export class BroadCategoryAgent extends BaseAgent<InitialClassification> {
    constructor(config: AgentConfig, context: AgentContext) {
        super(config, context);
    }

    protected constructPrompt(): string {
        const formattedCategories = this.context.categories
            .map(cat => `${cat.name}\t${cat.description}`)
            .join('\n');

        return `
            You are a Clery compliance officer analyzing an incident report.
            Your task is to identify the top 3 most likely categories this incident might belong to.
            
            Available Categories:
            ${formattedCategories}
            
            Incident Text:
            ${this.context.incidentText}
            
            Please analyze the text and identify:
            1. The top 3 most likely categories
            2. Key phrases that support each categorization
            3. Your confidence in each categorization (0-1)
            
            Format your response as follows:
            
            Top Categories:
            1. [Category Name] (Confidence: [0-1])
               Key Phrases: [comma-separated phrases]
            2. [Category Name] (Confidence: [0-1])
               Key Phrases: [comma-separated phrases]
            3. [Category Name] (Confidence: [0-1])
               Key Phrases: [comma-separated phrases]
            
            Overall Confidence: [0-1]
        `;
    }

    protected parseResponse(response: string): InitialClassification {
        const topCategories: { name: string; confidence: number; keyPhrases: string[] }[] = [];
        let overallConfidence = 0;
        
        // Extract top categories and their details
        const categoryMatches = response.matchAll(/^\d+\.\s*([^(]+)\s*\(Confidence:\s*([0-9.]+)\)\s*Key Phrases:\s*([^\n]+)/gm);
        
        for (const match of categoryMatches) {
            const [, name, confidence, phrases] = match;
            topCategories.push({
                name: name.trim(),
                confidence: parseFloat(confidence),
                keyPhrases: phrases.split(',').map(p => p.trim())
            });
        }
        
        // Extract overall confidence
        const confidenceMatch = response.match(/Overall Confidence:\s*([0-9.]+)/);
        if (confidenceMatch) {
            overallConfidence = parseFloat(confidenceMatch[1]);
        }
        
        return {
            topCategories: topCategories.map(cat => ({
                name: cat.name,
                description: this.context.categories.find(c => c.name === cat.name)?.description || '',
                confidence: cat.confidence
            })),
            keyPhrases: topCategories.flatMap(cat => cat.keyPhrases),
            confidence: overallConfidence
        };
    }

    protected async callAI(prompt: string): Promise<string> {
        const openaiKey = process.env.OPENAI_API_KEY || '';
        const anthropicKey = process.env.ANTHROPIC_API_KEY || '';

        if (this.config.model.includes('openai')) {
            return await queryOpenAI(openaiKey, prompt);
        } else {
            return await queryAnthropic(anthropicKey, prompt);
        }
    }
} 