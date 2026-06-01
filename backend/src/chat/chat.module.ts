import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ChatController } from './chat.controller';
import { AdminController } from './admin.controller';
import { ChatService } from './chat.service';
import { OllamaService } from './ollama.service';
import { PromptRouterService } from './prompt-router.service';
import { Chat, ChatSchema } from '../schemas/chat.schema';
import { Conversation, ConversationSchema } from '../schemas/conversation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Conversation.name, schema: ConversationSchema }, 
    ]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [ChatController, AdminController],
  providers: [ChatService, OllamaService, PromptRouterService],
})
export class ChatModule {}