import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

export const GetUserInviteSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const PostUserInviteSchema = z.object({
  body: z.object({
    email: commonValidations.email,
    organization: commonValidations.id,
  }),
});

export type PostUserInvite = z.infer<typeof PostUserInviteSchema.shape.body>;