import mongoose, { Model, Schema } from 'mongoose';

import { Message } from '@/api/message/messageSchema';

const mongooseMessageSchema = new Schema<Message>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, trim: true, required: true },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
  },
  { timestamps: true }
);

export const MessageModel: Model<Message> = mongoose.model<Message>('Message', mongooseMessageSchema);
