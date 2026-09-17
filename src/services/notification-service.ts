import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getToken, RestClient } from "./api-client";

// Configure how notifications are presented when app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushNotificationRegistrationResult = {
  granted: boolean;
  expoPushToken: string | null;
  fcmToken: string | null;
  error?: string;
};

/**
  Configure Android Notification Channel
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default Notifications",
      description: "Default channel for Study Circle notifications",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4F46E5",
      showBadge: true,
      enableVibrate: true,
    });
  }
}

/**
 * Register device for push notifications (Permissions + Tokens)
 */
export async function registerForPushNotificationsAsync(): Promise<PushNotificationRegistrationResult> {
  try {
    await setupNotificationChannels();

    if (!Device.isDevice) {
      console.warn(
        "[NotificationService] Push notifications require a physical device for remote push delivery.",
      );
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return {
        granted: false,
        expoPushToken: null,
        fcmToken: null,
        error: "Push notification permission not granted",
      };
    }

    let expoPushToken: string | null = null;
    let fcmToken: string | null = null;

    try {
      // Get Expo Push Token
      const expoTokenObj = await Notifications.getExpoPushTokenAsync();
      expoPushToken = expoTokenObj.data;
      console.log("[NotificationService] Expo Push Token:", expoPushToken);
    } catch (err: any) {
      console.warn(
        "[NotificationService] Failed to get Expo push token:",
        err?.message || err,
      );
    }

    try {
      // Get Native FCM Device Push Token
      const deviceTokenObj = await Notifications.getDevicePushTokenAsync();
      fcmToken = deviceTokenObj.data;
      console.log("[NotificationService] FCM Native Device Token:", fcmToken);
    } catch (err: any) {
      console.warn(
        "[NotificationService] Failed to get FCM device token:",
        err?.message || err,
      );
    }

    return {
      granted: true,
      expoPushToken,
      fcmToken,
    };
  } catch (error: any) {
    console.error("[NotificationService ERROR] Registration failed:", error);
    return {
      granted: false,
      expoPushToken: null,
      fcmToken: null,
      error: error?.message || "Failed to register for push notifications",
    };
  }
}

/**
 * Get initial notification response when app is opened from a Kill State (terminated state)
 */
export async function getInitialNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  try {
    const lastResponse = await Notifications.getLastNotificationResponseAsync();
    if (lastResponse) {
      console.log(
        "[NotificationService] App launched from Kill State via Notification:",
        lastResponse,
      );
    }
    return lastResponse;
  } catch (err) {
    console.warn(
      "[NotificationService] Error checking initial notification response:",
      err,
    );
    return null;
  }
}

export type RegisterDeviceTokenPayload = {
  deviceToken: string;
  platform: "android" | "ios" | "web" | string;
};

export type NotificationType =
  | "system"
  | "study"
  | "quiz"
  | "circle"
  | "subscription"
  | "general"
  | string;

export type NotificationItem = {
  id: number | string;
  title?: string | Record<string, any>;
  message?: string | Record<string, any>;
  body?: string | Record<string, any>;
  content?: string | Record<string, any>;
  type?: NotificationType;
  isRead?: boolean;
  read?: boolean;
  readAt?: string | null;
  data?: Record<string, any> | null;
  createdAt: string;
  updatedAt?: string;
};

export type GetNotificationsParams = {
  page?: number;
  limit?: number;
};

export type NotificationsListResponse = {
  data?: NotificationItem[];
  notifications?: NotificationItem[];
  items?: NotificationItem[];
  pagination?: {
    totalItems?: number;
    totalCount?: number;
    totalPages?: number;
    page?: number;
    limit?: number;
  };
  totalCount?: number;
  unreadCount?: number;
};

export type UnreadCountResponse = {
  count?: number;
  unreadCount?: number;
  data?: {
    count?: number;
    unreadCount?: number;
  };
};

export type MarkReadPayload = {
  ids: (number | string)[] | "all";
};

export type DeleteNotificationsPayload = {
  ids: (number | string)[] | "all";
};

/**
 * Register device token with backend server
 * POST /notifications/register-device-token
 */
export async function syncPushTokenWithBackend(
  token: string,
  userAuthToken?: string | null,
): Promise<boolean> {
  if (!token) return false;

  const authToken = userAuthToken ?? (await getToken());
  if (!authToken) {
    console.log(
      "[NotificationService] User is not logged in yet. Deferring device push token registration until login.",
    );
    return false;
  }

  const rawPlatform = Platform.OS.toLowerCase();
  const platform =
    rawPlatform === "ios" ? "ios" : rawPlatform === "web" ? "web" : "android";

  const payload: RegisterDeviceTokenPayload = {
    deviceToken: token,
    platform,
  };

  try {
    console.log(
      "[NotificationService] Registering device token with /notifications/register-device-token:",
      payload,
    );
    const response = await RestClient(
      "/notifications/register-device-token",
      "POST",
      payload,
      { token: authToken },
    );
    console.log(
      "[NotificationService SUCCESS] Device token registered with backend:",
      response,
    );
    return true;
  } catch (err: any) {
    console.warn(
      "[NotificationService ERROR] /notifications/register-device-token failed:",
      err?.message || err,
    );
    return false;
  }
}

/**
 * API 1: Fetch paginated notifications list
 * GET /notifications?page=1&limit=10
 */
export async function getNotifications(
  params?: GetNotificationsParams,
  token?: string | null,
): Promise<NotificationsListResponse> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  return RestClient<NotificationsListResponse>(
    "/notifications",
    "GET",
    { page, limit },
    token ? { token } : undefined,
  );
}

export async function deleteNotifications(
  payload: DeleteNotificationsPayload,
  token?: string | null,
): Promise<{ message?: string; success?: boolean }> {
  return RestClient<{ message?: string; success?: boolean }>(
    "/notifications",
    "DELETE",
    payload,
    token ? { token } : undefined,
  );
}

export async function markNotificationsAsRead(
  payload: MarkReadPayload,
  token?: string | null,
): Promise<{ message?: string; success?: boolean }> {
  return RestClient<{ message?: string; success?: boolean }>(
    "/notifications/read",
    "POST",
    payload,
    token ? { token } : undefined,
  );
}

export async function getUnreadNotificationsCount(
  token?: string | null,
): Promise<UnreadCountResponse> {
  return RestClient<UnreadCountResponse>(
    "/notifications/unread-count",
    "GET",
    {},
    token ? { token } : undefined,
  );
}

export async function registerDeviceToken(
  payload: RegisterDeviceTokenPayload,
  token?: string | null,
): Promise<{ message?: string; success?: boolean }> {
  return RestClient<{ message?: string; success?: boolean }>(
    "/notifications/register-device-token",
    "POST",
    payload,
    token ? { token } : undefined,
  );
}

export const notificationApi = {
  getNotifications,
  deleteNotifications,
  markNotificationsAsRead,
  getUnreadNotificationsCount,
  registerDeviceToken,
  syncPushTokenWithBackend,
};
