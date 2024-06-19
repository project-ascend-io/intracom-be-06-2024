import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import mongoose, { Model, Schema } from 'mongoose';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type BillingAddress = z.infer<typeof BillingAddressSchema>;
export const BillingAddressSchema = z.object({
  streetAddress: z
    .string({
      required_error: 'Street Address is required',
    })
    .trim()
    .min(1, 'Street Address cannot be empty'),
  city: z
    .string({
      required_error: 'City is required',
    })
    .trim()
    .min(1, 'City cannot be empty'),
  state: z
    .string({
      required_error: 'State is required',
    })
    .trim()
    .min(1, 'State cannot be empty'),
  postalCode: z
    .string({
      required_error: 'Postal Code is required',
    })
    .trim()
    .min(5, 'Invalid postal code format. Postal Code should be at least 5 characters'),
  country: z
    .string({
      required_error: 'Country is required',
    })
    .trim()
    .min(1, 'Country cannot be empty'),
});
export const NewBillingAddressSchema = z.object({
  streetAddress: z.string().openapi({ example: '28756 SE 45th St' }),
  city: z.string().openapi({ example: 'Seattle' }),
  state: z.string().openapi({ example: 'WA' }),
  postalCode: z.string().openapi({ example: '98004' }),
  country: z.string().openapi({ example: 'USA' }),
});

const mongooseBillingAddressSchema = new Schema<BillingAddress>({
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

export const BillingAddressModel: Model<BillingAddress> = mongoose.model<BillingAddress>(
  'BillingAddress',
  mongooseBillingAddressSchema
);
