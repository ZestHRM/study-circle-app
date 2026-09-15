import { Platform } from "react-native";
import { uploadFormData, User } from "./api-client";

export type UploadProfilePictureResponse = {
  message?: string;
  url?: string;
  avatarUrl?: string;
  avatar?: string;
  user?: User;
};

export const profileApi = {
  async uploadPicture(
    file: {
      uri: string;
      name?: string;
      type?: string;
    },
    token?: string | null
  ): Promise<UploadProfilePictureResponse> {
    const fileName = file.name || "profile.jpg";
    const fileType = file.type || "image/jpeg";

    const createFormData = async (fieldName: string) => {
      const formData = new FormData();
      if (Platform.OS === "web") {
        try {
          const res = await fetch(file.uri);
          const blob = await res.blob();
          const fileObj = new File([blob], fileName, { type: fileType });
          formData.append(fieldName, fileObj);
        } catch {
          formData.append(fieldName, {
            uri: file.uri,
            name: fileName,
            type: fileType,
          } as unknown as Blob);
        }
      } else {
        formData.append(fieldName, {
          uri: file.uri,
          name: fileName,
          type: fileType,
        } as unknown as Blob);
      }
      return formData;
    };

    // Candidate configurations: [path, method, fieldName]
    const candidates: Array<{ path: string; method: "POST" | "PATCH" | "PUT"; fieldName: string }> = [
      { path: "/profile/picture", method: "POST", fieldName: "file" },
      { path: "/profile/picture", method: "POST", fieldName: "picture" },
      { path: "/profile/picture", method: "POST", fieldName: "avatar" },
      { path: "/profile/picture", method: "PATCH", fieldName: "file" },
      { path: "/profile/picture", method: "PATCH", fieldName: "picture" },
      { path: "/profile/picture", method: "PUT", fieldName: "file" },
      { path: "/profile/picture", method: "PUT", fieldName: "picture" },
      { path: "/profile/avatar", method: "POST", fieldName: "file" },
      { path: "/profile/avatar", method: "POST", fieldName: "avatar" },
      { path: "/users/profile/picture", method: "POST", fieldName: "file" },
    ];

    let lastError: any = null;

    for (const candidate of candidates) {
      try {
        console.log(
          `[profileApi] Trying upload with ${candidate.method} ${candidate.path} (fieldName: '${candidate.fieldName}')...`
        );
        const formData = await createFormData(candidate.fieldName);
        const response = await uploadFormData<UploadProfilePictureResponse>(
          candidate.path,
          formData,
          token,
          candidate.method
        );
        console.log(
          `[profileApi SUCCESS] Upload succeeded with ${candidate.method} ${candidate.path} (fieldName: '${candidate.fieldName}')`
        );
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(
          `[profileApi] Candidate ${candidate.method} ${candidate.path} (${candidate.fieldName}) failed with status ${err?.status}:`,
          err?.data || err?.message
        );
      }
    }

    throw lastError || new Error("Failed to upload profile picture after trying candidate configurations.");
  },
};
