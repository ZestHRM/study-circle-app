import { request } from "./api-client";

export type QuizDifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export type QuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type QuizAttempt = {
  id: string;
  quizId: string;
  score: number;
  startedAt: string;
  completedAt: string | null;
  totalScore: number;
  quizAttemptAnswers?: {
    questionId: string;
    userAnswer: string;
  }[];
};

export type QuizQuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER";

export type QuizQuestion = {
  id: string;
  quizId: string;
  question: string;
  type: QuizQuestionType;
  difficulty: QuizDifficultyLevel;
  options: string[];
  answer: string | null;
  explanation: string | null;
  aiConfidence: number | null;
  topic: string | null;
};

export type QuizAnswerCorrectness =
  | "CORRECT"
  | "INCORRECT"
  | "PARTIALLY_CORRECT"
  | "NONE";

export type QuizAnswerGrading = "EMBEDDING" | "GPT" | "NONE" | "MATCH";

export type QuizAttemptAnswer = {
  id: string;
  quizAttemptId: string;
  questionId: string;
  userAnswer: string;
  correctness: QuizAnswerCorrectness;
  gradingMethod: QuizAnswerGrading;
  timeSpent: number | null;
  question: Pick<
    QuizQuestion,
    | "id"
    | "question"
    | "type"
    | "answer"
    | "explanation"
    | "aiConfidence"
    | "topic"
  >;
};

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  subjectId: number | string;
  userId: number | string;
  totalQuestions: number;
  difficultyLevel: QuizDifficultyLevel;
  studyMaterialId: string | null;
  status: QuizStatus;
  subject: {
    id: number | string;
    name: string;
  };
  maxTimePerAttempt: number;
  endsAt: string | null;
  startsAt: string | null;
  startedAt: string | null;
  activeAttempt?: QuizAttempt | null;
  _count: {
    quizQuestions: number;
    quizAttempts: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type QuizzesResponse = {
  data: Quiz[];
  pagination: {
    totalItems: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
};

export type QuizDetailsResponse = Quiz & {
  quizQuestions: QuizQuestion[];
};

export type QuizAttemptsResponse = {
  data: QuizAttempt[];
  pagination: {
    totalItems: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
};

export type QuizAttemptResultsResponse = {
  data: QuizAttemptAnswer[];
  pagination: {
    totalItems: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
};

export type GetQuizzesParams = {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
  status?: string;
};

export const quizzesApi = {
  async list(params?: GetQuizzesParams) {
    const queryParams = params ?? { page: 1, limit: 10 };
    const query = new URLSearchParams({
      page: String(queryParams.page ?? 1),
      limit: String(queryParams.limit ?? 10),
      ...(queryParams.search ? { search: queryParams.search } : {}),
      ...(queryParams.subjectId ? { subjectId: queryParams.subjectId } : {}),
      ...(queryParams.status ? { status: queryParams.status } : {}),
    }).toString();

    return request<QuizzesResponse>(`/quizzes?${query}`);
  },

  async startAttempt(quizId: string) {
    return request<QuizAttempt>(`/quizzes/${quizId}/attempts`, {
      method: "POST",
    });
  },

  async getById(quizId: string) {
    return request<QuizDetailsResponse>(`/quizzes/${quizId}`);
  },

  async getAttempts(
    quizId: string,
    params?: { page?: number; limit?: number },
  ) {
    const queryParams = params ?? { page: 1, limit: 10 };
    const query = new URLSearchParams({
      page: String(queryParams.page ?? 1),
      limit: String(queryParams.limit ?? 10),
    }).toString();

    return request<QuizAttemptsResponse>(
      `/quizzes/${quizId}/attempts?${query}`,
    );
  },

  async saveAnswers(
    quizId: string,
    attemptId: string,
    payload: {
      answers: {
        questionId: string;
        answer: string;
      }[];
    },
  ) {
    return request<QuizAttempt>(
      `/quizzes/${quizId}/attempts/${attemptId}/save`,
      {
        method: "POST",
        body: payload,
      },
    );
  },

  async getAttemptResults(
    quizId: string,
    attemptId: string,
    params?: { page?: number; limit?: number },
  ) {
    const queryParams = params ?? { page: 1, limit: 10 };
    const query = new URLSearchParams({
      page: String(queryParams.page ?? 1),
      limit: String(queryParams.limit ?? 10),
    }).toString();

    return request<QuizAttemptResultsResponse>(
      `/quizzes/${quizId}/attempts/${attemptId}/results?${query}`,
    );
  },
};
