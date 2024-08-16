import mongoose, { Model, Schema } from 'mongoose';

import { Chat } from '@/api/chat/chatSchema';

const mongooseChatSchema = new Schema<Chat>(
  {
    chatName: { type: String, required: true },
    isChannel: { type: Boolean, required: true },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    chatAdmin: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const ChatModel: Model<Chat> = mongoose.model<Chat>('Chat', mongooseChatSchema);
