import { instrument } from '@socket.io/admin-ui';
import { Server } from 'socket.io';

import { logger } from '@/server';
import { mongoDatabase } from './api/mongoDatabase';
import mongoose, { Document } from 'mongoose';
import { ChangeStreamDocument } from 'mongodb'
import { ChatModel } from './api/chat/chatModel';
import { MessageModel } from './api/message/messageModel';
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
      const options = { fullDocument: "updateLookup" };
      const pipeline: Array<Document> = [];
      const changeStream = collection.watch(pipeline, options);

      changeStream.on('change', async (change: ChangeStreamDocument<any>) => {

        if ((change.operationType === 'insert' || change.operationType === 'update')) {
          const { fullDocument } = change;

          switch (collectionName) {
            case 'chats':
              const populatedChat = await ChatModel.populate(fullDocument, { path: 'users', select: '-password' });

              if (populatedChat) {
                const usersInChat: User[] = await UserModel.find({ _id: { $in: populatedChat.users } });
                usersInChat.forEach((user) => {
                  io.to(`${user._id}`).emit("chats change", populatedChat);
                });
              }
              break;
            case 'messages':
              const populatedMessage = await MessageModel.populate(fullDocument, { path: 'sender', select: '-password' });
              const chatMessageBelongsTo = await ChatModel.findById(populatedMessage.chat);

              if (chatMessageBelongsTo) {
                chatMessageBelongsTo.users.forEach((user) => {
                  io.to(`${user}`).emit("messages change", populatedMessage);
                });
              }
              break;
            case 'users':
              io.emit(`${collectionName} change`, fullDocument);
              break;
            default:
              logger.warn(`Unhandled collection: ${collectionName}`)
          }

        } else if (change.operationType === 'delete') {
          io.emit(`${collectionName} delete`, change.documentKey._id);
        }

        logger.info(`${change.operationType.toLocaleUpperCase()} change detected in ${collectionName}`);
      })
    })
  }

  watchCollections();

  return io;
};
