import { MessageResponse, request } from "./api-client";

export type NoteType = "GENERATED" | "CUSTOM";

export type Note = {
  id: string;
  content: string;
  type: NoteType;
  subjectId: number | string;
  subject: {
    id: number | string;
    name: string;
  } | null;
  studyMaterialId?: string | null;
  studyMaterial?: {
    id: string;
    title: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type NotesResponse = {
  data: Note[];
  pagination: {
    totalItems: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
};

export type StudyNotesDetail = {
  id: string;
  subjectId: number | string;
  studyMaterialId: string;
  studyMaterialFileId: string;
  userId: number | string;
  content: string;
  type: string;
  sourceFile: string | null;
  createdAt: string;
  updatedAt: string;
  model: string;
  subject: {
    id: number | string;
    name: string;
  };
  studyMaterial: {
    id: string;
    title: string;
    subject: {
      id: number | string;
      name: string;
    };
  };
};

export type StudyNotesDetailResponse = {
  data: StudyNotesDetail;
};

export type GetNotesParams = {
  page?: number;
  limit?: number;
  search?: string;
  subjectId?: string;
};

export type CreateNotePayload = {
  content: string;
  subjectId: number;
};

export type UpdateNotePayload = {
  content?: string;
  subjectId?: number;
};

export const notesApi = {
  async list(params?: GetNotesParams) {
    const queryParams = params ?? { page: 1, limit: 10 };
    const query = new URLSearchParams({
      page: String(queryParams.page ?? 1),
      limit: String(queryParams.limit ?? 10),
      ...(queryParams.search ? { search: queryParams.search } : {}),
      ...(queryParams.subjectId ? { subjectId: queryParams.subjectId } : {}),
    }).toString();

    return request<NotesResponse>(`/notes?${query}`);
  },

  async getById(notesId: string) {
    return request<StudyNotesDetailResponse>(`/notes/${notesId}`);
  },

  async create(payload: CreateNotePayload) {
    return request<Note>("/notes", {
      method: "POST",
      body: payload,
    });
  },

  async update(id: string, payload: UpdateNotePayload) {
    return request<Note>(`/notes/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  async delete(id: string) {
    return request<MessageResponse | null>(`/notes/${id}`, {
      method: "DELETE",
    });
  },
};
