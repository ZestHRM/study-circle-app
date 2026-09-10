import { TOKEN_KEY } from "@/constants/keys";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type EducationLevel =
  | "School"
  | "College"
  | "Coaching"
  | "CompetitiveExams";

export type User = {
  id: number | string;
  email: string;
  name: string;
  phone?: string | null;
  institute?: string | null;
  level?: EducationLevel | null;
  classOrStandard?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  zipcode?: string | null;
  subscriptionTier?: string | null;
  referralCode?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  phone: string;
  institute: string;
  level: EducationLevel;
  classOrStandard: string;
  password: string;
  confirmPassword: string;
  city?: string;
  state?: string;
  country?: string;
  zipcode?: string;
  referralCode?: string | null;
  sessionId?: string | null;
};

export type AuthResponse = {
  token: string;
  user: User;
  message?: string;
};

export type MessageResponse = {
  message: string;
};

export type PaginatedApiResponse = {
  data: unknown[];
  pagination: {
    totalItems: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "https://api.usestudycircle.ai/v1";

/**
 * Automatically fetch authentication token from storage
 */
export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function endpoint(path: string) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const route = path.startsWith("/") ? path : `/${path}`;
  return `${base}${route}`;
}

export function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
}

export const getErrorMessage = (error: any, defaultErrorMessage?: string) =>
  error?.response?.data?.message ??
  error?.response?.data?.errors?.message ??
  error?.data?.message ??
  error?.data?.errors?.message ??
  error?.message ??
  error?.errors?.message ??
  defaultErrorMessage ??
  "Something went wrong";

export type RestClientOptions = {
  baseURL?: string;
  headers?: Record<string, string>;
  token?: string | null;
};

/**
 * Professional centralized API Client.
 * Automatically injects authorization headers, handles JSON and FormData, and formats errors.
 */
export const RestClient = async <T = unknown>(
  url: string,
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE" = "GET",
  paramsOrData: any = {},
  options: RestClientOptions = {}
): Promise<T> => {
  const token = options.token ?? (await getToken());
  const fullBase = (options.baseURL ?? API_BASE_URL).replace(/\/$/, "");
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;

  const isFormData =
    typeof FormData !== "undefined" && paramsOrData instanceof FormData;

  if (isFormData) {
    return uploadFormData<T>(cleanUrl, paramsOrData as FormData, token, method as any);
  }

  let queryStr = "";
  if (method === "GET" && paramsOrData && typeof paramsOrData === "object" && Object.keys(paramsOrData).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(paramsOrData).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const str = searchParams.toString();
    if (str) queryStr = `?${str}`;
  }

  const finalUrl = `${fullBase}${cleanUrl}${queryStr}`;
  const hasToken = Boolean(token);

  console.log(`[RestClient ${method}] Final Request URL: ${finalUrl} (Token Attached: ${hasToken})`);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "x-device-type": Platform.OS,
    ...(options.headers ?? {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    const formattedToken = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
    headers.Authorization = formattedToken;
  }

  try {
    const response = await fetch(finalUrl, {
      method,
      headers,
      body: method !== "GET" && paramsOrData ? JSON.stringify(paramsOrData) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const msg = getErrorMessage(data, "Something went wrong");
      console.error(`[RestClient ${method} ERROR] URL: ${finalUrl} (Status: ${response.status}) ->`, data);
      throw new ApiError(msg, response.status, data);
    }

    console.log(`[RestClient ${method} SUCCESS] URL: ${finalUrl} (${response.status})`);
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`[RestClient ${method} ERROR] URL: ${finalUrl}`, error);
    throw error;
  }
};

/**
 * Legacy alias for RestClient
 */
export const request = async <T = unknown>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<T> => {
  const method = options.method ?? "GET";
  return RestClient<T>(path, method, options.body, { token: options.token });
};

/**
 * Multipart FormData Upload Handler via RestClient
 */
export async function uploadFormData<T>(
  path: string,
  formData: FormData,
  token?: string | null,
  method: "POST" | "PATCH" | "PUT" = "POST"
): Promise<T> {
  const fullUrl = endpoint(path);
  const authToken = token ?? (await getToken());
  const hasToken = Boolean(authToken);

  console.log(`[RestClient Upload ${method}] Final URL: ${fullUrl} (Token Attached: ${hasToken})`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, fullUrl);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("x-device-type", Platform.OS);

    if (authToken) {
      const formattedToken = authToken.startsWith("Bearer ")
        ? authToken
        : `Bearer ${authToken}`;
      xhr.setRequestHeader("Authorization", formattedToken);
    }

    xhr.onload = () => {
      try {
        const text = xhr.responseText;
        const data = text ? JSON.parse(text) : null;
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log(`[RestClient Upload ${method} SUCCESS] ${fullUrl} (${xhr.status})`);
          resolve(data as T);
        } else {
          const msg = getErrorMessage(data, "Upload failed");
          console.error(`[API Upload Error] ${method} ${fullUrl} (Status: ${xhr.status}) ->`, data);
          reject(new ApiError(msg, xhr.status, data));
        }
      } catch (err) {
        console.error(`[RestClient Upload Parse Error] ${method} ${fullUrl}`, err);
        reject(err instanceof Error ? err : new Error("Unable to parse response"));
      }
    };

    xhr.onerror = () => {
      console.error(`[RestClient Upload Network Error] ${method} ${fullUrl}`);
      reject(new Error("Network request failed during file upload"));
    };

    xhr.ontimeout = () => {
      console.error(`[RestClient Upload Timeout] ${method} ${fullUrl}`);
      reject(new Error("File upload request timed out"));
    };

    xhr.send(formData);
  });
}

export function getTotalItems(payload: PaginatedApiResponse | null) {
  return payload?.pagination?.totalItems ?? 0;
}
