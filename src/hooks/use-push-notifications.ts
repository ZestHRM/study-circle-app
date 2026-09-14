import {
  getInitialNotificationResponse,
  registerForPushNotificationsAsync,
  syncPushTokenWithBackend,
} from "@/services/notification-service";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useRef, useState } from "react";

export type UsePushNotificationsResult = {
  expoPushToken: string | null;
  fcmToken: string | null;
  notification: Notifications.Notification | null;
  notificationResponse: Notifications.NotificationResponse | null;
  permissionGranted: boolean;
  isRegistering: boolean;
  error: string | null;
  registerPushNotifications: () => Promise<void>;
};

export function usePushNotifications(autoRegister = true): UsePushNotificationsResult {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [notificationResponse, setNotificationResponse] = useState<Notifications.NotificationResponse | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const registerPushNotifications = useCallback(async () => {
    setIsRegistering(true);
    setError(null);
    try {
      const result = await registerForPushNotificationsAsync();
      setPermissionGranted(result.granted);
      setExpoPushToken(result.expoPushToken);
      setFcmToken(result.fcmToken);

      if (result.error) {
        setError(result.error);
      }

      const activeToken = result.fcmToken || result.expoPushToken;
      if (activeToken) {
        void syncPushTokenWithBackend(activeToken);
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to setup push notifications";
      setError(msg);
      console.error("[usePushNotifications ERROR]", err);
    } finally {
      setIsRegistering(false);
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    // 1. Check for initial notification response if app opened from Kill State (Terminated state)
    void getInitialNotificationResponse().then((initialResponse) => {
      if (initialResponse) {
        console.log("[usePushNotifications] Handled notification response from Kill State:", initialResponse);
        setNotificationResponse(initialResponse);
      }
    });

    // 2. Auto register push token if enabled
    if (autoRegister) {
      timer = setTimeout(() => {
        void registerPushNotifications();
      }, 0);
    }

    // 3. Listener for incoming notifications when app is in Foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((incoming) => {
      console.log("[usePushNotifications] Foreground Notification Received:", incoming);
      setNotification(incoming);
    });

    // 4. Listener when user taps a notification (Foreground or Background state)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[usePushNotifications] Notification Tapped by User (Foreground/Background):", response);
      setNotificationResponse(response);
    });

    return () => {
      if (timer) clearTimeout(timer);
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [autoRegister, registerPushNotifications]);

  return {
    expoPushToken,
    fcmToken,
    notification,
    notificationResponse,
    permissionGranted,
    isRegistering,
    error,
    registerPushNotifications,
  };
}
