import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

import { ModelID } from '../user/userSchema';
import { inviteState } from '../userInvite/userInviteModel';

export const inviteStateArray = Object.values(inviteState) as [string, ...string[]];

extendZodWithOpenApi(z);
export const UserInviteSchema = z.object({
  email: z.string().openapi({ example: 'janedoe@example.com' }),
  expires_in: z.string().datetime().openapi({ example: new Date().toISOString() }),
  state: z.enum(inviteStateArray).openapi({ example: inviteState.Accepted }),
  organization: z
    .object({
      name: z.string().openapi('Research Corp.'),
      _id: z.instanceof(ObjectId),
    })
    .merge(ModelID),
  hash: z.string().openapi({ example: 'fc301deeccdf7b70d2864674116ba4f5f9609dddcc90576d172128fbccd4b5b5' }),
});

export const UserInviteCompleteSchema = UserInviteSchema.merge(ModelID);
export type UserInvite = z.infer<typeof UserInviteCompleteSchema>;
export type BasicUserInvite = z.infer<typeof UserInviteSchema>;
