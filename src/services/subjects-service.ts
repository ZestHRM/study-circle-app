import { RestClient } from "./api-client";

export type Subject = {
  id: number | string;
  name: string;
  description?: string;
  userId?: number | string;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    studyCircles?: number;
    homeworkHelp?: number;
  };
};

export type SubjectsResponse = {
  data: Subject[];
  pagination: {
    totalItems: number;
    currentPage?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextPage?: number | null;
    previousPage?: number | null;
    firstPage?: number;
    lastPage?: number;
    isFirstPage?: boolean;
    isLastPage?: boolean;
    isEmpty?: boolean;
  };
};

export const subjectsApi = {
  async list(params?: { page?: number; limit?: number; search?: string }) {
    return RestClient<SubjectsResponse>("/subjects", "GET", params ?? { page: 1, limit: 50 });
  },

  async create(payload: { name: string; description?: string; userId?: string }) {
    return RestClient<Subject>("/subjects", "POST", {
      name: payload.name,
      description: payload.description ?? "",
      userId: payload.userId ?? "",
    });
  },
};
