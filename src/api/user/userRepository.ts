import { User, UserModel } from '@/api/user/userModel';

import { mongoDatabase } from '../mongoDatabase';

export const users: User[] = [
  {
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    age: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Bob',
    email: 'bob@example.com',
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

  insertUser: async (user: User): Promise<User> => {
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
