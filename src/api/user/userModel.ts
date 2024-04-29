import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import mongoose, { Model, Schema } from 'mongoose';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  age: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const NewUserSchema = z.object({
  name: z.string().openapi({ example: 'John' }),
  email: z.string().openapi({ example: 'johndoe@example.com' }),
  age: z.number().openapi({ example: 19 }),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

const mongooseUserSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const UserModel: Model<User> = mongoose.model<User>('User', mongooseUserSchema);
