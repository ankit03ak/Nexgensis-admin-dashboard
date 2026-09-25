import axiosClient from './axiosClient';
import { LoginCredentials, LoginResponse, User } from '../types/auth';

export const authApi = {
  /**
   * Log in user using DummyJSON auth endpoint (POST /auth/login)
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/auth/login', {
      username: credentials.username.trim(),
      password: credentials.password,
      expiresInMins: credentials.expiresInMins || 60,
    });
    return response.data;
  },

  /**
   * Get current authenticated user details (GET /auth/me)
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosClient.get<User>('/auth/me');
    return response.data;
  },
};
