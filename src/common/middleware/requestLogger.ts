import { randomUUID } from 'crypto';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { env } from '@/common/utils/envConfig';

enum LogLevel {
  Fatal = 'fatal',
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
  Trace = 'trace',
  Silent = 'silent',
}

const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: 'logs/requests-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for the last 14 days
      zippedArchive: true, // Compress old log files
    }),
  ],
});

const genReqId = (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
  const existingID = (req as any).id ?? req.headers['x-request-id'];
  if (existingID) return existingID;
  const id = randomUUID();
  res.setHeader('X-Request-Id', id);
  return id;
};

const requestLogger: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const reqId = genReqId(req, res);
  const startTime = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const timeTaken = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);

    const logLevel = customLogLevel(req, res);
    const successMessage = customSuccessMessage(req, res);

    const logInfo = {
      requestId: reqId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      timeTaken,
      responseBody: res.locals.responseBody,
    };

    logger.log({
      level: logLevel,
      message: successMessage,
      ...logInfo,
    });
  });

  next();
};

const responseBodyMiddleware: RequestHandler = (req, res, next) => {
  if (!env.isProduction) {
    const originalSend = res.send;
    res.send = function (content) {
      res.locals.responseBody = content;
      res.send = originalSend;
      return originalSend.call(res, content);
    };
  }
  next();
};

const customLogLevel = (_req: IncomingMessage, res: Response, err?: Error): LogLevel => {
  if (err || res.statusCode >= StatusCodes.INTERNAL_SERVER_ERROR) return LogLevel.Error;
  if (res.statusCode >= StatusCodes.BAD_REQUEST) return LogLevel.Warn;
  if (res.statusCode >= StatusCodes.MULTIPLE_CHOICES) return LogLevel.Silent;
  return LogLevel.Info;
};

const customSuccessMessage = (req: IncomingMessage, res: Response): string => {
  if (res.statusCode === StatusCodes.NOT_FOUND) return getReasonPhrase(StatusCodes.NOT_FOUND);
  return `${req.method} completed`;
};

export default [responseBodyMiddleware, requestLogger];
