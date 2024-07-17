import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

export const GetUserInviteSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const GetUserbyEmailInviteSchema = z.object({
  params: z.object({ email: commonValidations.email }),
});

export const PostUserInviteSchema = z.object({
  body: z.object({
    email: commonValidations.email,
    expires_in: z.string().datetime(),
    state: commonValidations.state,
    organization: commonValidations.id,
  }),
});

export type PostUserInvite = z.infer<typeof PostUserInviteSchema.shape.body>;
