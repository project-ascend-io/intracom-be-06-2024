import { z } from 'zod';

export const PostOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(5, 'Organization Name must be 5 characters or longer.'),
  }),
});
