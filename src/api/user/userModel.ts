import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import bcrypt from 'bcryptjs';
import mongoose, { Document, Model, Schema } from 'mongoose';
import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

extendZodWithOpenApi(z);

export type User = z.infer<typeof UserSchema>;
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  age: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export const NewUserSchema = z.object({
  name: z.string().openapi({ example: 'John' }),
  email: z.string().openapi({ example: 'johndoe@example.com' }),
  password: z.string().openapi({ example: 'password' }),
  age: z.number().openapi({ example: 19 }),
});

// Input Validation for 'GET users/:id' endpoint
export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

const mongooseUserSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // This adds 'password' as a required field to the structure (or schema) for a user in the database
  password: { type: String, required: true },
  age: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// This hashes the password before saving it
mongooseUserSchema.pre<User & Document>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export const UserModel: Model<User> = mongoose.model<User>('User', mongooseUserSchema);
