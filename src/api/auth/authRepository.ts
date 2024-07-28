import { mongoDatabase } from "@/api/mongoDatabase";
import { User, UserResponse } from "@/api/user/userSchema";
import { userRepository } from "@/api/user/userRepository";
import { UserModel } from "@/api/user/userModel";
import { LoginCredentials } from "@/api/auth/authValidation";
import bcrypt from "bcryptjs";
import request from "supertest";
import { app } from "@/server";

export const authRepository = {
  startConnection: async () => {
    return await mongoDatabase.initConnection();
  },
  login: async (credentials: LoginCredentials): Promise<UserResponse | null> => {
    try {
      await userRepository.startConnection();
      const foundUser = await UserModel.findOne({
        email: credentials.email,
        password: credentials.password,
      }).populate('organization');

      if (!foundUser) {
        return null;
      }
      return {
        _id: foundUser._id,
        email: foundUser.email,
        username: foundUser.username,
        role: foundUser.role,
        organization: {
          _id: foundUser.organization._id,
          name: foundUser.organization.name,
        },
      };
    } catch (err) {
      console.error('[Error] authRepository - login: ', err);
      return null;
    }
  },
};
