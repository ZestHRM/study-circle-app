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

export async function request<T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: unknown;
    token?: string | null;
  } = {}
): Promise<T> {
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(endpoint(path), {
    method: options.method ?? 'GET',
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
    throw new ApiError(errorMessage(data, 'Something went wrong'), response.status, data);
  }

  return data as T;
}

export function getTotalItems(payload: PaginatedApiResponse | null) {
  return payload?.pagination?.totalItems ?? 0;
}
