import { User, UserModel } from '@/api/user/userModel';

import { mongoDatabase } from '../mongoDatabase';
import { NewUser } from './__tests__/userService.test';

export const users: User[] = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    // This adds 'password' to part of user's record in database
    password: 'alicespassword',
    age: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
    // This adds 'password' to part of user's record in database
    password: 'bobspassword',
    age: 21,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const userRepository = {
  startConnection: async () => {
    const mongoDb = await mongoDatabase.initConnection();
    return mongoDb;
  },

  findAllAsync: async (): Promise<User[]> => {
    return users;
  },

  findByIdAsync: async (id: number): Promise<User | null> => {
    return users.find((user) => user.id === id) || null;
  },

  // This finds a user by their email address or logs an error if not found
  findByEmailAsync: async (email: string): Promise<User | null> => {
    try {
      await userRepository.startConnection();
      return await UserModel.findOne({ email });
    } catch (err) {
      console.error('Error finding user by email: ', err);
      throw err;
    }
  },

  insertUser: async (user: NewUser): Promise<User> => {
    try {
      await userRepository.startConnection();
      const newUser = new UserModel(user);
      const savedUser = await newUser.save();
      return savedUser;
    } catch (err) {
      console.error('Error inserting user: ', err);
      throw err;
    }
  },
};
