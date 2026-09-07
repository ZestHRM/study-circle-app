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

export const notesApi = {
  async list(
    token: string,
    params: {
      page: number;
      limit: number;
      search?: string;
      subjectId?: string;
    },
  ) {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.limit),
      ...(params.search ? { search: params.search } : {}),
      ...(params.subjectId ? { subjectId: params.subjectId } : {}),
    }).toString();

    return request<NotesResponse>(`/notes?${query}`, {
      token,
    });
  },
  async getById(token: string, notesId: string) {
    return request<StudyNotesDetailResponse>(`/notes/${notesId}`, {
      token,
    });
  },
  async create(
    token: string,
    payload: {
      content: string;
      subjectId: number;
    },
  ) {
    return request<Note>("/notes", {
      method: "POST",
      token,
      body: payload,
    });
  },
  async update(
    token: string,
    id: string,
    payload: {
      content?: string;
      subjectId?: number;
    },
  ) {
    return request<Note>(`/notes/${id}`, {
      method: "PUT",
      token,
      body: payload,
    });
  },
  async delete(token: string, id: string) {
    return request<MessageResponse | null>(`/notes/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
