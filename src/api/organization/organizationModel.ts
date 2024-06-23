import mongoose, { Model, Schema } from 'mongoose';

import { Organization } from '@/api/organization/organizationSchema';

const mongooseOrganizationSchema = new Schema<Organization>({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const OrganizationModel: Model<Organization> = mongoose.model<Organization>(
  'Organization',
  mongooseOrganizationSchema
);
