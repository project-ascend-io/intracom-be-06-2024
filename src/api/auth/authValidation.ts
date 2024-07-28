import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

export const LoginSchema = z.object({
  body: z.object({
    email: commonValidations.email,
    password: z.string(),
  }),
});

export type LoginCredentials = z.infer<typeof LoginSchema.shape.body>;
