import dotenv from 'dotenv';
import session from 'express-session';

import { env } from '@/common/utils/envConfig';
import { app, logger } from '@/server';

import { isAuthenticated } from './middleware/auth';

// This loads environment variables from the .env file
dotenv.config();

// This is the secret used to sign session cookies
const sessionSecret = process.env.SESSION_SECRET;

// Session Setup
app.use(
  session({
    // This holds the secret key for a session
    secret: sessionSecret,
    // This forces a session to be saved back to the session store
    resave: true,
    // This forces a session that is "uninitialized" to be saved to the store
    saveUninitialized: true,
    cookie: {
      // Use secure cookies in production
      // secure: process.env.NODE_ENV === 'production',
      secure: false,
      // This helps mitigate XSS attacks
      httpOnly: true,
      // this sets the cookie to expire in 1 minute
      maxAge: 60000,
    },
  })
);

// This is the route handler for "/"
app.get('/', (req, res) => {
  // This sets the session variable 'name' to 'User Session'
  (req.session as any).name = 'User Session';
  // This sends a response to the client with the message "Session Set"
  return res.send('Session Set');
});

// This is the route handler for "/session"
app.get('/session', (req, res) => {
  // This retrieves the value of the session variable 'name' ('User Session') from the session object
  const name = (req.session as any).name;
  // This sends a response to the client with the value stored in 'name'
  return res.send(name);

  // This destroys the current session, removing all session data associated with the client
  // req.session.destroy(function(error){
  //   console.log("Session Destroyed");
  // });
});

// This is the route handler for "/protected route
app.get('/protected', isAuthenticated, (req, res) => {
  return res.send('This is a protected route');
});

const server = app.listen(env.PORT, () => {
  const { NODE_ENV, HOST, PORT, SESSION_SECRET } = env;
  logger.info(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);

  if (SESSION_SECRET) {
    logger.info('Session Secret has been created and is working');
  }
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
