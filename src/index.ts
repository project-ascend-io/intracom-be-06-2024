import { Server } from 'socket.io';

import { env } from '@/common/utils/envConfig';
import { app, logger } from '@/server';

const server = app.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT, SESSION_SECRET } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);

  if (SESSION_SECRET) {
    logger.info('Session Secret has been created and is working');
  }
});

// Socket.IO Server Connection
const io = new Server(server, {});

io.on('connection', (socket) => {
  logger.info(`connected ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`disconnected ${socket.id}`);
  });

  socket.on('test', (data) => {
    logger.info(data);
    io.emit('test:received', { message: 'test received' });
  });
});

const onCloseSignal = () => {
  logger.info('sigint received, shutting down');
  server.close(() => {
    logger.info('server closed');
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);
