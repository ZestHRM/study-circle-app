import {
  AuthResponse,
  LoginPayload,
  MessageResponse,
  request,
  SignupPayload,
  User,
} from './api-client';

export const authApi = {
  login(payload: LoginPayload) {
    return request<AuthResponse>('/auth/login', { method: 'POST', body: payload });
  },
  signup(payload: SignupPayload) {
    return request<MessageResponse & Partial<User>>('/auth/signup', {
      method: 'POST',
      body: payload,
    });
  },
  me(token: string) {
    return request<User>('/auth/me', { token });
  },
  verifyEmail(payload: { email: string; code: string }) {
    return request<AuthResponse>('/auth/verify-email', { method: 'POST', body: payload });
  },
  resendVerification(email: string) {
    return request<MessageResponse>('/auth/resend-verification', {
      method: 'POST',
      body: { email },
    });
  },
  forgotPassword(email: string) {
    return request<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },
  resetPassword(payload: {
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
  }) {
    return request<AuthResponse>('/auth/reset-password', { method: 'POST', body: payload });
  },
};
