import Toast from "react-native-toast-message";

export interface ToastOptions {
  type?: "success" | "error" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export function showToast({
  type = "info",
  title,
  message,
  duration = 3000,
}: ToastOptions) {
  Toast.show({
    type,
    text1: title,
    text2: message,
    visibilityTime: duration,
    autoHide: true,
    topOffset: 50,
  });
}

export function showSuccessToast(title: string, message?: string) {
  showToast({ type: "success", title, message });
}

export function showErrorToast(title: string, message?: string) {
  showToast({ type: "error", title, message });
}

export function showInfoToast(title: string, message?: string) {
  showToast({ type: "info", title, message });
}

export { Toast };
