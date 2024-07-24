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
    organization: commonValidations.id.openapi({ example: '668d84f418a02e326034360d' }),
  }),
});

export const UpdateUserInviteSchema = z.object({
  params: z.object({ id: commonValidations.id }),
  body: z.object({
    expires_in: z.string().datetime().optional(),
    state: commonValidations.state,
    organization: commonValidations.id.optional().openapi({ example: '668d84f418a02e326034360d' }),
    hash: z.string().optional(),
  }),
});

export type PostUserInvite = z.infer<typeof PostUserInviteSchema.shape.body>;
export type UpdateUserInviteSchema = z.infer<typeof UpdateUserInviteSchema.shape.body>;
