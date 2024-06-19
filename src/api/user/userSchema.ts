import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  username: z.string(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const NewUserSchema = z.object({
  email: z.string().openapi({ example: 'johndoe@example.com' }),
  username: z.string().openapi({ example: 'johndoe' }),
  password: z.string().openapi({ example: 'password' }),
});

export interface INewUserSchema {
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export type User = z.infer<typeof UserSchema>;
