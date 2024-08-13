import { env } from '@/common/utils/envConfig';
import { app, logger } from '@/server';

import { initializeSocket } from './socket';

const server = app.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT, SESSION_SECRET } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);

  if (SESSION_SECRET) {
    logger.info('Session Secret has been created and is working');
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _io = initializeSocket(server);

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
