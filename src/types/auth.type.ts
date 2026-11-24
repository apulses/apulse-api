export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string | null;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export type TokenPair = AuthTokenResponse;

export interface LoginPayload {
  email: string;
  password: string;
}
