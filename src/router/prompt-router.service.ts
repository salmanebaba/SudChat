import { Injectable } from '@nestjs/common';
import { OllamaClient } from '../utils/ollama-client';
import { PromptAnalysisResult } from '../dto/prompt-analysis.dto';

@Injectable()
export class PromptRouterService {
  constructor(private readonly ollamaClient: OllamaClient) {}

  /**
   * Analyzes the prompt and routes it to the correct model handler, using conversation history for context.
   * @param fullContext A combined string containing the entire conversation history and the current user message.
   * @param historyMessages An array of previous Chat objects to assist with context building.
   * @returns A promise resolving to the processed response from the correct model.
   */
  async routePrompt(fullContext: string, historyMessages: any[]): Promise<string> {
    // Step 1: Analyze the context (History + Current Prompt)
    const analysis = await this.analyzeContext(fullContext, historyMessages);

    // Step 2: Route based on analysis
    let modelResponse: string;

    if (analysis.domain === 'code_generation') {
      // Route to the specialized Code Generation handler
      modelResponse = await this.ollamaClient.generate(analysis.contextPrompt, 'code-model');
    } else if (analysis.domain === 'database_query') {
      // Route to the specialized Query handler (might use a different model/tool)
      modelResponse = await this.ollamaClient.generate(analysis.contextPrompt, 'sql-model');
    } else if (analysis.domain === 'math_calculation') {
      // Route to a math-capable model
      modelResponse = await this.ollamaClient.generate(analysis.contextPrompt, 'math-model');
    } else {
      // Fallback/Default handler: Use the full context for the general model
      console.log('Routing to default chat model.');
      modelResponse = await this.ollamaClient.generate(fullContext, 'general-model');
    }

    return modelResponse;
  }

  /**
   * Analyzes the combined context (History + Current Prompt) for domain and complexity.
   */
  private async analyzeContext(fullContext: string, historyMessages: any[]): Promise<PromptAnalysisResult> {
    // Placeholder logic: In a real system, this would use a smaller, fast LLM call
    // to classify the intent based on the entire conversation thread.

    // For now, we pass the full context as the prompt and default to general domain.
    const analysis: PromptAnalysisResult = {
      domain: 'general',
      complexity: historyMessages.length > 2 ? 3 : 1,
      prompt: fullContext, // Passing full context as the prompt for the default model
    };
    return analysis;
  }