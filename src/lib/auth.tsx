import {
  authApi,
  type AuthResponse,
  type LoginPayload,
  type SignupPayload,
  type User,
} from "@/lib/api";
import {
  registerForPushNotificationsAsync,
  syncPushTokenWithBackend,
} from "@/services/notification-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import * as React from "react";
import { Platform } from "react-native";

const TOKEN_KEY = "studycircle.auth_token";
const USER_KEY = "studycircle.auth_user";
const AUTH_QUERY_KEYS = {
  me: (token: string) => ["auth", "me", token] as const,
};

type AuthContextValue = {
  isLoading: boolean;
  token: string | null;
  user: User | null;
  signIn(payload: LoginPayload): Promise<void>;
  signUp(payload: SignupPayload): Promise<string>;
  verifyEmail(payload: { email: string; code: string }): Promise<void>;
  resendVerification(email: string): Promise<string>;
  forgotPassword(email: string): Promise<string>;
  resetPassword(payload: {
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
  }): Promise<void>;
  signOut(): Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function getStoredToken() {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }

  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setStoredToken(token: string) {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function getStoredUser(): Promise<User | null> {
  try {
    let raw: string | null = null;
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      raw = localStorage.getItem(USER_KEY);
    } else {
      raw = await SecureStore.getItemAsync(USER_KEY);
    }
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

async function setStoredUser(user: User) {
  try {
    const raw = JSON.stringify(user);
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      localStorage.setItem(USER_KEY, raw);
      return;
    }
    await SecureStore.setItemAsync(USER_KEY, raw);
  } catch (err) {
    console.warn("Failed to store user profile:", err);
  }
}

async function deleteStoredAuth() {
  try {
    if (Platform.OS === "web" && typeof localStorage !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  } catch (err) {
    console.warn("Failed to delete stored auth data:", err);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [isRestoringSession, setIsRestoringSession] = React.useState(true);
  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<User | null>(null);

  const applyAuthResponse = React.useCallback(
    async (response: AuthResponse) => {
      await setStoredToken(response.token);
      await setStoredUser(response.user);
      setToken(response.token);
      setUser(response.user);
      queryClient.setQueryData(
        AUTH_QUERY_KEYS.me(response.token),
        response.user,
      );
      void queryClient.invalidateQueries({ queryKey: ["auth"] });

      try {
        const pushResult = await registerForPushNotificationsAsync();
        const pushToken = pushResult.fcmToken || pushResult.expoPushToken;
        if (pushToken) {
          void syncPushTokenWithBackend(pushToken, response.token);
        }
      } catch (err) {
        console.warn(
          "[AuthProvider] Failed to sync push token after authentication:",
          err,
        );
      }
    },
    [queryClient],
  );

  const meQuery = useQuery({
    queryKey: token ? AUTH_QUERY_KEYS.me(token) : ["auth", "me", "anonymous"],
    queryFn: async () => authApi.me(token as string),
    enabled: Boolean(token),
    retry: 1,
    initialData: () => {
      if (!token) return undefined;
      return (
        queryClient.getQueryData<User>(AUTH_QUERY_KEYS.me(token)) ??
        user ??
        undefined
      );
    },
  });

  React.useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
      void setStoredUser(meQuery.data);
    }
  }, [meQuery.data]);

  React.useEffect(() => {
    if (!meQuery.isError || !token) {
      return;
    }

    async function clearInvalidSession() {
      await deleteStoredAuth();
      setToken(null);
      setUser(null);
    }

    void clearInvalidSession();
  }, [meQuery.isError, token]);

  React.useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getStoredToken(),
          getStoredUser(),
        ]);

        if (mounted && storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(storedUser);
            queryClient.setQueryData(
              AUTH_QUERY_KEYS.me(storedToken),
              storedUser,
            );
          }
          try {
            const pushResult = await registerForPushNotificationsAsync();
            const pushToken = pushResult.fcmToken || pushResult.expoPushToken;
            if (pushToken) {
              void syncPushTokenWithBackend(pushToken, storedToken);
            }
          } catch (err) {
            console.warn(
              "[AuthProvider] Failed to sync push token during session restore:",
              err,
            );
          }
        }
      } catch {
        await deleteStoredAuth();
      } finally {
        if (mounted) {
          setIsRestoringSession(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [queryClient]);

  const signInMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (response) => {
      await applyAuthResponse(response);
    },
  });

  const signUpMutation = useMutation({
    mutationFn: authApi.signup,
  });

  const verifyEmailMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: async (response) => {
      await applyAuthResponse(response);
    },
  });

  const resendVerificationMutation = useMutation({
    mutationFn: authApi.resendVerification,
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: async (response) => {
      await applyAuthResponse(response);
    },
  });

  const isLoading = isRestoringSession || (Boolean(token) && meQuery.isLoading);
  const resolvedUser = meQuery.data ?? user ?? null;

  const value = React.useMemo<AuthContextValue>(
    () => ({
      isLoading,
      token,
      user: resolvedUser,
      async signIn(payload) {
        await signInMutation.mutateAsync(payload);
      },
      async signUp(payload) {
        const response = await signUpMutation.mutateAsync(payload);
        return (
          response.message ?? "Please check your email for verification code"
        );
      },
      async verifyEmail(payload) {
        await verifyEmailMutation.mutateAsync(payload);
      },
      async resendVerification(email) {
        const response = await resendVerificationMutation.mutateAsync(email);
        return response.message ?? "Verification code sent successfully";
      },
      async forgotPassword(email) {
        const response = await forgotPasswordMutation.mutateAsync(email);
        return response.message ?? "Verification code sent successfully";
      },
      async resetPassword(payload) {
        await resetPasswordMutation.mutateAsync(payload);
      },
      async signOut() {
        try {
          await deleteStoredAuth();
        } catch {
          // Ignore storage cleanup error
        }
        if (token) {
          queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me(token) });
        }
        queryClient.clear();
        setToken(null);
        setUser(null);
      },
    }),
    [
      forgotPasswordMutation,
      isLoading,
      queryClient,
      resendVerificationMutation,
      resolvedUser,
      resetPasswordMutation,
      signInMutation,
      signUpMutation,
      token,
      verifyEmailMutation,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
