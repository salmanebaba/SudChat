import { Test, TestingModule } from '@nestjs/testing';
import { PromptRouterService } from '../router/prompt-router.service';
import { OllamaClient } from '../utils/ollama-client';
import { ConfigService } from '@nestjs/config';

describe('PromptRouterService', () => {
  let service: PromptRouterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptRouterService,
        {
          provide: OllamaClient,
          useValue: {
            generate: jest.fn(),
          },
        },
        ConfigService,
      ],
    }).compile();

    service = module.get<PromptRouterService>(PromptRouterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should correctly route and generate response based on domain', async () => {
    const mockOllamaClient = {
      generate: jest.fn(),
    };
    // Re-inject the mock for this test scope if necessary, though beforeEach handles it.

    // Mocking the internal analysis result for a known path
    jest.spyOn(service as any, 'analyzePrompt').mockResolvedValue({
        domain: 'code_generation',
        complexity: 2,
        prompt: 'Write a function for fibonacci sequence.'
    });

    // Mocking the expected successful Ollama response for code generation
    mockOllamaClient.generate.mockResolvedValue('/** Mocked code response */ function fibonacci() {}');

    const prompt = 'Write a function for fibonacci sequence.';

    const result = await service.routePrompt(prompt);

    expect(mockOllamaClient.generate).toHaveBeenCalledWith(
      expect.any(String),
      'code-model'
    );
    expect(result).toContain('/** Mocked code response */');
  });
});