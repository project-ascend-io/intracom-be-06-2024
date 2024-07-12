import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

export const GetEmailSettingsSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const PostEmailSettingsSchema = z.object({
  body: z.object({
    server: z.string().openapi({ example: 'http://www.localhost.com' }),
    port: z.number().openapi({ example: 5432 }),
    username: z.string().openapi({ example: 'root' }),
    password: z.string().openapi({ example: 'apikey' }),
    securityType: z.string().openapi({ example: 'TLS' }),
    organization: commonValidations.organization,
  }),
});

export const PostEmailSettingsTestSchema = z.object({
  body: z.object({
    server: z.string().openapi({ example: 'http://www.localhost.com' }),
    port: z.number().openapi({ example: 5432 }),
    username: z.string().openapi({ example: 'root' }),
    password: z.string().openapi({ example: 'apikey' }),
    securityType: z.string().openapi({ example: 'TLS' }),
    email: z.string().openapi({ example: 'example@email.com' }),
  }),
});

export type PostEmailSettingsTest = z.infer<typeof PostEmailSettingsTestSchema.shape.body>;
export type PostEmailSettings = z.infer<typeof PostEmailSettingsSchema.shape.body>;
