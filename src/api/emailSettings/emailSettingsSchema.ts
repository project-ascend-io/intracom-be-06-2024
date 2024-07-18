import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const ModelID = z.object({
  _id: z.instanceof(ObjectId),
});

export const NewEmailSettingsSchema = z.object({
  server: z.string().openapi({ example: 'http://www.localhost.com' }),
  port: z.number().openapi({ example: 5432 }),
  username: z.string().openapi({ example: 'root' }),
  password: z.string().openapi({ example: 'apikey' }),
  securityType: z.string().openapi({ example: 'TLS' }),
  organization: z.string().openapi({ example: '668f0c2ce629' }),
});

export const EmailSettingsSchema = z.object({
  _id: z.string().openapi({ example: '668f0c2ce629e80c6fa7ec7d' }),
  server: z.string().openapi({ example: 'http://www.localhost.com' }),
  port: z.number().openapi({ example: 5432 }),
  username: z.string().openapi({ example: 'root' }),
  password: z.string().openapi({ example: 'securepassword' }),
  securityType: z.string().openapi({ example: 'TLS' }),
  organization: z.string().openapi({ example: '668f0c2ce629' }),
});

export const EmailSettingsTestSchema = z.object({
  server: z.string().openapi({ example: 'http://www.localhost.com' }),
  port: z.number().openapi({ example: 5432 }),
  username: z.string().openapi({ example: 'root' }),
  password: z.string().openapi({ example: 'securepassword' }),
  securityType: z.string().openapi({ example: 'TLS' }),
  email: z.string().openapi({ example: 'email@example.com' }),
});

export const EmailSettingsTestResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  message: z.string().openapi({ example: 'Email Settings found' }),
  responseObject: z.null().openapi({ example: null }),
  statusCode: z.number().openapi({ example: 200 }),
});

export type EmailSettingsTestResponse = z.infer<typeof EmailSettingsTestResponseSchema>;
export type NewEmailSettings = z.infer<typeof NewEmailSettingsSchema>;
export type EmailSettings = z.infer<typeof EmailSettingsSchema>;
export type EmailSettingsTest = z.infer<typeof EmailSettingsTestSchema>;
