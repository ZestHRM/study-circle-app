import { request } from './api-client';

export type QuizDifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

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

export type QuizQuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';

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
  | 'CORRECT'
  | 'INCORRECT'
  | 'PARTIALLY_CORRECT'
  | 'NONE';

export type QuizAnswerGrading = 'EMBEDDING' | 'GPT' | 'NONE' | 'MATCH';

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
    'id' | 'question' | 'type' | 'answer' | 'explanation' | 'aiConfidence' | 'topic'
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

export const quizzesApi = {
  async list(
    token: string,
    params: {
      page: number;
      limit: number;
      search?: string;
      subjectId?: string;
      status?: string;
    }
  ) {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
      ...(params.search ? { search: params.search } : {}),
      ...(params.subjectId ? { subjectId: params.subjectId } : {}),
      ...(params.status ? { status: params.status } : {}),
    }).toString();

    return request<QuizzesResponse>(`/quizzes?${query}`, {
      token,
    });
  },
  async startAttempt(token: string, quizId: string) {
    return request<QuizAttempt>(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
      token,
    });
  },
  async getById(token: string, quizId: string) {
    return request<QuizDetailsResponse>(`/quizzes/${quizId}`, {
      token,
    });
  },
  async getAttempts(
    token: string,
    quizId: string,
    params: {
      page: number;
      limit: number;
    }
  ) {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    }).toString();

    return request<QuizAttemptsResponse>(`/quizzes/${quizId}/attempts?${query}`, {
      token,
    });
  },
  async saveAnswers(
    token: string,
    quizId: string,
    attemptId: string,
    payload: {
      answers: {
        questionId: string;
        answer: string;
      }[];
    }
  ) {
    return request<QuizAttempt>(`/quizzes/${quizId}/attempts/${attemptId}/save`, {
      method: 'POST',
      token,
      body: payload,
    });
  },
  async getAttemptResults(
    token: string,
    quizId: string,
    attemptId: string,
    params: {
      page: number;
      limit: number;
    }
  ) {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
    }).toString();

    return request<QuizAttemptResultsResponse>(
      `/quizzes/${quizId}/attempts/${attemptId}/results?${query}`,
      {
        token,
      }
    );
  },
};
