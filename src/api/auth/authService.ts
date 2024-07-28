import { LoginCredentials } from "@/api/auth/authValidation";
import { User, UserResponse } from "@/api/user/userSchema";
import { logger } from "@/server";
import { ResponseStatus, ServiceResponse } from "@/common/models/serviceResponse";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { authRepository } from "@/api/auth/authRepository";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ServiceResponse<UserResponse | null>> => {
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(credentials.password, salt);
    const foundUser = await authRepository.login({ ...credentials, password: encryptedPassword });
    if (!foundUser) {
      return new ServiceResponse(ResponseStatus.Failed, 'Invalid Credentials', null, StatusCodes.UNAUTHORIZED);
    }
    return new ServiceResponse(ResponseStatus.Success, 'Successfully logged in.', foundUser, StatusCodes.OK);
  },
};