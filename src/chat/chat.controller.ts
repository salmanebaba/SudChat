import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PromptRouterService } from '../router/prompt-router.service';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  async sendMessage(body: ChatDto) {
    // Placeholder for email extraction - In a real app, we get this from the request context/guard payload.
    const userEmail = 'user@example.com';
    const conversationId = body.conversationId;

    // 1. Fetch conversation history if provided
    let history: any[] = [];
    if (conversationId) {
        // We must fetch history to build context
        history = await this.chatService.getMessagesForConversation(userEmail, conversationId);
    }

    // 2. Call the refactored chat service method
    return this.chatService.sendMessage(userEmail, body.message, conversationId, history);
  }
}