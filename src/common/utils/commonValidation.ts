import { ObjectId } from 'mongodb';
import { z } from 'zod';

import { userRolesArray } from '../../api/user/userSchema';
import { inviteStateArray } from '../../api/userInvite/userInviteSchema';

export const commonValidations = {
  id: z
    .string()
    .refine((data) => ObjectId.isValid(data), 'id must be a valid ObjectId')
    .transform((data) => new ObjectId(data)),
  email: z.string().email({ message: 'Please enter a valid email address.' }).openapi({ example: 'john@gmail.com' }),
  organization: z.string().min(1, "Please enter your organization's name").openapi({ example: 'Research Corp.' }),
  password: z.string().min(8, 'Password must contain at least 8 characters').openapi({ example: 'Testing123!' }),
  role: z.enum(userRolesArray, { message: 'Role type should be one of the following: User, Admin' }),
  state: z.enum(inviteStateArray, {
    message: 'Invite state should be one of the following: Pending, Accepted, Denied, Expired',
  }),
};
