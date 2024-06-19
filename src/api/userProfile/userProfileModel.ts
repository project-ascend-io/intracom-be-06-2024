import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import mongoose, { Model, Schema } from 'mongoose';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export type UserProfile = z.infer<typeof UserProfileSchema>;
export const UserProfileSchema = z.object({
  userId: z.number(),
  fullName: z.string(),
  bio: z.string().optional(),
  location: z.string().optional(),
  timeZone: z.string().optional(),
  statusMessage: z.string().optional(),
});
export const NewUserProfileSchema = z.object({
  userId: z.number().openapi({ example: 2 }),
  fullName: z.string().openapi({ example: 'Mike Wasowski' }),
  bio: z.string().optional().openapi({ example: 'Hello world!' }),
  location: z.string().optional().openapi({ example: 'Monstropolis' }),
  timeZone: z.string().optional().openapi({ example: 'PST' }),
  statusMessage: z.string().optional().openapi({ example: 'Hello, World!' }),
});

// Input Validation for 'GET userProfiles/:id' endpoint
export const GetUserProfileSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

const mongooseUserProfileSchema = new Schema<UserProfile>({
  userId: { type: Number, required: true },
  fullName: { type: String, required: true, unique: true },
  bio: { type: String, required: false, default: '' },
  location: { type: String, required: false, default: '' },
  timeZone: { type: String, required: false, default: '' },
  statusMessage: { type: String, required: false, default: '' },
});

export const UserProfileModel: Model<UserProfile> = mongoose.model<UserProfile>(
  'UserProfile',
  mongooseUserProfileSchema
);
