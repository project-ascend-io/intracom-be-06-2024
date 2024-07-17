import mongoose, { Model, Schema } from 'mongoose';

import { UserInvite } from './userInviteSchema';

export enum inviteState {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Denied = 'Denied',
  Expired = 'Expired',
}

const mongooseUserInviteSchema = new Schema<UserInvite>(
  {
    email: { type: String, required: true, unique: true },
    expires_in: { type: String, required: true },
    state: { type: String, enum: Object.values(inviteState), required: true },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  },
  { timestamps: true }
);
export const UserInviteModel: Model<UserInvite> = mongoose.model<UserInvite>('UserInvite', mongooseUserInviteSchema);
