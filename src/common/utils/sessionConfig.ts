import session from 'express-session';

import { env } from '@/common/utils/envConfig';
const { SESSION_HTTP_ONLY, SESSION_SECRET, SESSION_SECURE } = env;

export const sessionConfiguration = session({
  secret: SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: SESSION_SECURE as boolean,
    httpOnly: SESSION_HTTP_ONLY as boolean,
    maxAge: 60000 * 60 * 24 * 5, // 5 Days
  },
});
