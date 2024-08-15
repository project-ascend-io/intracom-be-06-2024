// socket.ts
import { Server } from 'socket.io';

import { logger } from '@/server';

export const initializeSocket = (server: any) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: 'http://localhost:9000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`connected ${socket.id}`);

    socket.on('setup', (userData) => {
      socket['data'] = userData;
      socket.join(userData._id);
      socket.emit('connected');
    });

    socket.on('join room', (room) => {
      socket.join(room);
      logger.info(`User Joined Room: ${room}`);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('new message', (newMessage) => {
      const chat = newMessage.chat;
      if (!chat.users) return logger.info('chat.users not defined');

      chat.users.forEach((user: any) => {
        if (user._id === newMessage.sender._id) return;
        socket.in(user._id).emit('message received', newMessage);
      });
    });

    socket.on('disconnect', () => {
      logger.info(`USER DISCONNECTED: ${socket}`);
      socket.leave(socket.data._id);
    });

    socket.on('test', (data) => {
      logger.info(data);
      socket.emit('test:received', { message: 'test received' });
    });
  });

  return io;
};