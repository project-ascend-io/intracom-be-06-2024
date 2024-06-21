import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const commonValidations = {
  id: z
    .string()
    .refine((data) => ObjectId.isValid(data), 'id must be a valid ObjectId')
    .transform((data) => new ObjectId(data)),
  // ... other common validations
};
