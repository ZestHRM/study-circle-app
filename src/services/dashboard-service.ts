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
  async createCheckIn(payload: CreateDashboardCheckInPayload) {
    return RestClient<CreateDashboardCheckInResponse>(
      "/check-ins",
      "POST",
      payload,
    );
  },
  async getStudyMaterialsCount() {
    const data = await RestClient<PaginatedApiResponse>(
      "/study-materials",
      "GET",
      { page: 1, limit: 1 },
    );
    return getTotalItems(data);
  },
  async getExamMaterialsCount() {
    const data = await RestClient<PaginatedApiResponse>(
      "/exam-papers",
      "GET",
      { page: 1, limit: 1 },
    );
    return getTotalItems(data);
  },
  async getQuizzesCount() {
    const data = await RestClient<PaginatedApiResponse>(
      "/quizzes",
      "GET",
      { page: 1, limit: 1 },
    );
    return getTotalItems(data);
  },
  async getStudyCirclesCount() {
    const data = await RestClient<PaginatedApiResponse>(
      "/study-circles",
      "GET",
      { page: 1, limit: 1 },
    );
    return getTotalItems(data);
  },
  async getTodayCheckIn() {
    try {
      return await RestClient<{ id: string } | null>(
        "/check-ins/today",
        "GET",
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  async getCheckInById(checkInId: string) {
    return RestClient<DashboardCheckInDetail>(
      `/check-ins/${checkInId}`,
      "GET",
    );
  },
  async getChartData(params?: { startDate: string; endDate: string }) {
    try {
      return await RestClient<DashboardCheckInChartPoint[]>(
        "/check-ins/chart-data",
        "GET",
        params,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }
      throw error;
    }
  },
  async getStreak() {
    return RestClient<DashboardStreak>(
      "/check-ins/streak",
      "GET",
    );
  },
  async getRecentActivity() {
    return RestClient<DashboardRecentActivityItem[]>(
      "/check-ins/recent-activity",
      "GET",
    );
  },
};
