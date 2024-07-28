import { StatusCodes } from 'http-status-codes';

import { authRepository } from '@/api/auth/authRepository';
import { LoginCredentials } from '@/api/auth/authValidation';
import { UserResponse } from '@/api/user/userSchema';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ServiceResponse<UserResponse | null>> => {
    const foundUser = await authRepository.login(credentials);
    if (!foundUser) {
      return new ServiceResponse(ResponseStatus.Failed, 'Invalid Credentials', null, StatusCodes.UNAUTHORIZED);
    }
    return new ServiceResponse(ResponseStatus.Success, 'Successfully logged in.', foundUser, StatusCodes.OK);
  },
};
