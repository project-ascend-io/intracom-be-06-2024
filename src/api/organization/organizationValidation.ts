import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

export const PostOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(5, 'Organization Name must be 5 characters or longer.'),
  }),
});

export const GetOrganizationSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});
