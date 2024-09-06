import MongoStore from 'connect-mongo';
import session from 'express-session';

import { env } from '@/common/utils/envConfig';

const { SESSION_HTTP_ONLY, SESSION_SECRET, SESSION_SECURE, MONGODB_CONNECTION_STRING, NODE_ENV } = env;

/**
 * Undefined is defaulted to MemoryStore.
 * MemoryStore is required for CICD Testing on the providers side(i.e. Github Pipelines)
 */
let sessionStore = undefined;

if (NODE_ENV !== 'test') {
  sessionStore = MongoStore.create({
    mongoUrl: MONGODB_CONNECTION_STRING as string,
    collectionName: 'sessions',
  });
}

export const sessionConfiguration = session({
  secret: SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: SESSION_SECURE as boolean,
    httpOnly: SESSION_HTTP_ONLY as boolean,
    maxAge: 60000 * 60 * 24 * 5, // 5 Days
  },
});
