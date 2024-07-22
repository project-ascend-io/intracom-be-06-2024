import { mongoDatabase } from '../mongoDatabase';
import { UserInviteModel } from './userInviteModel';
import { UserInvite } from './userInviteSchema';
import { UpdateUserInviteSchema } from './userInviteValidation';

export const userInviteRepository = {
  startConnection: async () => {
    return await mongoDatabase.initConnection();
  },

  findAllAsync: async (): Promise<UserInvite[]> => {
    try {
      await userInviteRepository.startConnection();
      return await UserInviteModel.find();
    } catch (err) {
      console.error('[Error] userInviteRepository - findAllAsync: ', err);
      throw err;
    }
  },

  findByIdAsync: async (id: string): Promise<UserInvite | null> => {
    try {
      await userInviteRepository.startConnection();
      return await UserInviteModel.findById(id);
    } catch (err) {
      console.error('[Error] userInviteRepository - findByIdAsync: ', err);
      throw err;
    }
  },

  findByEmailAsync: async (email: string): Promise<UserInvite | null> => {
    try {
      await userInviteRepository.startConnection();
      return await UserInviteModel.findOne({ email });
    } catch (err) {
      console.error('[Error] findByEmailAsync: ', err);
      throw err;
    }
  },

  insert: async (userInvite: UpdateUserInviteSchema): Promise<UserInvite> => {
    try {
      await userInviteRepository.startConnection();
      const savedInvite = new UserInviteModel(userInvite);
      return await savedInvite.save();
    } catch (err) {
      console.error('[Error] userInviteRepository - insert: ', err);
      throw err;
    }
  },

  update: async (userInviteId: string, updateData: any): Promise<UserInvite | null> => {
    try {
      await userInviteRepository.startConnection();
      return await UserInviteModel.findByIdAndUpdate(userInviteId, updateData, { new: true });
    } catch (err) {
      console.error('[Error] userInviteRepository - insert: ', err);
      throw err;
    }
  },
};
