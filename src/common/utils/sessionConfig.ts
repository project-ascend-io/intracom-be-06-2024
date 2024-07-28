import session from 'express-session';

import { env } from '@/common/utils/envConfig';

export const sessionConfiguration = session({
  secret: env.SESSION_SECRET.toString(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: false,
    maxAge: 60000 * 60 * 24 * 5, // 5 Days
  },
});
