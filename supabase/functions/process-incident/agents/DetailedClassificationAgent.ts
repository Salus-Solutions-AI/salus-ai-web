import { BaseAgent } from './BaseAgent.ts';
import { DetailedClassification, AgentConfig, AgentContext, InitialClassification } from './types.ts';
import { queryOpenAI } from '../utils/openAiUtils.ts';
import { queryAnthropic } from '../utils/anthropicUtils.ts';

export class DetailedClassificationAgent extends BaseAgent<DetailedClassification> {
    private topCategories: InitialClassification;

    constructor(config: AgentConfig, context: AgentContext, topCategories: InitialClassification) {
        super(config, context);
        this.topCategories = topCategories;
    }

    protected constructPrompt(): string {
        const topCategoriesList = this.topCategories.topCategories
            .map(cat => `${cat.name} (Confidence: ${cat.confidence})`)
            .join('\n');

        return `
            You are a Clery compliance officer performing a detailed analysis of an incident.
            
            Based on initial analysis, the top potential categories are:
            ${topCategoriesList}
            
            Key phrases identified:
            ${this.topCategories.keyPhrases.join(', ')}
            
            Incident Text:
            ${this.context.incidentText}
            
            Please perform a detailed analysis and provide:
            1. Final category classification
            2. Location of the incident
            3. Whether it qualifies as a Clery crime
            4. Whether more information is needed
            5. Supporting evidence for your decisions
            6. Your confidence in the classification (0-1)
            
            Format your response as follows:
            
            Final Classification: [category name]
            Location: [location]
            Is Clery: [true/false]
            Needs More Info: [true/false]
            Confidence: [0-1]
            
            Supporting Evidence:
            - [evidence point 1]
            - [evidence point 2]
            - [evidence point 3]
            
            Explanation: [detailed explanation of your classification decision]
        `;
    }

    protected parseResponse(response: string): DetailedClassification {
        const categoryMatch = response.match(/Final Classification:\s*([^\n]+)/);
        const locationMatch = response.match(/Location:\s*([^\n]+)/);
        const isCleryMatch = response.match(/Is Clery:\s*([^\n]+)/);
        const needsMoreInfoMatch = response.match(/Needs More Info:\s*([^\n]+)/);
        const confidenceMatch = response.match(/Confidence:\s*([0-9.]+)/);
        const explanationMatch = response.match(/Explanation:\s*([^\n]+)/);
        
        const evidenceMatches = response.match(/Supporting Evidence:\s*([\s\S]*?)(?=\n\n|$)/);
        const supportingEvidence = evidenceMatches 
            ? evidenceMatches[1].split('\n').map(line => line.trim()).filter(line => line.startsWith('-'))
            : [];

        return {
            category: categoryMatch ? categoryMatch[1].trim() : 'Unknown',
            location: locationMatch ? locationMatch[1].trim() : 'Unknown',
            isClery: isCleryMatch ? isCleryMatch[1].trim().toLowerCase() === 'true' : false,
            needsMoreInfo: needsMoreInfoMatch ? needsMoreInfoMatch[1].trim().toLowerCase() === 'true' : false,
            explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided.',
            confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0,
            supportingEvidence: supportingEvidence.map(evidence => evidence.substring(1).trim())
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