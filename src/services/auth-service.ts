import {
  AuthResponse,
  LoginPayload,
  MessageResponse,
  RestClient,
  SignupPayload,
  User,
} from "./api-client";

export const authApi = {
  login(payload: LoginPayload) {
    return RestClient<AuthResponse>("/auth/login", "POST", payload);
  },
  signup(payload: SignupPayload) {
    return RestClient<MessageResponse & Partial<User>>("/auth/signup", "POST", payload);
  },
  me(token?: string) {
    return RestClient<User>("/auth/me", "GET", {}, { token });
  },
  verifyEmail(payload: { email: string; code: string }) {
    return RestClient<AuthResponse>("/auth/verify-email", "POST", payload);
  },
  resendVerification(email: string) {
    return RestClient<MessageResponse>("/auth/resend-verification", "POST", { email });
  },
  forgotPassword(email: string) {
    return RestClient<MessageResponse>("/auth/forgot-password", "POST", { email });
  },
  resetPassword(payload: {
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
  }) {
    return RestClient<AuthResponse>("/auth/reset-password", "POST", payload);
  },
};
