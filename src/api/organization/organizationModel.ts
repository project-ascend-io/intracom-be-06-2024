import mongoose, { Model, Schema } from 'mongoose';

import { Organization } from '@/api/organization/organizationSchema';

const mongooseOrganizationSchema = new Schema<Organization>(
  {
    name: { type: String, required: true },
    instanceUrl: { type: String, required: true },
  },
  { timestamps: true }
);

export const OrganizationModel: Model<Organization> = mongoose.model<Organization>(
  'Organization',
  mongooseOrganizationSchema
);
