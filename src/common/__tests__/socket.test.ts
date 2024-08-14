import { Server } from 'socket.io';
import Client from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { env } from '@/common/utils/envConfig';
import { app, logger } from '@/server';
import { initializeSocket } from '@/socket';

describe('initializeSocket', () => {
  let server: ReturnType<typeof app.listen>;
  let clientSocket: ReturnType<typeof Client>;
  let io: Server;

  const userData = {
    _id: '66b13e327f172051683111be',
    name: 'John Doe',
    email: 'john@example.com',
    profilePic: 'https://gravatar.com/avatar/abc123',
  };

  beforeAll(async () => {
    server = app.listen(env.PORT);
    io = initializeSocket(server);
    clientSocket = Client(`http://localhost:${env.PORT}`);
  });

  afterAll(() => {
    io.close();
    server.close();
    clientSocket.close();
  });

  it('should set up the Socket.IO server', () => {
    expect(io).toBeDefined();
  });

  it('should handle the "connection" event', async () => {
    await new Promise<void>((resolve) => {
      clientSocket.on('connect', () => {
        expect(clientSocket.connected).toBeTruthy();
        resolve();
      });
    });
  });

  it('should handle the "setup" event', async () => {
    await new Promise<void>((resolve, reject) => {
      io.on('connection', (socket) => {
        socket.on('setup', (data) => {
          expect(data).toEqual(userData);
          socket.emit('connected');
        });

        socket.on('disconnect', () => {
          logger.info(`USER DISCONNECTED: ${socket}`);
          socket.leave(socket.data._id);
        });
      });

      clientSocket.emit('setup', userData);

      clientSocket.on('connected', () => {
        expect(clientSocket.connected).toBeTruthy();
      });

      clientSocket.disconnect();

      resolve();
      setTimeout(() => {
        reject(new Error('Timeout: Server did not receive disconnect event'));
      }, 5000);
    });
  });

  it('should handle the "join room" event', async () => {
    await new Promise<void>((resolve, reject) => {
      io.on('connection', (socket) => {
        socket.on('join room', (room) => {
          console.log(`User Joined Room: ${room}`);
          try {
            expect(room).toEqual('66906ca8fa6f594ee9c2d67b');
          } catch (error) {
            reject(error);
          }
        });
      });

      clientSocket.emit('join room', '66906ca8fa6f594ee9c2d67b');
      resolve();
    });
  });

  it('should handle the "test" event', async () => {
    clientSocket.emit('setup', userData);

    clientSocket.on('connected', () => {
      clientSocket.emit('test', 'Hello, World!');
    });

    clientSocket.on('test:received', (data) => {
      expect(data.message).toEqual('test received');
    });
  });

  it('should handle the "new message" event', async () => {
    const message = {
      sender: { _id: '66b13e327f172051683111be' },
      content: 'Just cleaning the house.',
      chat: {
        _id: '66b2b74fb9d060aa4d65ba7c',
        users: [{ _id: '66b13e327f172051683111be' }, { _id: '66906ca8fa6f594ee9c2d67b' }],
      },
    };

    clientSocket.emit('new message', message);

    clientSocket.on('message received', (data) => {
      expect(data).toEqual(message);
    });
  });
});
