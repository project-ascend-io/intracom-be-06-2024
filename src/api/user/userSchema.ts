import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import mongoose from 'mongoose';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const ModelID = z.object({
  id: z.string().openapi({ example: new mongoose.mongo.ObjectId().toString() }),
});

export const ModelDates = z.object({
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const UserSchema = z.object({
  email: z.string().openapi({ example: 'johndoe@example.com' }),
  username: z.string().openapi({ example: 'johndoe' }),
  password: z.string().openapi({ example: 'password' }),
  organization: z.string().openapi({ example: 'Example Corp' }),
});

export const UserResponseSchema = z
  .object({
    email: z.string().openapi({ example: 'johndoe@example.com' }),
    username: z.string().openapi({ example: 'johndoe' }),
    organization_id: z.string().openapi({ example: new mongoose.mongo.ObjectId().toString() }),
  })
  .merge(ModelID)
  .merge(ModelDates);

export const UserWithDates = UserSchema.merge(ModelDates);
export const UserComplete = UserSchema.merge(ModelID).merge(ModelDates);
export type User = z.infer<typeof UserComplete>;
export type BasicUser = z.infer<typeof UserSchema>;
export type UserAndDates = z.infer<typeof UserWithDates>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
