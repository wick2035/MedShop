import { client } from './client';
import type { LoginRequest, RegisterRequest, LoginResponse } from '@/types/auth';

export const authApi = {
  /** Authenticate user with credentials */
  login(body: LoginRequest): Promise<LoginResponse> {
    return client.post('/api/v1/auth/login', body).then((r) => r.data as LoginResponse);
  },

  /** Register a new user account */
  register(body: RegisterRequest): Promise<LoginResponse> {
    return client.post('/api/v1/auth/register', body).then((r) => r.data as LoginResponse);
  },

  /** Refresh an expired access token */
  refresh(refreshToken: string): Promise<LoginResponse> {
    return client
      .post('/api/v1/auth/refresh', { refreshToken })
      .then((r) => r.data as LoginResponse);
  },
};
