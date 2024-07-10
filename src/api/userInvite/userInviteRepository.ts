import { mongoDatabase } from '../mongoDatabase';
import { UserInviteModel } from './userInviteModel';
import { BasicUserInvite, UserInvite } from './userInviteSchema';

export const userInviteRepository = {
  startConnection: async () => {
    return await mongoDatabase.initConnection();
  },

  findAllAsync: async (): Promise<UserInvite[]> => {
    try {
      await userInviteRepository.startConnection();
      return await UserInviteModel.find();
    } catch (err) {
      console.error('[Error] userInviteReposiroty - findAllAsync: ', err);
      throw err;
    }
  },

  findByIdAsync: async (id: string): Promise<UserInvite | null> => {
    try {
      await userInviteRepository.startConnection();
      return await UserInviteModel.findById(id);
    } catch (err) {
      console.error('[Error] userInviteReposiroty - findByIdAsync: ', err);
      throw err;
    }
  },

  insert: async (userInvite: BasicUserInvite): Promise<UserInvite> => {
    try {
      await userInviteRepository.startConnection();
      const savedInvite = new UserInviteModel(userInvite);
      return await savedInvite.save();
    } catch (err) {
      console.error('[Error] userInviteReposiroty - insert: ', err);
      throw err;
    }
  },
};
