import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';

import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import { organizationRouter } from '@/api/organization/organizationRouter';
import { userRouter } from '@/api/user/userRouter';
import { userInviteRouter } from '@/api/userInvite/userInviteRouter';
import { openAPIRouter } from '@/api-docs/openAPIRouter';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
import { env } from '@/common/utils/envConfig';

const logger = pino({ name: 'server start' });
const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimiter);

// Request logging
app.use(requestLogger);

// Routes
app.use('/health-check', healthCheckRouter);
app.use('/organizations', organizationRouter);
app.use('/users', userRouter);
app.use('/user-invites', userInviteRouter);
app.use('/user-invites/email', userInviteRouter);
app.use('/user-invites/id', userInviteRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
