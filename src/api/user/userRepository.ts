import { UserModel } from '@/api/user/userModel';
import { INewUserSchema, User } from '@/api/user/userSchema';

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

  findByIdAsync: async (id: string): Promise<User | null> => {
    try {
      await userRepository.startConnection();
      return await UserModel.findById(id);
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

  insertUser: async (user: INewUserSchema): Promise<User> => {
    try {
      await userRepository.startConnection();
      const newUser = new UserModel(user);
      return await newUser.save();
    } catch (err) {
      console.error('[Error] insertUser: ', err);
      throw err;
    }
  },
};
