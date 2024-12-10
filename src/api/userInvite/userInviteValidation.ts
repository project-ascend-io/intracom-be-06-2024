import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

export const GetUserInviteSchema = z.object({
  params: z.object({ orgId: z.string() }),
  query: z.object({
    state: commonValidations.state.optional(),
    email: commonValidations.email.optional(),
  }),
});

export const GetUserInviteByHashSchema = z.object({
  params: z.object({ hash: z.string() }),
});

export const PostUserInviteSchema = z.object({
  params: z.object({ orgId: commonValidations.id }),
  body: z.object({
    emails: z.array(commonValidations.email).nonempty({ message: 'Emails array cannot be empty' }),
  }),
});

export type PostUserInviteParams = z.infer<typeof PostUserInviteSchema.shape.body>;

export const UpdateUserInviteByHashSchema = z.object({
  params: z.object({
    hash: z.string(),
  }),
  body: z.object({
    state: commonValidations.state,
  }),
});

export const UpdateUserInviteByIdSchema = z.object({
  params: z.object({
    id: commonValidations.id.optional(),
    orgId: commonValidations.id.optional(),
  }),
  body: z.object({
    state: commonValidations.state.optional(),
    email: commonValidations.email.optional(),
  }),
});

export const DeleteInviteByIdSchema = z.object({
  params: z.object({
    id: commonValidations.id.optional(),
    orgId: commonValidations.id.optional(),
  }),
});
