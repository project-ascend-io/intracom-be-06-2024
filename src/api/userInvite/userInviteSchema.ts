import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

import { ModelID } from '../user/userSchema';

extendZodWithOpenApi(z);
export const UserInviteSchema = z.object({
  email: z.string().openapi({ example: 'janedoe@example.com' }),
  expires_in: z.string().datetime().openapi({ example: new Date().toISOString() }),
  accepted: z.boolean().openapi({ example: false }),
  organization: z.instanceof(ObjectId),
});

export const UserInviteCompleteSchema = UserInviteSchema.merge(ModelID);
export type UserInvite = z.infer<typeof UserInviteCompleteSchema>;
export type BasicUserInvite = z.infer<typeof UserInviteSchema>;
