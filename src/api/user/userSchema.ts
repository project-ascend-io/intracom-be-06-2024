import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

import { userRoles } from './userModel';

extendZodWithOpenApi(z);

export const ModelID = z.object({
  _id: z.instanceof(ObjectId),
});

export const userRolesArray = Object.values(userRoles) as [string, ...string[]];

export const UserSchema = z.object({
  email: z.string().openapi({ example: 'johndoe@example.com' }),
  username: z.string().openapi({ example: 'johndoe' }),
  password: z.string().openapi({ example: 'password' }),
  organization: z.instanceof(ObjectId),
  role: z.enum(userRolesArray).openapi({ example: userRoles.Admin }),
});

export const UserResponseSchema = z
  .object({
    email: z.string().openapi({ example: 'johndoe@example.com' }),
    username: z.string().openapi({ example: 'johndoe' }),
    organization: z
      .object({
        name: z.string().openapi('Research Corp.'),
      })
      .merge(ModelID),
    role: z.enum(userRolesArray).openapi({ example: userRoles.Admin }),
  })
  .merge(ModelID);

export const UserCompleteSchema = UserSchema.merge(ModelID);
export type User = z.infer<typeof UserCompleteSchema>;
export type BasicUser = z.infer<typeof UserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
