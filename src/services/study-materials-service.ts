import { MessageResponse, request } from './api-client';

export type StudyMaterialQuizStatus =
  | 'PENDING'
  | 'GENERATING'
  | 'GENERATED'
  | 'GENERATION_FAILED';

export type StudyMaterialStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'PROCESSING_FAILED'
  | 'GENERATING_NOTES'
  | 'NOTES_GENERATED'
  | 'NOTES_GENERATION_FAILED'
  | 'ARCHIVED';

export type StudyMaterialFile = {
  id: string;
  fileName: string;
  status: StudyMaterialStatus;
  quizStatus: StudyMaterialQuizStatus;
  errorMessage: string | null;
};

export type StudyMaterial = {
  id: string;
  title: string;
  description: string;
  status: StudyMaterialStatus;
  userId: string;
  subjectId: string;
  processedNotes: string | null;
  subject: {
    id: string;
    name: string;
  } | null;
  _count: {
    files: number;
  };
  quizStatus: StudyMaterialQuizStatus;
  files: StudyMaterialFile[];
  createdAt: string;
  updatedAt: string;
};

export type StudyMaterialsResponse = {
  data: StudyMaterial[];
  pagination: {
    totalItems: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
};

export const studyMaterialsApi = {
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

    return request<StudyMaterialsResponse>(`/study-materials?${query}`, {
      token,
    });
  },
  async delete(token: string, id: string) {
    return request<MessageResponse | null>(`/study-materials/${id}`, {
      method: 'DELETE',
      token,
    });
  },
  async create(
    token: string,
    payload: {
      title: string;
      description?: string;
      subjectId: string;
      file: {
        uri: string;
        name: string;
        type: string;
      };
    }
  ) {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description ?? '');
    formData.append('subjectId', payload.subjectId);
    formData.append('file', payload.file as unknown as Blob);

    return request<StudyMaterial>('/study-materials', {
      method: 'POST',
      token,
      body: formData,
    });
  },
};
