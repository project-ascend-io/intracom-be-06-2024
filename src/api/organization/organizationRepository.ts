import { mongoDatabase } from '@/api/mongoDatabase';
import { OrganizationModel } from '@/api/organization/organizationModel';
import { BasicOrganization, Organization } from '@/api/organization/organizationSchema';

export const organizationRepository = {
  startConnection: async () => {
    return await mongoDatabase.initConnection();
  },

  insert: async (org: BasicOrganization): Promise<Organization> => {
    try {
      await organizationRepository.startConnection();
      const newOrg = new OrganizationModel(org);
      return await newOrg.save();
    } catch (err) {
      console.error('[Error] OrganizationRepository - insert: ', err);
      throw err;
    }
  },

  findByIdAsync: async (id: string): Promise<Organization | null> => {
    try {
      await organizationRepository.startConnection();
      return await OrganizationModel.findById(id);
    } catch (err) {
      console.error('[Error] OrganizationRepository - findByIdAsync: ', err);
      throw err;
    }
  },
};
