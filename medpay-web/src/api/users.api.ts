import { client } from './client';
import type { UserInfoResponse } from '@/types/auth';

export const usersApi = {
  /** Get the profile of the currently authenticated user */
  getMe(): Promise<UserInfoResponse> {
    return client.get('/api/v1/users/me').then((r) => r.data as UserInfoResponse);
  },
};
