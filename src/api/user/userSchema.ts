import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const ModelID = z.object({
  _id: z.instanceof(ObjectId),
});

export const ModelDates = z.object({
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const UserSchema = z.object({
  email: z.string().openapi({ example: 'johndoe@example.com' }),
  username: z.string().openapi({ example: 'johndoe' }),
  password: z.string().openapi({ example: 'password' }),
  organization: z.instanceof(ObjectId),
});

export const UserResponseSchema = z
  .object({
    email: z.string().openapi({ example: 'johndoe@example.com' }),
    username: z.string().openapi({ example: 'johndoe' }),
    organization: z.instanceof(ObjectId),
  })
  .merge(ModelID)
  .merge(ModelDates);

export const UserWithDatesSchema = UserSchema.merge(ModelDates);
export const UserCompleteSchema = UserSchema.merge(ModelID).merge(ModelDates);
export type User = z.infer<typeof UserCompleteSchema>;
export type BasicUser = z.infer<typeof UserSchema>;
export type UserWithDates = z.infer<typeof UserWithDatesSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
