import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OllamaService } from './ollama.service';

export interface RouteAnalysis {
  complexity: 'simple' | 'medium' | 'complex';
  domain: string;
  model: string;
}

@Injectable()
export class PromptRouterService {
  private readonly logger = new Logger(PromptRouterService.name);

  constructor(
    private readonly ollamaService: OllamaService,
    private readonly configService: ConfigService,
  ) { }

  async routePrompt(userMessage: string): Promise<RouteAnalysis> {
    const routerModel = this.configService.get<string>('OLLAMA_ROUTER_MODEL') || 'gemma3';

    const generalModel = this.configService.get<string>('OLLAMA_GENERAL_MODEL') || 'gemma3';
    const codingModel = this.configService.get<string>('OLLAMA_CODING_MODEL') || 'gemma4';
    const reasoningModel = this.configService.get<string>('OLLAMA_REASONING_MODEL') || 'gemma4';

    const systemPrompt = `
You are an advanced AI routing system. Your job is to analyze the user's prompt and determine three things:
1. "complexity": The complexity of the prompt ('simple', 'medium', 'complex').
2. "domain": The domain of the prompt (e.g., 'coding', 'reasoning', 'general').
3. "model": Select the best model for this specific prompt from the available models list.

Available Models:
- "${generalModel}": Use for general conversations, simple questions, text summarization, or writing.
- "${codingModel}": Use strictly for programming, code generation, debugging, or technical architecture.
- "${reasoningModel}": Use for complex logic, math, philosophy, or deep analytical tasks.

Respond ONLY with a valid JSON object using the following structure:
{
  "complexity": "simple|medium|complex",
  "domain": "string",
  "model": "chosen_model_name"
}

User Prompt:
${userMessage}
`;

    try {
      this.logger.log(`Routing prompt...`);
      const responseText = await this.ollamaService.generateResponse(routerModel, systemPrompt, 'json');

      // Parse the JSON
      const parsedAnalysis: RouteAnalysis = JSON.parse(responseText);
      this.logger.log(`Router results - Domain: ${parsedAnalysis.domain}, Complexity: ${parsedAnalysis.complexity}, Selected Model: ${parsedAnalysis.model}`);

      // Basic validation
      if (!parsedAnalysis.model || !parsedAnalysis.complexity || !parsedAnalysis.domain) {
        throw new Error("Missing fields in router response");
      }

      return parsedAnalysis;

    } catch (error) {
      this.logger.error(`Routing failed, falling back to default model. Error: ${error.message}`);
      // Fallback
      return {
        complexity: 'medium',
        domain: 'general',
        model: generalModel,
      };
    }
  }
}
