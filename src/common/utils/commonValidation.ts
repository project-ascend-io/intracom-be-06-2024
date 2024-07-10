import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const commonValidations = {
  id: z
    .string()
    .refine((data) => ObjectId.isValid(data), 'id must be a valid ObjectId')
    .transform((data) => new ObjectId(data)),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  organization: z.string().min(1, "Please enter your organization's name"),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
};
