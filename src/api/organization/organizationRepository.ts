import { mongoDatabase } from '@/api/mongoDatabase';
import { OrganizationModel } from '@/api/organization/organizationModel';
import { NewOrganization, Organization } from '@/api/organization/organizationSchema';
import { userRepository } from '@/api/user/userRepository';

export const organizationRepository = {
  startConnection: async () => {
    return await mongoDatabase.initConnection();
  },

  insert: async (org: NewOrganization): Promise<Organization> => {
    try {
      await userRepository.startConnection();
      const newOrg = new OrganizationModel(org);
      return await newOrg.save();
    } catch (err) {
      console.error('[Error] OrganizationRepository - insert: ', err);
      throw err;
    }
  },
};
