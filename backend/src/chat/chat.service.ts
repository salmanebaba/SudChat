import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Chat } from '../schemas/chat.schema';
import { Conversation } from '../schemas/conversation.schema';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Conversation.name) private conversationModel: Model<Conversation>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendMessage(userEmail: string, message: string, conversationId?: string) {
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

    const selectedModel = this.configService.get<string>('OLLAMA_MODEL');
    const ollamaUrl = this.configService.get<string>('OLLAMA_URL') || 'http://host.docker.internal:11434/api/generate';
    
    let aiResponseText = "Error";
    try {
      this.logger.log(`${userEmail} Sending to Ollama [${selectedModel}]: ${message.substring(0, 50)}...`);
      const { data } = await firstValueFrom(
        this.httpService.post(ollamaUrl, {
          model: selectedModel, 
          prompt: message, 
          stream: false 
        })
      );
      aiResponseText = data.response;
      this.logger.log(`Ollama replied ${userEmail}: ${aiResponseText.substring(0, 50)}...`);

    } catch (error) {
      this.logger.error(`Ollama connection failed: ${error.message}`);
      aiResponseText = "I'm sorry, my brain is offline. Please check the server logs.";
    }

    const newChat = new this.chatModel({
      conversationId: new Types.ObjectId(finalConvId),
      userEmail: userEmail,
      message: message,
      response: aiResponseText,
      aiModel: selectedModel
    });

    await newChat.save();

    return { 
      response: aiResponseText, 
      conversationId: finalConvId 
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
}