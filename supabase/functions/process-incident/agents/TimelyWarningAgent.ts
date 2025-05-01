import { BaseAgent } from './BaseAgent.ts';
import { AgentConfig, AgentContext, AgentResponse } from './types.ts';
import { queryOpenAI } from '../utils/openAiUtils.ts';
import { queryAnthropic } from '../utils/anthropicUtils.ts';

export interface TimelyWarningResult {
    requiresWarning: boolean;
    confidence: number;
    explanation: string;
    supportingEvidence: string[];
}

export class TimelyWarningAgent extends BaseAgent<TimelyWarningResult> {
    protected constructPrompt(): string {
        return `
            Task: Determine if the incident should be classified as requiring a timely warning.
            An incident should be classified as requiring a timely warning if all of the following conditions are met:
            1. It occurred within Clery geography, defined as:
                - On campus (including residence halls)
                - On public property within or immediately adjacent to campus
                - In or on non-campus buildings or property owned or controlled by the institution

            2. There is a serious and ongoing community threat. 
                Each incident should be evaluated on a case by case basis, but in general, an incident should be classified as requiring a timely warning if many of the following are true:   
                    - The incident occurred in the recent past
                    - There was physical injury to the victim
                    - There was use of weapons
                    - Forced entry and/or tools used in committing the crime
                    - The suspect is not in custody and cannot be located by law enforcement

                One example of an incident that should not be classified as requiring a timely warning is if a student may have been sexually assaulted by someone at a party in the past,
                or if there was an altercation on campus the day before, but there is no evidence that the threat is ongoing.

            Incident text:
            ${this.context.incidentText}

            Please analyze the incident and provide:
            1. Whether a timely warning is required
            2. Your confidence in this determination (0-1)
            3. Supporting evidence for your decision
            4. A detailed explanation

            Format your response as follows:

            Requires Warning: [true/false]
            Confidence: [0-1]
            
            Supporting Evidence:
            - [evidence point 1]
            - [evidence point 2]
            - [evidence point 3]
            
            Explanation: [detailed explanation of your decision]
        `;
    }

    protected parseResponse(response: string): TimelyWarningResult {
        const requiresWarningMatch = response.match(/Requires Warning:\s*([^\n]+)/);
        const confidenceMatch = response.match(/Confidence:\s*([0-9.]+)/);
        const explanationMatch = response.match(/Explanation:\s*([^\n]+)/);
        
        const evidenceMatches = response.match(/Supporting Evidence:\s*([\s\S]*?)(?=\n\n|$)/);
        const supportingEvidence = evidenceMatches 
            ? evidenceMatches[1].split('\n').map(line => line.trim()).filter(line => line.startsWith('-'))
            : [];

        return {
            requiresWarning: requiresWarningMatch ? requiresWarningMatch[1].trim().toLowerCase() === 'true' : false,
            confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0,
            explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided.',
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