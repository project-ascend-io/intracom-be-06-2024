import { z } from 'zod';

import { commonValidations } from '@/common/utils/commonValidation';

import { userRolesArray } from './userSchema';

export const GetUserSchema = z.object({
  params: z.object({ id: commonValidations.id }),
});

export const PostUserSchema = z.object({
  body: z
    .object({
      email: commonValidations.email,
      username: z.string().min(5),
      organization: commonValidations.organization,
      password: commonValidations.password,
      role: z.enum(userRolesArray),
    })
    .superRefine(({ password }, checkPassComplexity) => {
      const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
      const containsLowercase = (ch: string) => /[a-z]/.test(ch);
      const containsSpecialChar = (ch: string) => /[`!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?~ ]/.test(ch);
      let countOfUpperCase = 0,
        countOfLowerCase = 0,
        countOfNumbers = 0,
        countOfSpecialChar = 0;
      for (let i = 0; i < password.length; i++) {
        const ch = password.charAt(i);
        if (!isNaN(+ch)) countOfNumbers++;
        else if (containsUppercase(ch)) countOfUpperCase++;
        else if (containsLowercase(ch)) countOfLowerCase++;
        else if (containsSpecialChar(ch)) countOfSpecialChar++;
      }
      if (countOfLowerCase < 1 || countOfUpperCase < 1 || countOfSpecialChar < 1 || countOfNumbers < 1) {
        checkPassComplexity.addIssue({
          code: 'custom',
          message: 'password does not meet complexity requirements',
        });
      }
    }),
});

export type PostUser = z.infer<typeof PostUserSchema.shape.body>;
