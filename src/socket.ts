import { instrument } from '@socket.io/admin-ui';
import { ChangeStreamDocument } from 'mongodb';
import mongoose, { Document } from 'mongoose';
import { Server } from 'socket.io';

import { logger } from '@/server';

import { ChatModel } from './api/chat/chatModel';
import { MessageModel } from './api/message/messageModel';
import { mongoDatabase } from './api/mongoDatabase';
import { UserModel } from './api/user/userModel';
import { User } from './api/user/userSchema';

export const initializeSocket = (server: any) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: [`${process.env.CLIENT_SERVER}`, 'https://admin.socket.io'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  instrument(io, {
    auth: false,
    mode: 'development',
  });

  io.on('connection', (socket) => {
    logger.info(`connected ${socket.id}`);

    socket.on('setup', (userData) => {
      socket.join(userData._id);
      socket.data.username = userData.username;
      socket.emit('connected');
    });

    socket.on('join room', (room) => {
      socket.join(room._id);
      logger.info(`User Joined Room: ${room._id}`);
    });

    socket.on('leave room', (room) => {
      socket.leave(room._id);
      logger.info(`User Left Room: ${room._id}`);
    });

    socket.on('typing', (room) => socket.in(room._id).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room._id).emit('stop typing'));

    socket.on('disconnect', () => {
      logger.info(`USER DISCONNECTED: ${socket.data.username}`);
      socket.leave(socket.data._id);
    });

    socket.on('test', (data) => {
      logger.info(data);
      socket.emit('test:received', { message: 'test received' });
    });
  });

  const watchCollections = async () => {
    await mongoDatabase.initConnection();

    const database = mongoose.connection;

    const collections = ['chats', 'messages', 'users'];

    collections.forEach((collectionName) => {
      const collection = database.collection(collectionName);
      const options = { fullDocument: 'updateLookup' };
      const pipeline: Array<Document> = [];
      const changeStream = collection.watch(pipeline, options);

      changeStream.on('change', async (change: ChangeStreamDocument<any>) => {
        if (change.operationType === 'insert' || change.operationType === 'update') {
          const { fullDocument } = change;

          /* eslint-disable no-case-declarations */
          switch (collectionName) {
            case 'chats':
              const populatedChat = await ChatModel.populate(fullDocument, [
                { path: 'users', select: '_id username' },
                { path: 'lastMessage' },
              ]);

              if (populatedChat) {
                const usersInChat: User[] = await UserModel.find({ _id: { $in: populatedChat.users } });
                usersInChat.forEach((user) => {
                  io.to(`${user._id}`).emit('chats change', populatedChat);
                });
              }
              break;
            case 'messages':
              const populatedMessage = await MessageModel.populate(fullDocument, {
                path: 'sender',
                select: '_id username',
              });
              const chatMessageBelongsTo = await ChatModel.findById(populatedMessage.chat);

              if (chatMessageBelongsTo) {
                chatMessageBelongsTo.users.forEach((user) => {
                  io.to(`${user}`).emit('messages change', populatedMessage);
                });
              }
              break;
            case 'users':
              const filteredUserDocument = {
                _id: fullDocument._id,
                username: fullDocument.username,
              };
              io.emit(`${collectionName} change`, filteredUserDocument);
              break;
            default:
              logger.warn(`Unhandled collection: ${collectionName}`);
          }
          /* eslint-enable no-case-declarations */
        } else if (change.operationType === 'delete') {
          if (collectionName === 'chats') {
            // This will remove all messages that belong to the chat that was deleted
            await MessageModel.deleteMany({ chat: change.documentKey._id });
            io.emit(`${collectionName} delete`, change.documentKey._id);
          } else if (collectionName === 'messages') {
            const doesChatStillExist = await ChatModel.findById(change.documentKey._id);
            if (doesChatStillExist) {
              io.emit('messages delete', change.documentKey._id);
            }
          } else {
            io.emit(`${collectionName} delete`, change.documentKey._id);
          }
        }

        logger.info(`${change.operationType.toLocaleUpperCase()} change detected in ${collectionName}`);
      });
    });
  };

  watchCollections();

  return io;
};
