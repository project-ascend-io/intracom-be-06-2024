import mongoose, { Model, Schema } from 'mongoose';

import { EmailSettings } from '@/api/emailSettings/emailSettingsSchema';

const mongooseEmailSettingsSchema = new Schema<EmailSettings>(
  {
    server: { type: String, required: true },
    port: { type: Number, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    securityType: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const EmailSettingsModel: Model<EmailSettings> = mongoose.model<EmailSettings>(
  'EmailSettings',
  mongooseEmailSettingsSchema
);
