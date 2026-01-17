import { Body, Controller, Post, Get, Param, UseGuards, Request, Logger, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMessage(@Request() req, @Body() body: { message: string; conversationId?: string }) {
    return this.chatService.sendMessage(req.user.email, body.message, body.conversationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getConversations(@Request() req, @Query('skip') skip = 0, @Query('limit') limit = 10) {
    this.logger.log(`Fetching conversations for ${req.user.email}`);
    return this.chatService.getUserConversations(req.user.email, skip, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:id')
  async getChatDetails(@Request() req, @Param('id') id: string) {
    this.logger.log(`Fetching messages for conversation ${id}`);
    return this.chatService.getMessagesForConversation(req.user.email, id);
  }
}