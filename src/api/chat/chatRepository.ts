import { ChatModel } from '@/api/chat/chatModel';
import { Chat } from '@/api/chat/chatSchema';
import { UserModel } from '@/api/user/userModel';

import { mongoDatabase } from '../mongoDatabase';

export const chatRepository = {
  startConnection: async () => {
    const mongoDb = await mongoDatabase.initConnection();
    return mongoDb;
  },
  findAllAsync: async (id: string): Promise<Chat[] | null> => {
    try {
      await chatRepository.startConnection();
      let chats = await ChatModel.find({ users: { $elemMatch: { $eq: id } } })
        .populate('users', '-password')
        .populate('chatAdmin', '-password')
        .sort({ updatedAt: -1 });

      chats = (await UserModel.populate(chats, {
        path: 'users',
        select: 'username _id',
      })) as any;

      return chats;
    } catch (error) {
      console.error('Error finding chats with user id: ', error);
      throw error;
    }
  },
  accessChatAsync: async (recipientId: string, creatorId: string): Promise<Chat | null> => {
    try {
      await chatRepository.startConnection();
      let isChat = await ChatModel.find({
        isChannel: false,
        $and: [{ users: { $elemMatch: { $eq: recipientId } } }, { users: { $elemMatch: { $eq: creatorId } } }],
      }).populate('users', '-password');

      isChat = (await UserModel.populate(isChat, {
        path: 'users',
        select: 'username _id',
      })) as any;

      if (isChat.length > 0) {
        return isChat[0];
      } else {
        const personToChatWith = await UserModel.findOne({ _id: recipientId });

        const chatData = {
          chatName: personToChatWith?.username,
          isChannel: false,
          users: [recipientId, creatorId],
        };

        try {
          const createChat = new ChatModel(chatData);
          await createChat.save();

          const findChat = await ChatModel.findById(createChat._id);

          if (!findChat) {
            throw new Error('Chat not found');
          }

          return findChat;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error accessing chat: ', error);
      throw error;
    }
  },
};
