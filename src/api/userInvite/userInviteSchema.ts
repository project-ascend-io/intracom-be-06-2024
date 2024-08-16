import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { z } from 'zod';

import { OrganizationComplete } from '@/api/organization/organizationSchema';

import { ModelID } from '../user/userSchema';
import { inviteState } from '../userInvite/userInviteModel';

export const inviteStateArray = Object.values(inviteState) as [string, ...string[]];

extendZodWithOpenApi(z);

export const BaseUserInviteSchema = z.object({
  email: z.string().openapi({ example: 'janedoe@example.com' }),
  expires_in: z.string().datetime().openapi({ example: new Date().toISOString() }),
  state: z.enum(inviteStateArray).openapi({ example: inviteState.Accepted }),
  hash: z.string().openapi({ example: 'fc301deeccdf7b70d2864674116ba4f5f9609dddcc90576d172128fbccd4b5b5' }),
});

export const UserInviteSchema = z
  .object({
    organization: OrganizationComplete,
  })
  .merge(BaseUserInviteSchema);

export const CreateUserInviteSchema = z
  .object({
    organization: z
      .string()
      .refine((value) => ObjectId.isValid(value), {
        message: 'Invalid ObjectId string',
      })
      .openapi({ example: new mongoose.mongo.ObjectId().toString() }),
  })
  .merge(BaseUserInviteSchema);

export const UserInviteCompleteSchema = UserInviteSchema.merge(ModelID);
export type UserInvite = z.infer<typeof UserInviteCompleteSchema>;
export type CreateUserInvite = z.infer<typeof CreateUserInviteSchema>;
