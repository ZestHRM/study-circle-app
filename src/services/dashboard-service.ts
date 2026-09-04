import { ApiError, getTotalItems, PaginatedApiResponse, request } from './api-client';

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
  | 'GREAT'
  | 'GOOD'
  | 'OKAY'
  | 'STRUGGLING'
  | 'MOTIVATED'
  | 'FOCUSED'
  | 'TIRED'
  | 'EXCITED';

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
  async createCheckIn(token: string, payload: CreateDashboardCheckInPayload) {
    return request<CreateDashboardCheckInResponse>('/check-ins', {
      method: 'POST',
      token,
      body: payload,
    });
  },
  async getStudyMaterialsCount(token: string) {
    const data = await request<PaginatedApiResponse>('/study-materials?page=1&limit=1', { token });
    return getTotalItems(data);
  },
  async getExamMaterialsCount(token: string) {
    const data = await request<PaginatedApiResponse>('/exam-papers?page=1&limit=1', { token });
    return getTotalItems(data);
  },
  async getQuizzesCount(token: string) {
    const data = await request<PaginatedApiResponse>('/quizzes?page=1&limit=1', { token });
    return getTotalItems(data);
  },
  async getStudyCirclesCount(token: string) {
    const data = await request<PaginatedApiResponse>('/study-circles?page=1&limit=1', { token });
    return getTotalItems(data);
  },
  async getTodayCheckIn(token: string) {
    try {
      return await request<{ id: string } | null>('/check-ins/today', { token });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
  async getCheckInById(token: string, checkInId: string) {
    return request<DashboardCheckInDetail>(`/check-ins/${checkInId}`, { token });
  },
  async getChartData(
    token: string,
    params: {
      startDate: string;
      endDate: string;
    }
  ) {
    const query = new URLSearchParams(params).toString();
    try {
      return await request<DashboardCheckInChartPoint[]>(`/check-ins/chart-data?${query}`, { token });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }
      throw error;
    }
  },
  async getStreak(token: string) {
    return request<DashboardStreak>('/check-ins/streak', { token });
  },
  async getRecentActivity(token: string) {
    return request<DashboardRecentActivityItem[]>('/check-ins/recent-activity', { token });
  },
};
