import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import mongoose, { Model, Schema } from 'mongoose';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export type EmailSettings = z.infer<typeof EmailSettingsSchema>;
export const EmailSettingsSchema = z.object({
  server: z.string(),
  port: z.number(),
  username: z.string(),
  password: z.string(),
  securityType: z.string(),
});

export const NewEmailSettingsSchema = z.object({
  server: z.string().openapi({ example: 'http://www.localhost.com' }),
  port: z.number().openapi({ example: 5432 }),
  username: z.string().openapi({ example: 'root' }),
  password: z.string().openapi({ example: 'securepassword' }),
  securityType: z.string().openapi({ example: 'TLS' }),
});

export const GetEmailSettingsSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

const mongooseEmailSettingsSchema = new Schema<EmailSettings>({
  server: { type: String, required: true },
  port: { type: Number, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  securityType: { type: String, required: true },
});

export const EmailSettingsModel: Model<EmailSettings> = mongoose.model<EmailSettings>(
  'EmailSettings',
  mongooseEmailSettingsSchema
);
