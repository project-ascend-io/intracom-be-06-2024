import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { pino } from 'pino';

import { authRouter } from '@/api/auth/authRouter';
import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import { organizationRouter } from '@/api/organization/organizationRouter';
import { userRouter } from '@/api/user/userRouter';
import { userInviteRouter } from '@/api/userInvite/userInviteRouter';
import { openAPIRouter } from '@/api-docs/openAPIRouter';
import { verifyAuthentication } from '@/common/middleware/authVerifier';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
import { env } from '@/common/utils/envConfig';
import { sessionConfiguration } from '@/common/utils/sessionConfig';

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

// Session Management Configurations
app.use(sessionConfiguration);

// Add authentication to entire route paths
organizationRouter.use(verifyAuthentication);

// Routes
app.use('/auth', authRouter);
app.use('/health-check', healthCheckRouter);
app.use('/organizations', organizationRouter);
app.use('/users', userRouter);
app.use('/user-invites', userInviteRouter);
app.use('/organizations', userInviteRouter);

// Swagger UI
app.use('/api-docs', openAPIRouter);

// Error handlers
app.use(errorHandler());

export { app, logger };
