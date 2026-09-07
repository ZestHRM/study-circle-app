import { Platform } from 'react-native';

export type EducationLevel = 'School' | 'College' | 'Coaching' | 'CompetitiveExams';

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
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/v1';

export function endpoint(path: string) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${base}${route}`;
}

export function errorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
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
  'Something went wrong';

export async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<T> {
  const method = options.method ?? 'GET';
  const fullUrl = endpoint(path);
  const hasToken = Boolean(options.token);

  console.log(`[RestClient] ${method} ${fullUrl} (Token Attached: ${hasToken})`);

  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-device-type': Platform.OS,
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    const formattedToken = options.token.startsWith('Bearer ')
      ? options.token
      : `Bearer ${options.token}`;
    headers.Authorization = formattedToken;
  }

  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: options.body
        ? isFormData
          ? (options.body as FormData)
          : JSON.stringify(options.body)
        : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const msg = errorMessage(data, 'Something went wrong');
      console.warn(`[RestClient Error] ${method} ${fullUrl} Status: ${response.status}`, data);
      throw new ApiError(msg, response.status, data);
    }

    console.log(`[RestClient Success] ${method} ${fullUrl}`, data);
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`[RestClient Failure] ${method} ${fullUrl}`, error);
    throw error;
  }
}

export function uploadFormData<T>(
  path: string,
  formData: FormData,
  token?: string | null
): Promise<T> {
  const fullUrl = endpoint(path);
  const hasToken = Boolean(token);

  console.log(`[RestClient Upload] POST ${fullUrl} (Token Attached: ${hasToken})`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', fullUrl);

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('x-device-type', Platform.OS);
    if (token) {
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      xhr.setRequestHeader('Authorization', formattedToken);
    }

    xhr.onload = () => {
      try {
        const text = xhr.responseText;
        const data = text ? JSON.parse(text) : null;
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log(`[RestClient Upload Success] POST ${fullUrl}`, data);
          resolve(data as T);
        } else {
          const msg = errorMessage(data, 'Upload failed');
          console.warn(`[RestClient Upload Error] POST ${fullUrl} Status: ${xhr.status}`, data);
          reject(new ApiError(msg, xhr.status, data));
        }
      } catch (err) {
        console.error(`[RestClient Upload Parse Error] POST ${fullUrl}`, err);
        reject(err instanceof Error ? err : new Error('Unable to parse response'));
      }
    };

    xhr.onerror = () => {
      console.error(`[RestClient Upload Network Error] POST ${fullUrl}`);
      reject(new Error('Network request failed during file upload'));
    };

    xhr.ontimeout = () => {
      console.error(`[RestClient Upload Timeout] POST ${fullUrl}`);
      reject(new Error('File upload request timed out'));
    };

    xhr.send(formData);
  });
}

export function getTotalItems(payload: PaginatedApiResponse | null) {
  return payload?.pagination?.totalItems ?? 0;
}
