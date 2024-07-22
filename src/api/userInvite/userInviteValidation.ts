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
    organization: commonValidations.id,
  }),
});

export const UpdateUserInviteSchema = z.object({
  body: z.object({
    email: commonValidations.email.optional(),
    expires_in: z.string().datetime().optional(),
    state: commonValidations.state.optional(),
    organization: commonValidations.id.optional(),
    hash: z.string().optional(),
  }),
});

export type PostUserInvite = z.infer<typeof PostUserInviteSchema.shape.body>;
export type UpdateUserInviteSchema = z.infer<typeof UpdateUserInviteSchema.shape.body>;
