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
};
