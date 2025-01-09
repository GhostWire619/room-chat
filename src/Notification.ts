// Notification.ts
import { messaging } from "./firebaseConfig";
import { getToken, onMessage } from "firebase/messaging";

export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY",
      });
      console.log("FCM Token:", token);
      return token;
    } else {
      console.warn("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

export const listenForNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log("Notification received:", payload);
    alert(`Notification: ${payload.notification?.title}`);
  });
};
