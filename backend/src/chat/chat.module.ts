import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat, ChatSchema } from '../schemas/chat.schema';
import { Conversation, ConversationSchema } from '../schemas/conversation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Conversation.name, schema: ConversationSchema }, 
    ]),
    HttpModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}