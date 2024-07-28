import { compare } from 'bcryptjs';

import { LoginCredentials } from '@/api/auth/authValidation';
import { mongoDatabase } from '@/api/mongoDatabase';
import { UserModel } from '@/api/user/userModel';
import { userRepository } from '@/api/user/userRepository';
import { UserResponse } from '@/api/user/userSchema';

export const authRepository = {
  startConnection: async () => {
    return await mongoDatabase.initConnection();
  },
  login: async (credentials: LoginCredentials): Promise<UserResponse | null> => {
    try {
      await userRepository.startConnection();
      const foundUser = await UserModel.findOne({
        email: credentials.email,
      }).populate('organization');

      if (!foundUser) {
        return null;
      }

      const isValidPassword = await compare(credentials.password, foundUser.password);
      if (!isValidPassword) {
        return null;
      }

      return {
        _id: foundUser._id,
        email: foundUser.email,
        username: foundUser.username,
        role: foundUser.role,
        organization: {
          _id: foundUser.organization._id,
          name: foundUser.organization.name,
        },
      };
    } catch (err) {
      console.error('[Error] authRepository - login: ', err);
      return null;
    }
  },
};
