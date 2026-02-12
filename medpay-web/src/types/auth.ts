import type { UserRole } from './enums';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  phone: string;
  password: string;
  fullName: string;
  gender?: string;
  email?: string;
}

export interface UserInfoResponse {
  id: string;
  username: string;
  phone: string;
  email: string;
  role: UserRole;
  status: string;
  avatarUrl: string;
  fullName: string;
  hospitalId: string | null;
  doctorId: string | null;
  patientId: string | null;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfoResponse;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  email?: string;
  gender?: string;
  avatarUrl?: string;
}
