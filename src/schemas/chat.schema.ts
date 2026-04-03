import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from "mongoose"; 

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true }) 
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  response: string;

  @Prop()
  aiModel: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ userEmail: 1, conversationId: 1 });
ChatSchema.index({ conversationId: 1 });