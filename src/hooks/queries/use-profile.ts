import { useAuth } from "@/lib/auth";
import { showErrorToast, showSuccessToast } from "@/lib/utils/toast";
import { profileApi, type User } from "@/services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (payload: Partial<User>) => profileApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      showSuccessToast(
        "Profile Updated",
        "Your profile details have been saved successfully.",
      );
      if (token) {
        queryClient.setQueryData(["auth", "me", token], updatedUser);
      }
      void queryClient.invalidateQueries({ queryKey: ["auth"] });
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: any) => {
      showErrorToast(
        "Update Failed",
        err.message || "Could not update profile. Please try again.",
      );
    },
  });
}
