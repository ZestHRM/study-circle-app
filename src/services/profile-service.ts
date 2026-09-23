import { Platform } from "react-native";
import {
  MessageResponse,
  RestClient,
  uploadFormData,
  User,
} from "./api-client";

export type UploadProfilePictureResponse = {
  message?: string;
  url?: string;
  avatarUrl?: string;
  avatar?: string;
  user?: User;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const profileApi = {
  async changePassword(
    payload: ChangePasswordPayload,
  ): Promise<MessageResponse> {
    return RestClient<MessageResponse>("/profile/password", "PUT", payload);
  },

  async uploadPicture(file: {
    uri: string;
    name?: string;
    type?: string;
  }): Promise<UploadProfilePictureResponse> {
    const fileName = file.name || "profile.jpg";
    const fileType = file.type || "image/jpeg";

    const formData = new FormData();
    if (Platform.OS === "web") {
      try {
        const res = await fetch(file.uri);
        const blob = await res.blob();
        const fileObj = new File([blob], fileName, { type: fileType });
        formData.append("file", fileObj);
      } catch {
        formData.append("file", {
          uri: file.uri,
          name: fileName,
          type: fileType,
        } as unknown as Blob);
      }
    } else {
      formData.append("file", {
        uri: file.uri,
        name: fileName,
        type: fileType,
      } as unknown as Blob);
    }

    return uploadFormData<UploadProfilePictureResponse>(
      "/profile/picture",
      formData,
      undefined,
      "POST",
    );
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    return RestClient<User>("/profile", "PUT", payload);
  },
};

