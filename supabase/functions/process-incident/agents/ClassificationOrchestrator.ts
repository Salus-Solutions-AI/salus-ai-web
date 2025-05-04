import { BroadCategoryAgent } from './BroadCategoryAgent.ts';
import { DetailedClassificationAgent } from './DetailedClassificationAgent.ts';
import { LocationAnalysisAgent } from './LocationAnalysisAgent.ts';
import { TimelyWarningAgent, TimelyWarningResult } from './TimelyWarningAgent.ts';
import { AgentConfig, AgentContext, DetailedClassification, LocationAnalysis } from './sharedTypes.ts'

export class ClassificationOrchestrator {
    private config: AgentConfig;
    private context: AgentContext;

    constructor(config: AgentConfig, context: AgentContext) {
        this.config = config;
        this.context = context;
    }

    public async classifyIncident(): Promise<{
        classification: DetailedClassification;
        locationAnalysis: LocationAnalysis;
        timelyWarning: TimelyWarningResult;
        confidence: number;
    }> {
        try {
            // Step 1: Broad Category Identification
            const broadCategoryAgent = new BroadCategoryAgent(this.config, this.context);
            const broadCategoryResult = await broadCategoryAgent.execute();
            
            // Step 2: Detailed Classification
            const detailedAgent = new DetailedClassificationAgent(
                this.config,
                this.context,
                broadCategoryResult.result
            );
            const detailedResult = await detailedAgent.execute();
            
            // Step 3: Location Analysis
            const locationAgent = new LocationAnalysisAgent(this.config, this.context);
            const locationResult = await locationAgent.execute();
            
            // Step 4: Timely Warning Analysis (only if it's a Clery crime)
            let timelyWarningResult: TimelyWarningResult = {
                requiresWarning: false,
                confidence: 0,
                explanation: 'Not applicable - not a Clery crime',
                supportingEvidence: []
            };

            if (detailedResult.result.isClery) {
                const timelyWarningAgent = new TimelyWarningAgent(this.config, this.context);
                const timelyWarningResponse = await timelyWarningAgent.execute();
                timelyWarningResult = timelyWarningResponse.result;
            }
            
            // Calculate overall confidence
            const overallConfidence = Math.min(
                broadCategoryResult.confidence,
                detailedResult.confidence,
                locationResult.confidence,
                timelyWarningResult.confidence
            );
            
            return {
                classification: detailedResult.result,
                locationAnalysis: locationResult.result,
                timelyWarning: timelyWarningResult,
                confidence: overallConfidence
            };
        } catch (error) {
            console.error('Error in classification process:', error);
            throw error;
        }
    }
}
