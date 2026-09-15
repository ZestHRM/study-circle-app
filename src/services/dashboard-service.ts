import {
  ApiError,
  getTotalItems,
  PaginatedApiResponse,
  RestClient,
} from "./api-client";

export type DashboardCheckInChartPoint = {
  date: string;
  tasksCompleted: number;
  hoursStudied: number;
  hasCheckin: boolean;
};

export type DashboardStreak = {
  currentStreak: number;
  bestStreak: number;
  lastCheckinDate: string | null;
};

export type DashboardRecentActivityItem = {
  id: string;
  date: string;
  mood?: string;
};

export type DashboardCheckInMood =
  | "GREAT"
  | "GOOD"
  | "OKAY"
  | "STRUGGLING"
  | "MOTIVATED"
  | "FOCUSED"
  | "TIRED"
  | "EXCITED";

export type CreateDashboardCheckInPayload = {
  date: string;
  studyHours: number;
  completedTasks: number;
  mood: DashboardCheckInMood;
  todayGoals?: string;
  challenges?: string;
  notes?: string;
};

export type DashboardCheckInRecord = {
  id: string;
  userId: number;
  date: string;
  studyHours: number;
  completedTasks: number;
  todayGoals?: string;
  challenges?: string;
  mood: DashboardCheckInMood;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardAIFeedback = {
  feedbackContent: string;
  keyInsights: string[];
  recommendations: string[];
  encouragement: string;
};

export type DashboardCheckInDetail = DashboardCheckInRecord & {
  aiFeedbacks?: DashboardAIFeedback[];
};

export type CreateDashboardCheckInResponse = {
  checkIn: DashboardCheckInRecord;
  streak: {
    current: number;
    best: number;
  };
};

export const dashboardApi = {
  async createCheckIn(
    tokenOrPayload: string | CreateDashboardCheckInPayload,
    payload?: CreateDashboardCheckInPayload,
  ) {
    const actualPayload =
      typeof tokenOrPayload === "object" ? tokenOrPayload : payload;
    const actualToken =
      typeof tokenOrPayload === "string" ? tokenOrPayload : undefined;
    return RestClient<CreateDashboardCheckInResponse>(
      "/check-ins",
      "POST",
      actualPayload,
      { token: actualToken },
    );
  },
  async getStudyMaterialsCount(token?: string | null) {
    const data = await RestClient<PaginatedApiResponse>(
      "/study-materials",
      "GET",
      { page: 1, limit: 1 },
      { token },
    );
    return getTotalItems(data);
  },
  async getExamMaterialsCount(token?: string | null) {
    const data = await RestClient<PaginatedApiResponse>(
      "/exam-papers",
      "GET",
      { page: 1, limit: 1 },
      { token },
    );
    return getTotalItems(data);
  },
  async getQuizzesCount(token?: string | null) {
    const data = await RestClient<PaginatedApiResponse>(
      "/quizzes",
      "GET",
      { page: 1, limit: 1 },
      { token },
    );
    return getTotalItems(data);
  },
  async getStudyCirclesCount(token?: string | null) {
    const data = await RestClient<PaginatedApiResponse>(
      "/study-circles",
      "GET",
      { page: 1, limit: 1 },
      { token },
    );
    return getTotalItems(data);
  },
  async getTodayCheckIn(token?: string | null) {
    try {
      return await RestClient<{ id: string } | null>(
        "/check-ins/today",
        "GET",
        {},
        { token },
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  async getCheckInById(token: string | null | undefined, checkInId?: string) {
    const actualId =
      typeof token === "string" && checkInId ? checkInId : (token as string);
    const actualToken =
      typeof token === "string" && checkInId ? token : undefined;
    return RestClient<DashboardCheckInDetail>(
      `/check-ins/${actualId}`,
      "GET",
      {},
      { token: actualToken },
    );
  },
  async getChartData(
    tokenOrParams?: string | null | { startDate: string; endDate: string },
    params?: {
      startDate: string;
      endDate: string;
    },
  ) {
    const actualParams =
      typeof tokenOrParams === "object" ? (tokenOrParams as any) : params;
    const actualToken =
      typeof tokenOrParams === "string" ? tokenOrParams : undefined;
    try {
      return await RestClient<DashboardCheckInChartPoint[]>(
        "/check-ins/chart-data",
        "GET",
        actualParams,
        { token: actualToken },
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }
      throw error;
    }
  },
  async getStreak(token?: string | null) {
    return RestClient<DashboardStreak>(
      "/check-ins/streak",
      "GET",
      {},
      { token },
    );
  },
  async getRecentActivity(token?: string | null) {
    return RestClient<DashboardRecentActivityItem[]>(
      "/check-ins/recent-activity",
      "GET",
      {},
      { token },
    );
  },
};
