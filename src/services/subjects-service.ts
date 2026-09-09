import { request } from './api-client';

export type Subject = {
  id: string | number;
  name: string;
  description?: string;
  userId?: string | number;
};


export type SubjectsResponse = {
  data: Subject[];
  pagination: {
    totalItems: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
};

export const subjectsApi = {
  async list(
    token: string,
    params: {
      page: number;
      limit: number;
      search?: string;
    }
  ) {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
      ...(params.search ? { search: params.search } : {}),
    }).toString();

    return request<SubjectsResponse>(`/subjects?${query}`, {
      token,
    });
  },
  async create(
    token: string,
    payload: {
      name: string;
      description?: string;
      userId?: string;
    }
  ) {
    return request<Subject>('/subjects', {
      method: 'POST',
      token,
      body: {
        name: payload.name,
        description: payload.description ?? '',
        userId: payload.userId ?? '',
      },
    });
  },
};
