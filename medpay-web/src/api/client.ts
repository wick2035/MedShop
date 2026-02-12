import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api';
import { useHospitalContextStore } from '@/stores/hospital-context.store';

/**
 * Extract an array from a Spring Boot Page object or return the data as-is if
 * it is already an array.  This bridges the gap between backend endpoints that
 * return `Page<T>` (with a `.content` property) and frontend code that expects
 * a plain `T[]`.
 */
export function unwrapPage<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'content' in data) {
    return (data as { content: T[] }).content ?? [];
  }
  return [];
}

/* ── Storage keys ───────────────────────────────────────── */

const ACCESS_TOKEN_KEY = 'medpay_access_token';
const REFRESH_TOKEN_KEY = 'medpay_refresh_token';

/* ── Helpers ────────────────────────────────────────────── */

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/* ── Axios instance ─────────────────────────────────────── */

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ── Request interceptor ────────────────────────────────── */

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Inject Authorization header
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Inject hospital context for super admin
  const hospitalId = useHospitalContextStore.getState().selectedHospitalId;
  if (hospitalId) {
    config.headers['X-Hospital-Id'] = hospitalId;
  }

  // Auto-generate Idempotency-Key for mutating methods
  const method = config.method?.toUpperCase();
  if (method === 'POST' || method === 'PUT') {
    if (!config.headers['Idempotency-Key']) {
      config.headers['Idempotency-Key'] = crypto.randomUUID();
    }
  }

  return config;
});

/* ── Response interceptor ───────────────────────────────── */

/** Flag to prevent concurrent refresh attempts */
let isRefreshing = false;
/** Queue of requests waiting for the token refresh to complete */
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processPendingRequests(token: string | null, error?: unknown): void {
  for (const req of pendingRequests) {
    if (token) {
      req.resolve(token);
    } else {
      req.reject(error);
    }
  }
  pendingRequests = [];
}

client.interceptors.response.use(
  (response) => {
    // Unwrap the backend ApiResponse envelope
    const body = response.data as ApiResponse<unknown>;

    if (body.code !== undefined && body.code !== 0) {
      return Promise.reject(new Error(body.message || 'Unknown API error'));
    }

    // Return the unwrapped data payload so callers get T directly.
    // We replace response.data with body.data so that axios returns the
    // inner data when using `client.get<T>(...)` etc.
    response.data = body.data;
    return response;
  },

  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retried?: boolean;
    };

    // Only attempt refresh on 401 and if this request hasn't been retried yet
    if (error.response?.status !== 401 || originalRequest._retried) {
      // For non-401 errors, try to use the backend error message if available
      const serverMessage = error.response?.data?.message;
      if (serverMessage) {
        return Promise.reject(new Error(serverMessage));
      }
      return Promise.reject(error);
    }

    // Avoid refreshing for the refresh endpoint itself
    if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    originalRequest._retried = true;

    if (isRefreshing) {
      // Another refresh is in progress; queue this request
      return new Promise<string>((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((newToken) => {
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization =
            `Bearer ${newToken}`;
        }
        return client(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call the refresh endpoint directly with axios (not `client`) to
      // avoid interceptor loops.
      const { data } = await axios.post<
        ApiResponse<{ accessToken: string; refreshToken: string }>
      >(
        `${client.defaults.baseURL}/api/v1/auth/refresh`,
        null,
        { headers: { 'Content-Type': 'application/json', 'X-Refresh-Token': refreshToken } },
      );

      if (data.code !== 0) {
        throw new Error(data.message || 'Token refresh failed');
      }

      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;

      setTokens(newAccessToken, newRefreshToken);
      processPendingRequests(newAccessToken);

      // Retry the original request with the new token
      if (originalRequest.headers) {
        (originalRequest.headers as Record<string, string>).Authorization =
          `Bearer ${newAccessToken}`;
      }
      return client(originalRequest);
    } catch (refreshError) {
      processPendingRequests(null, refreshError);
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
