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
  async list(
    token?: string,
    params: {
      page: number;
      limit: number;
      search?: string;
    } = { page: 1, limit: 50 }
  ) {
    return RestClient<SubjectsResponse>("/subjects", "GET", params, { token });
  },

  async create(
    token?: string,
    payload?: {
      name: string;
      description?: string;
      userId?: string;
    }
  ) {
    // Overload support if token is omitted
    const actualPayload = typeof token === "object" ? token : payload;
    const actualToken = typeof token === "string" ? token : undefined;

    return RestClient<Subject>(
      "/subjects",
      "POST",
      {
        name: actualPayload?.name,
        description: actualPayload?.description ?? "",
        userId: actualPayload?.userId ?? "",
      },
      { token: actualToken }
    );
  },
};
