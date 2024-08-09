import MongoStore from 'connect-mongo';
import session from 'express-session';

import { env } from '@/common/utils/envConfig';

const { SESSION_HTTP_ONLY, SESSION_SECRET, SESSION_SECURE, MONGODB_CONNECTION_STRING } = env;

const sessionStore = MongoStore.create({
  mongoUrl: MONGODB_CONNECTION_STRING as string,
  collectionName: 'sessions',
});

export const sessionConfiguration = session({
  secret: SESSION_SECRET as string,
  resave: true,
  rolling: true,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: SESSION_SECURE as boolean,
    httpOnly: SESSION_HTTP_ONLY as boolean,
    maxAge: 60000 * 60 * 24 * 5, // 5 Days
  },
});
