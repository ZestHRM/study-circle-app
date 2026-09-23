import { Platform } from "react-native";
import { MessageResponse, request, uploadFormData } from "./api-client";
import type {
  StudyMaterialQuizStatus,
  StudyMaterialStatus,
} from "./study-materials-service";

export type ExamMaterialCategory =
  | "PYQ"
  | "MOCK_TEST"
  | "MODEL_PAPER"
  | "REVISION_SHEET"
  | "SYLLABUS"
  | "ALL";

export type ExamMaterialFile = {
  id: string;
  fileName: string;
  url?: string | null;
  size?: number | null;
  status: StudyMaterialStatus;
};

export type ExamMaterial = {
  id: string;
  title: string;
  description?: string | null;
  examCategory?: ExamMaterialCategory;
  year?: string | number | null;
  grade?: string | number | null;
  questions?: string[];
  term?: string | null;
  status: StudyMaterialStatus;
  quizStatus?: StudyMaterialQuizStatus;
  userId: string | number;
  subjectId: string | number;
  subject: {
    id: string | number;
    name: string;
    description?: string;
  } | null;
  _count?: {
    files: number;
  };
  files?: ExamMaterialFile[];
  notesId?: string | null;
  quizId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ImportantTopic = {
  id: number | string;
  userId: number | string;
  subjectId: number | string;
  topic: string;
  topicNormalized?: string;
  importunacy?: number;
  difficulty?: "low" | "medium" | "high" | string;
  estimatedDuration?: number;
  description?: string;
  reason?: string[];
  examPaperId?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id: number | string;
    name: string;
    description?: string;
  } | null;
};

export type ImportantTopicsResponse = {
  data: ImportantTopic[];
  pagination: {
    totalItems: number;
    currentPage?: number;
    limit?: number;
    totalPages?: number;
  };
};

export type ExamMaterialsResponse = {
  data: ExamMaterial[];
  pagination: {
    totalItems: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
};

export type CreateExamMaterialPayload = {
  title: string;
  description?: string;
  examCategory: ExamMaterialCategory;
  subjectId: string | number;
  year?: string;
  file: {
    uri: string;
    name: string;
    type: string;
  };
};

export type ParseQuestionsResponse = {
  message: string;
  questions: string[];
};

export type CreateExamPaperPayload = {
  title: string;
  description?: string;
  subjectId: string | number;
  year?: string | number;
  grade?: string;
  questions: string[];
};

export const examMaterialsApi = {
  async list(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: ExamMaterialCategory;
    subjectId?: string;
  }): Promise<ExamMaterialsResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const search = params?.search ?? "";
    const category = params?.category ?? "ALL";
    const subjectId = params?.subjectId ?? "";

    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(search ? { search } : {}),
      ...(category && category !== "ALL" ? { category } : {}),
      ...(subjectId ? { subjectId } : {}),
    }).toString();

    return request<ExamMaterialsResponse>(`/exam-papers?${query}`);
  },

  async getById(id: string): Promise<ExamMaterial | null> {
    return request<ExamMaterial>(`/exam-papers/${id}`);
  },

  async delete(id: string): Promise<MessageResponse | null> {
    return request<MessageResponse>(`/exam-papers/${id}`, {
      method: "DELETE",
    });
  },

  async parseQuestions(file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<ParseQuestionsResponse> {
    const formData = new FormData();
    const fileUri = String(file.uri);
    const fileName = String(file.name || "exam_paper.pdf");
    const fileType = String(file.type || "application/pdf");

    if (Platform.OS === "web") {
      try {
        const res = await fetch(fileUri);
        const blob = await res.blob();
        const fileObj = new File([blob], fileName, { type: fileType });
        formData.append("file", fileObj);
      } catch {
        formData.append("file", {
          uri: fileUri,
          name: fileName,
          type: fileType,
        } as unknown as Blob);
      }
    } else {
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as unknown as Blob);
    }

    return uploadFormData<ParseQuestionsResponse>(
      "/homework-helps/parse-questions",
      formData,
    );
  },

  async createExamPaper(
    payload: CreateExamPaperPayload,
  ): Promise<ExamMaterial> {
    console.log("Creating exam paper with payload:", payload);
    return request<ExamMaterial>("/exam-papers", {
      method: "POST",
      body: payload,
    });
  },

  async create(payload: CreateExamMaterialPayload): Promise<ExamMaterial> {
    if (!payload || !payload.file || !payload.file.uri) {
      throw new Error("Please select a valid PDF file.");
    }

    const formData = new FormData();
    formData.append("title", String(payload.title ?? "").trim());
    formData.append("description", String(payload.description ?? "").trim());
    formData.append("examCategory", String(payload.examCategory ?? "PYQ"));
    formData.append("subjectId", String(payload.subjectId ?? ""));
    if (payload.year) formData.append("year", String(payload.year));

    const fileUri = String(payload.file.uri);
    const fileName = String(payload.file.name || "exam_material.pdf");
    const fileType = String(payload.file.type || "application/pdf");

    if (Platform.OS === "web") {
      try {
        const res = await fetch(fileUri);
        const blob = await res.blob();
        const fileObj = new File([blob], fileName, { type: fileType });
        formData.append("file", fileObj);
      } catch {
        formData.append("file", {
          uri: fileUri,
          name: fileName,
          type: fileType,
        } as unknown as Blob);
      }
    } else {
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as unknown as Blob);
    }

    return uploadFormData<ExamMaterial>("/exam-materials", formData);
  },

  async getImportantTopics(params?: {
    page?: number;
    limit?: number;
    subjectId?: string | number;
    search?: string;
    examPaperId?: string;
  }): Promise<ImportantTopicsResponse> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 15;
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(params?.subjectId ? { subjectId: String(params.subjectId) } : {}),
      ...(params?.search ? { search: params.search } : {}),
      ...(params?.examPaperId ? { examPaperId: params.examPaperId } : {}),
    }).toString();

    return request<ImportantTopicsResponse>(`/important-topics?${query}`);
  },
};
