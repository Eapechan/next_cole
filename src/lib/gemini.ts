// Gemini AI Service
import { config } from './config';

export interface GeminiMessage {
  role: 'user' | 'model';
  content: string;
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

type EmissionsData = {
  totalEmissions: number;
  totalCarbonSinks: number;
  netEmissions: number;
  reductionPercentage: number;
};

type EmissionEntry = {
  activityType: string;
  co2e: number;
  date: string;
};

type DashboardContext = {
  totalEmissions: number;
  totalCarbonSinks: number;
  netEmissions: number;
  reductionPercentage: number;
  sustainabilityScore: number;
};

export class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || config.gemini.apiKey;
    this.apiUrl = config.gemini.apiUrl;
  }

  async generateResponse(
    messages: GeminiMessage[],
    context?: string
  ): Promise<string> {
    try {
      // Add a system prompt for brevity and clarity
      const systemPrompt = 'You are an AI assistant. Always keep your responses brief, concise, and clear, but do not omit any important content.';
      const contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      // Add context and system prompt if provided
      let allContents;
      if (context) {
        allContents = [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nContext: ${context}\n\nPlease respond based on this context.` }]
          },
          ...contents
        ];
      } else {
        allContents = [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          },
          ...contents
        ];
      }

      // Build the request body as per Gemini API
      const body = JSON.stringify({ contents: allContents });

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      });

      // Improved error handling: show actual error message from API
      if (!response.ok) {
        let errorMsg = `${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorMsg = errorData.error.message;
          }
        } catch (err) {
          // ignore
        }
        throw new Error(`Gemini API error: ${errorMsg}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini AI');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error: unknown) {
      console.error('Gemini AI Error:', error);
      throw error;
    }
  }

  async generateStrategyRecommendations(
    emissionsData: EmissionsData,
    carbonSinksData: unknown[],
    currentStrategies: unknown[]
  ): Promise<string> {
    const context = `
      You are an AI expert in carbon management and sustainability for coal mining operations.
      
      Current Data:
      - Total Emissions: ${emissionsData.totalEmissions} tonnes CO₂e
      - Total Carbon Sinks: ${emissionsData.totalCarbonSinks} tonnes CO₂e
      - Net Emissions: ${emissionsData.netEmissions} tonnes CO₂e
      - Reduction Percentage: ${emissionsData.reductionPercentage}%
      - Number of Current Strategies: ${currentStrategies.length}
      
      Please provide:
      1. Analysis of current performance
      2. Specific recommendations for improvement
      3. Priority actions to take
      4. Expected impact of recommendations
      
      Focus on practical, implementable solutions for coal mining operations in India.
      Consider cost-effectiveness, regulatory compliance, and environmental impact.
    `;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        content: 'Please analyze our carbon management data and provide strategic recommendations for improving our sustainability performance.'
      }
    ];

    return this.generateResponse(messages, context);
  }

  async generateEmissionAnalysis(emissions: EmissionEntry[]): Promise<string> {
    const context = `
      You are analyzing emission data from a coal mining operation.
      
      Emission Data:
      ${emissions.map(e => `- ${e.activityType}: ${e.co2e} tonnes CO₂e on ${e.date}`).join('\n')}
      
      Please provide:
      1. Pattern analysis of emissions
      2. Identification of high-emission activities
      3. Recommendations for reduction
      4. Compliance insights
    `;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        content: 'Please analyze our emission patterns and provide insights for improvement.'
      }
    ];

    return this.generateResponse(messages, context);
  }

  async generateComplianceReport(
    emissionsData: EmissionsData,
    regulatoryRequirements: unknown
  ): Promise<string> {
    const context = `
      You are generating a compliance report for coal mining carbon emissions.
      
      Current Performance:
      - Total Emissions: ${emissionsData.totalEmissions} tonnes CO₂e
      - Reduction Achieved: ${emissionsData.reductionPercentage}%
      - Carbon Credits: ${Math.max(emissionsData.totalCarbonSinks - emissionsData.totalEmissions, 0)} tonnes
      
      Regulatory Requirements:
      - Annual reporting required
      - Reduction targets must be met
      - Carbon credit verification needed
      
      Please provide a comprehensive compliance assessment and recommendations.
    `;

    const messages: GeminiMessage[] = [
      {
        role: 'user',
        content: 'Please generate a compliance report for our carbon management performance.'
      }
    ];

    return this.generateResponse(messages, context);
  }

  async chatWithAssistant(
    userMessage: string,
    conversationHistory: GeminiMessage[],
    dashboardContext?: DashboardContext
  ): Promise<string> {
    let context = 'You are an AI assistant specialized in carbon management for coal mining operations.';
    
    if (dashboardContext) {
      context += `
        
        Dashboard Context:
        - Total Emissions: ${dashboardContext.totalEmissions} tonnes CO₂e
        - Carbon Sinks: ${dashboardContext.totalCarbonSinks} tonnes CO₂e
        - Net Emissions: ${dashboardContext.netEmissions} tonnes CO₂e
        - Reduction: ${dashboardContext.reductionPercentage}%
        - Sustainability Score: ${dashboardContext.sustainabilityScore}/10
      `;
    }

    const messages: GeminiMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return this.generateResponse(messages, context);
  }
}

// Create a singleton instance
export const geminiService = new GeminiService();

// Export default instance
export default geminiService; 