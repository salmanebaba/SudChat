import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async generateResponse(model: string, prompt: string, format?: 'json') {
    const ollamaUrl = this.configService.get<string>('OLLAMA_URL') || 'http://host.docker.internal:11434/api/generate';
    
    try {
      this.logger.debug(`Sending to Ollama [${model}]`);
      const body: any = {
        model,
        prompt,
        stream: false,
      };

      if (format === 'json') {
        body.format = 'json';
      }

      const { data } = await firstValueFrom(
        this.httpService.post(ollamaUrl, body)
      );

      return data.response;
    } catch (error) {
      this.logger.error(`Ollama connection failed for model ${model}: ${error.message}`);
      throw new Error(`Ollama failed: ${error.message}`);
    }
  }
}
