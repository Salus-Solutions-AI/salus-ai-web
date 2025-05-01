import { BaseAgent } from './BaseAgent.ts';
import { LocationAnalysis, AgentConfig, AgentContext } from './types.ts';
import { queryOpenAI } from '../utils/openAiUtils.ts';
import { queryAnthropic } from '../utils/anthropicUtils.ts';

export class LocationAnalysisAgent extends BaseAgent<LocationAnalysis> {
    protected constructPrompt(): string {
        return `
            You are a Clery compliance officer analyzing the location of an incident.
            
            Incident Text:
            ${this.context.incidentText}
            
            Please analyze the location information and determine:
            1. The specific location mentioned
            2. Whether it falls within Clery geography
            3. Supporting evidence for your determination
            4. Your confidence in the analysis (0-1)
            
            Clery geography includes:
            - On campus (including residence halls)
            - On public property within or immediately adjacent to campus
            - In or on non-campus buildings or property owned or controlled by the institution
            
            Format your response as follows:
            
            Location: [specific location]
            Is Clery Geography: [true/false]
            Confidence: [0-1]
            
            Supporting Evidence:
            - [evidence point 1]
            - [evidence point 2]
            - [evidence point 3]
            
            Reasoning: [detailed explanation of your location analysis]
        `;
    }

    protected parseResponse(response: string): LocationAnalysis {
        const locationMatch = response.match(/Location:\s*([^\n]+)/);
        const isCleryMatch = response.match(/Is Clery Geography:\s*([^\n]+)/);
        const confidenceMatch = response.match(/Confidence:\s*([0-9.]+)/);
        const reasoningMatch = response.match(/Reasoning:\s*([^\n]+)/);
        
        const evidenceMatches = response.match(/Supporting Evidence:\s*([\s\S]*?)(?=\n\n|$)/);
        const supportingEvidence = evidenceMatches 
            ? evidenceMatches[1].split('\n').map(line => line.trim()).filter(line => line.startsWith('-'))
            : [];

        return {
            location: locationMatch ? locationMatch[1].trim() : 'Unknown',
            isCleryGeography: isCleryMatch ? isCleryMatch[1].trim().toLowerCase() === 'true' : false,
            confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0,
            reasoning: reasoningMatch ? reasoningMatch[1].trim() : 'No reasoning provided.',
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