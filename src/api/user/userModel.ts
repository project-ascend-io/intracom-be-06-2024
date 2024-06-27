import bcrypt from 'bcryptjs';
import mongoose, { Document, Model, Schema } from 'mongoose';

import { User } from '@/api/user/userSchema';

const mongooseUserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

mongooseUserSchema.pre<User & Document>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const UserModel: Model<User> = mongoose.model<User>('User', mongooseUserSchema);
