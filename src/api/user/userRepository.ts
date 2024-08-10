import { UserModel } from '@/api/user/userModel';
import { BasicUser, User, UserResponse } from '@/api/user/userSchema';

import { mongoDatabase } from '../mongoDatabase';

export const userRepository = {
  startConnection: async () => {
    return await mongoDatabase.initConnection();
  },

  findAllAsync: async (): Promise<User[]> => {
    try {
      await userRepository.startConnection();
      return await UserModel.find();
    } catch (err) {
      console.error('[Error] findAllAsync: ', err);
      throw err;
    }
  },

  findByIdAsync: async (id: string): Promise<UserResponse | null> => {
    try {
      await userRepository.startConnection();
      const user = await UserModel.findById(id).populate('organization');
      if (!user) {
        return null;
      }

      return {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        organization: {
          _id: user.organization._id,
          name: user.organization.name,
        },
      };
    } catch (err) {
      console.error('[Error] findByIdAsync: ', err);
      throw err;
    }
  },

  findByEmailAsync: async (email: string): Promise<User | null> => {
    try {
      await userRepository.startConnection();
      return await UserModel.findOne({ email });
    } catch (err) {
      console.error('[Error] findByEmailAsync: ', err);
      throw err;
    }
  },

  insertUser: async (user: BasicUser): Promise<UserResponse> => {
    try {
      await userRepository.startConnection();
      const newUser = new UserModel(user);
      await newUser.save();
      const foundUser = await UserModel.findById(newUser._id).populate('organization');

      if (!foundUser) {
        throw new Error('User not found.');
      }
      return foundUser;
    } catch (err) {
      console.error('[Error] insertUser: ', err);
      throw err;
    }
  },
};
