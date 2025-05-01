import { AgentConfig, AgentContext, AgentResponse } from './types.ts';

export abstract class BaseAgent<T> {
    protected config: AgentConfig;
    protected context: AgentContext;

    constructor(config: AgentConfig, context: AgentContext) {
        this.config = config;
        this.context = context;
    }

    protected abstract constructPrompt(): string;
    protected abstract parseResponse(response: string): T;

    protected async callAI(prompt: string): Promise<string> {
        // This will be implemented by the specific AI service (OpenAI/Anthropic)
        throw new Error('Method not implemented');
    }

    public async execute(): Promise<AgentResponse<T>> {
        try {
            const prompt = this.constructPrompt();
            const response = await this.callAI(prompt);
            const result = this.parseResponse(response);
            
            return {
                result,
                confidence: 1.0, // This will be calculated by specific agents
                reasoning: '', // This will be filled by specific agents
                supportingEvidence: [] // This will be filled by specific agents
            };
        } catch (error) {
            console.error(`Error in agent execution: ${error}`);
            throw error;
        }
    }
} 