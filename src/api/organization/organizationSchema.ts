import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import mongoose from 'mongoose';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const OrganizationSchema = z.object({
  id: z.string().openapi({ example: new mongoose.mongo.ObjectId().toString() }),
  name: z.string().openapi({ example: 'Intracom Company' }),
  createdAt: z.date().openapi({ example: new Date().toISOString() }),
  updatedAt: z.date().openapi({ example: new Date().toISOString() }),
});

export const NewOrganizationSchema = z.object({
  name: z.string().openapi({ example: 'Holding Company' }),
});

export type Organization = z.infer<typeof OrganizationSchema>;
