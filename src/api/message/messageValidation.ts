import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

export const GetMessageSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const PostMessageSchema = z.object({
  body: z.object({
    sender: z.object({ _id: commonValidations.id }),
    content: z.string().openapi({ example: 'Hello, World!' }),
    chat: z.object({ _id: commonValidations.id }),
  }),
});

export type PostMessage = z.infer<typeof PostMessageSchema.shape.body>;
