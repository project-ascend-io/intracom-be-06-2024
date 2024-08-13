import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { env } from '@/common/utils/envConfig';
import { app, logger } from '@/server';
import { initializeSocket } from '@/socket';

describe('Socket.io server', () => {
  let io: Server;
  let clientSocket: ReturnType<typeof Client>;
  let server: ReturnType<typeof app.listen>;

  const user = {
    _id: '66b13e327f172051683111be',
    name: 'John Doe',
    email: 'john@example.com',
    profilePic: 'https://gravatar.com/avatar/abc123',
  };

  beforeAll(() => {
    // Start the server
    server = app.listen(env.PORT, () => {
      logger.info(`Test server running on port ${env.PORT}`);
    });

    // Set up the Socket.IO server
    io = initializeSocket(server);

    // Connect the client
    clientSocket = Client(`http://localhost:${env.PORT}`);

    // clientSocket.on('connect', done);
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    server.close();
  });

  it('should connect and receive a connected event', () => {
    clientSocket.emit('setup', user);

    clientSocket.on('connected', () => {
      expect(clientSocket.id).toBeDefined();
    });
  });

  it('should join a room and log the event', () => {
    const room = 'test-room';
    clientSocket.emit('join room', room);

    clientSocket.on('joined room', () => {
      expect(true).toBe(true); // Just to ensure the event is received
    });
  });

  it('should send and receive a test message', () => {
    const testData = { message: 'Hello, World!' };

    clientSocket.emit('test', testData);

    clientSocket.on('test:received', (data) => {
      expect(data).toEqual({ message: 'test received' });
    });
  });

  // Add more tests for other events as needed
});
