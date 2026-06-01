import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from '../schemas/chat.schema';
import { Conversation } from '../schemas/conversation.schema';
import { PromptRouterService } from './prompt-router.service';
import { OllamaService } from './ollama.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    private readonly promptRouterService: PromptRouterService,
    private readonly ollamaService: OllamaService,
    private readonly configService: ConfigService,
  ) { }

  async sendMessage(userEmail: string, message: string, conversationId?: string, requestedModel?: string) {
    let finalConvId = conversationId;

    if (!finalConvId) {
      const titleLength = this.configService.get<number>('CHAT_TITLE_LENGTH') || 30;
      const title = message.substring(0, titleLength) + "...";
      const newConv = new this.conversationModel({
        userEmail: userEmail,
        title: title
      });
      const savedConv = await newConv.save();
      finalConvId = savedConv._id.toString();
    }

    let routingResult: any;
    let selectedModel: string;
    let aiResponseText = "Error";
    let responseTimeMs = 0;

    if (requestedModel === 'complex') {
      routingResult = { model: 'complex', domain: 'multi-agent', complexity: 'complex' };
      selectedModel = 'multi-agent-judge';
      
      const generalModel = this.configService.get<string>('OLLAMA_GENERAL_MODEL') || 'gemma3';
      const codingModel = this.configService.get<string>('OLLAMA_CODING_MODEL') || 'gemma4';
      const reasoningModel = this.configService.get<string>('OLLAMA_REASONING_MODEL') || 'phi4';
      
      const uniqueModels = [...new Set([generalModel, codingModel, reasoningModel])];
      
      try {
        this.logger.log(`${userEmail} Triggering Multi-Agent Judge for complex prompt...`);
        const startTime = Date.now();
        
        // Step 1: Query models in parallel
        const responses = await Promise.all(
          uniqueModels.map(model => 
            this.ollamaService.generateResponse(model, message).catch(err => `[${model} Failed]: ${err.message}`)
          )
        );
        
        // Step 2: Synthesis by Judge
        const judgePrompt = `You are an expert AI judge synthesizing answers from multiple specialized AI models.
The user asked: "${message}"

Here are the answers from different models:
${uniqueModels.map((m, i) => `--- Model ${m} ---\n${responses[i]}\n`).join('\n')}

Please synthesize the best, most comprehensive, and accurate response based on these answers. Correct any mistakes they made and provide a single cohesive response.`;

        this.logger.log(`Synthesizing final response using ${reasoningModel}...`);
        aiResponseText = await this.ollamaService.generateResponse(reasoningModel, judgePrompt);
        responseTimeMs = Date.now() - startTime;
        this.logger.log(`Multi-agent synthesis complete (took ${responseTimeMs}ms)`);
      } catch (error) {
        this.logger.error(`Multi-agent judge failed: ${error.message}`);
        aiResponseText = "I'm sorry, the multi-agent synthesis failed.";
      }
    } else {
      if (!requestedModel || requestedModel === 'auto') {
        routingResult = await this.promptRouterService.routePrompt(message);
        selectedModel = routingResult.model;
      } else {
        selectedModel = requestedModel;
        routingResult = {
          model: requestedModel,
          domain: 'user-selected',
          complexity: 'unknown'
        };
      }

      try {
        this.logger.log(`${userEmail} Sending to Ollama [${selectedModel}]: ${message.substring(0, 50)}...`);
        const startTime = Date.now();
        aiResponseText = await this.ollamaService.generateResponse(selectedModel, message);
        responseTimeMs = Date.now() - startTime;
        this.logger.log(`${selectedModel} replied ${userEmail}: ${aiResponseText.substring(0, 50)}... (took ${responseTimeMs}ms)`);
      } catch (error) {
        this.logger.error(`Ollama connection failed: ${error.message}`);
        aiResponseText = "I'm sorry, my brain is offline. Please check the server logs.";
      }
    }

    const newChat = new this.chatModel({
      conversationId: new Types.ObjectId(finalConvId),
      userEmail: userEmail,
      message: message,
      response: aiResponseText,
      aiModel: selectedModel,
      responseTimeMs: responseTimeMs,
      domain: routingResult?.domain || 'unknown',
      complexity: routingResult?.complexity || 'unknown',
    });

    await newChat.save();

    return {
      response: aiResponseText,
      conversationId: finalConvId,
      aiModel: selectedModel,
      routingDetails: routingResult 
    };
  }

  async getUserConversations(userEmail: string, skip = 0, limit = 10) {
    return this.conversationModel
      .find({ userEmail })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async getMessagesForConversation(userEmail: string, conversationId: string) {
    return this.chatModel
      .find({
        userEmail: userEmail,
        conversationId: new Types.ObjectId(conversationId)
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getPerformanceMetrics() {
    return this.chatModel.aggregate([
      {
        $group: {
          _id: { model: "$aiModel", domain: "$domain" },
          averageResponseTimeMs: { $avg: "$responseTimeMs" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          model: "$_id.model",
          domain: "$_id.domain",
          averageResponseTimeMs: { $round: ["$averageResponseTimeMs", 2] },
          count: 1
        }
      },
      { $sort: { model: 1, domain: 1 } }
    ]).exec();
  }

  async getRoutingMetrics() {
    return this.chatModel.aggregate([
      {
        $group: {
          _id: { domain: "$domain", complexity: "$complexity" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          domain: "$_id.domain",
          complexity: "$_id.complexity",
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]).exec();
  }
}