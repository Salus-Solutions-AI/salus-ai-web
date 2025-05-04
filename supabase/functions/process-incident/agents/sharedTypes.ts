// Base interfaces
export interface Category {
    name: string;
    description: string;
    confidence?: number;
}

// Agent-specific interfaces
export interface InitialClassification {
    topCategories: Category[];
    keyPhrases: string[];
    confidence: number;
}

export interface DetailedClassification {
    category: string;
    location: string;
    isClery: boolean;
    needsMoreInfo: boolean;
    explanation: string;
    confidence: number;
    supportingEvidence: string[];
}

export interface LocationAnalysis {
    location: string;
    isCleryGeography: boolean;
    confidence: number;
    reasoning: string;
    supportingEvidence: string[];
}

export interface TimelyWarningResult {
    requiresWarning: boolean;
    confidence: number;
    explanation: string;
    supportingEvidence: string[];
}

// Agent configuration and context
export interface AgentConfig {
    model: string;
    temperature: number;
    maxTokens: number;
}

export interface AgentContext {
    incidentText: string;
    categories: Category[];
    previousResults?: any;
}

// Agent response wrapper
export interface AgentResponse<T> {
    result: T;
    confidence: number;
    reasoning: string;
    supportingEvidence: string[];
}

// Legacy interfaces (to be deprecated)
export interface LegacyClassificationResult {
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
