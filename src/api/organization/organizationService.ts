import { StatusCodes } from 'http-status-codes';

import { organizationRepository } from '@/api/organization/organizationRepository';
import { BasicOrganization, Organization } from '@/api/organization/organizationSchema';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

export const organizationService = {
  insert: async (newOrg: BasicOrganization): Promise<ServiceResponse<Organization | null>> => {
    try {
      console.log('Organization Service');
      const savedOrg = await organizationRepository.insert(newOrg);
      return new ServiceResponse<Organization>(
        ResponseStatus.Success,
        'Organization created.',
        savedOrg,
        StatusCodes.OK
      );
    } catch (err) {
      const errorMessage = `[Error] OrganizationService - insert: $${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findByOrgId: async (id: string): Promise<ServiceResponse<Organization | null>> => {
    try {
      const organization = await organizationRepository.findByIdAsync(id);
      if (!organization) {
        return new ServiceResponse(ResponseStatus.Failed, 'Organization not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<Organization>(
        ResponseStatus.Success,
        'Organization found',
        organization,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error finding organization with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
