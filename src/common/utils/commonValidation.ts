import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const commonValidations = {
  _id: z
    .string()
    .refine((data) => ObjectId.isValid(data), '_id must be a valid ObjectId')
    .transform((data) => new ObjectId(data)),
  // ... other common validations
};
