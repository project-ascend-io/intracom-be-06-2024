import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { ModelID } from '@/api/user/userSchema';

extendZodWithOpenApi(z);

export const OrganizationSchema = z.object({
  name: z.string().openapi({ example: 'Intracom Company' }),
  instanceUrl: z.string().url().openapi({ example: 'https://example.com/' }),
});

export const OrganizationComplete = OrganizationSchema.merge(ModelID);
export type Organization = z.infer<typeof OrganizationComplete>;
export type BasicOrganization = z.infer<typeof OrganizationSchema>;
