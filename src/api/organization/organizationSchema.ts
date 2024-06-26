import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

import { ModelDates, ModelID } from '@/api/user/userSchema';

extendZodWithOpenApi(z);

export const OrganizationSchema = z.object({
  name: z.string().openapi({ example: 'Intracom Company' }),
});

export const OrganizationComplete = OrganizationSchema.merge(ModelID).merge(ModelDates);
export type Organization = z.infer<typeof OrganizationComplete>;
export type BasicOrganization = z.infer<typeof OrganizationSchema>;
