import { Platform } from 'react-native';
import { MessageResponse, request, uploadFormData } from './api-client';

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
  subjectId: string | number;
  processedNotes: string | null;
  subject: {
    id: string | number;
    name: string;
  } | null;
  _count: {
    files: number;
  };
  quizStatus: StudyMaterialQuizStatus;
  files: StudyMaterialFile[];
  notes?: Array<{ id: string }>;
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

  async getById(token: string, id: string) {
    return request<StudyMaterial>(`/study-materials/${id}`, {
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
      subjectId: string | number;
      file: {
        uri: string;
        name: string;
        type: string;
      };
    }
  ) {
    if (!payload.file || !payload.file.uri) {
      throw new Error('Kripya valid PDF file upload karein.');
    }

    const formData = new FormData();
    formData.append('title', String(payload.title ?? '').trim());
    formData.append('description', String(payload.description ?? '').trim());
    formData.append('subjectId', String(payload.subjectId ?? ''));

    const fileUri = String(payload.file.uri);
    const fileName = String(payload.file.name || 'document.pdf');
    const fileType = String(payload.file.type || 'application/pdf');

    if (Platform.OS === 'web') {
      try {
        const res = await fetch(fileUri);
        const blob = await res.blob();
        const fileObj = new File([blob], fileName, { type: fileType });
        formData.append('file', fileObj);
      } catch {
        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        } as unknown as Blob);
      }
    } else {
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      } as unknown as Blob);
    }

    return uploadFormData<StudyMaterial>('/study-materials', formData, token);
  },
};
