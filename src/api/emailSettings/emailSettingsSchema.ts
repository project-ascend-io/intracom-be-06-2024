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
  password: z.string().openapi({ example: 'securepassword' }),
  securityType: z.string().openapi({ example: 'TLS' }),
});

export const EmailSettingsSchema = z.object({
  _id: z.string().openapi({ example: '668f0c2ce629e80c6fa7ec7d' }),
  server: z.string().openapi({ example: 'http://www.localhost.com' }),
  port: z.number().openapi({ example: 5432 }),
  username: z.string().openapi({ example: 'root' }),
  password: z.string().openapi({ example: 'securepassword' }),
  securityType: z.string().openapi({ example: 'TLS' }),
});

export const EmailSettingsTestSchema = z.object({
  server: z.string().openapi({ example: 'http://www.localhost.com' }),
  port: z.number().openapi({ example: 5432 }),
  username: z.string().openapi({ example: 'root' }),
  password: z.string().openapi({ example: 'securepassword' }),
  securityType: z.string().openapi({ example: 'TLS' }),
  email: z.string().openapi({ example: 'email@example.com' }),
});

export type NewEmailSettings = z.infer<typeof NewEmailSettingsSchema>;
export type EmailSettings = z.infer<typeof EmailSettingsSchema>;
export type EmailSettingsTest = z.infer<typeof EmailSettingsTestSchema>;
