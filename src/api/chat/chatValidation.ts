import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

export const GetChatSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const PostChatSchema = z.object({
  body: z.object({
    recipientId: commonValidations.id,
    creatorId: commonValidations.id,
  }),
});

export type PostChat = z.infer<typeof PostChatSchema>;
