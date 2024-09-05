import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

export const GetMessageSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const PostMessageSchema = z.object({
  body: z.object({
    sender: commonValidations.id,
    content: z.string(),
    chat: commonValidations.id,
  }),
});

export type PostMessage = z.infer<typeof PostMessageSchema.shape.body>;
