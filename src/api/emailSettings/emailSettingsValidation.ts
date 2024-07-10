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
  }),
});

export type PostEmailSettings = z.infer<typeof PostEmailSettingsSchema.shape.body>;
