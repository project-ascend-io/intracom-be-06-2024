import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const UserSchema = z.object({
  id: z.string().openapi({ example: '' }),
  email: z.string().email().openapi({ example: 'johndoe@example.com' }),
  username: z.string().openapi({ example: 'johndoe' }),
  password: z.string().openapi({ example: 'password' }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
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
