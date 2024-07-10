import mongoose, { Model, Schema } from 'mongoose';

import { UserInvite } from './userInviteSchema';

const mongooseUserInviteSchema = new Schema<UserInvite>(
  {
    email: { type: String, required: true, unique: true },
    expires_in: { type: String, required: true },
    accepted: { type: Boolean, required: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  },
  { timestamps: true }
);
export const UserInviteModel: Model<UserInvite> = mongoose.model<UserInvite>('UserInvite', mongooseUserInviteSchema);
