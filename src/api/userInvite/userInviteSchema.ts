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
  // organization: z.instanceof(ObjectId),
  organization: z.instanceof(ObjectId).openapi({ example: new ObjectId('668d84f418a02e326034360d') }),
});

export const UserInviteCompleteSchema = UserInviteSchema.merge(ModelID);
export type UserInvite = z.infer<typeof UserInviteCompleteSchema>;
export type BasicUserInvite = z.infer<typeof UserInviteSchema>;
