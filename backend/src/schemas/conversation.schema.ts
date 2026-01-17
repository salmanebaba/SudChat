import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true })
  userEmail: string;

  @Prop({ required: true })
  title: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ userEmail: 1, createdAt: -1 });