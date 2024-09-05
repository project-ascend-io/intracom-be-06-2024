import { MessageModel } from '@/api/message/messageModel';

import { mongoDatabase } from '../mongoDatabase';
import { Message, NewMessage } from './messageSchema';

export const messageRepository = {
  startConnection: async () => {
    const mongoDb = await mongoDatabase.initConnection();
    return mongoDb;
  },

  findByIdAsync: async (id: string): Promise<Message[] | null> => {
    try {
      await messageRepository.startConnection();
      const messages = await MessageModel.find({ chat: id }).populate('sender', 'username').populate('chat', '_id');
      return messages;
    } catch (err) {
      console.error('Error finding messages with chat id: ', err);
      throw err;
    }
  },

  insertMessageAsync: async (message: NewMessage): Promise<Message | null> => {
    try {
      await messageRepository.startConnection();
      const newMessage = new MessageModel(message);
      await newMessage.save();
      const findMessage = await MessageModel.findById(newMessage._id)
        .populate('sender', 'username')
        .populate('chat', '_id');

      if (!findMessage) {
        throw new Error('Message not found');
      }

      return findMessage;
    } catch (err) {
      console.error('Error inserting message: ', err);
      throw err;
    }
  },
};
