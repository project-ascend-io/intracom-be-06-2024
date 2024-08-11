import { mongoDatabase } from '../mongoDatabase';
import { UserInviteModel } from './userInviteModel';
import { UserInvite } from './userInviteSchema';
import { PostUserInviteSchema } from './userInviteValidation';

export const userInviteRepository = {
  startConnection: async () => {
    return await mongoDatabase.initConnection();
  },

  findUserInvitesByOrdId: async (id: string, queryParams: any): Promise<UserInvite[]> => {
    try {
      await userInviteRepository.startConnection();
      const query: any = { organization: id };
      if (queryParams.email) {
        query.email = queryParams.email;
      }
      if (queryParams.state) {
        query.state = queryParams.state;
        console.log('QUeryPARAMS REPO', queryParams);
      }

      return await UserInviteModel.find(query);
    } catch (err) {
      console.error('[Error] userInviteRepository - findUserInvitesByOrgIdAsync: ', err);
      throw err;
    }
  },

  findByHashAsync: async (hash: string): Promise<UserInvite | null> => {
    try {
      await userInviteRepository.startConnection();
      return await UserInviteModel.findOne({ hash });
    } catch (err) {
      console.error('[Error] findByHashAsync: ', err);
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

  insert: async (userInvite: typeof PostUserInviteSchema): Promise<UserInvite> => {
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

  deleteById: async (id: string): Promise<null> => {
    try {
      await userInviteRepository.startConnection();
      return await UserInviteModel.findByIdAndDelete(id);
    } catch (err) {
      console.error('[Error] userInviteRepository - delete: ', err);
      throw err;
    }
  },
};
