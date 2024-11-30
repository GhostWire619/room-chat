// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
const API_URL = "https://sock-back.onrender.com"; // "https://sock-back.onrender.com"  //"https://room-connect-8cf76c932125.herokuapp.com"; //import.meta.env.VITE_REACT_APP_API_URL; //|| "http://127.0.0.1:5000"

// Define the user data type
interface UserData {
  id: number;
  userName: string;
}

// Define the Auth context type
interface AuthContextType {
  user: UserData | null;
  cookies: { [key: string]: any };
  API_URL: string;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => void;
  setCookie: (
    name: "id" | "userData" | "roomTitle",
    value: any,
    options?: any
  ) => void;
  removeCookie: (name: "id" | "userData" | "roomTitle", options?: any) => void;
  requestNotificationPermission: () => void;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [cookies, setCookie, removeCookie] = useCookies([
    "id",
    "userData",
    "roomTitle",
  ]); // Include userData in cookies

  const login = async (userName: string, password: string) => {
    try {
      const response = await axios.post(
        `https://sock-back.onrender.com/auth/login`,
        {
          userName,
          password,
        }
      );

      const userData: UserData = response.data.profData;

      // Store the token and user data in cookies
      setCookie("id", response.data.id, { path: "/" });
      setCookie("userData", userData, { path: "/" });
      console.log(cookies);

      setUser(userData);
      console.log("Logged in successfully");
    } catch (err: any) {
      console.error("Login failed:", err.response?.data?.msg || "Login error");
    }
  };

  const logout = () => {
    setUser(null);
    removeCookie("id", { path: "/" });
    removeCookie("userData", { path: "/" });
    removeCookie("roomTitle", { path: "/" });
    console.log("Logged out successfully");
  };

  // In your main file (e.g., index.tsx or App.tsx)
  // serviceWorkerRegistration.ts

  const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
      try {
        // const registration =
        await navigator.serviceWorker.register("/sw.js");
        // console.log("Service Worker registered:", registration);

        // Call subscribeUserToPush after successful registration
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  };

  registerServiceWorker();

  async function requestNotificationPermission() {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
      } else {
        console.log("Notification permission denied.");
      }
    } else {
      console.log("This browser does not support notifications.");
    }
  }

  // async function subscribeUserToPush() {
  //   const registration = await navigator.serviceWorker.ready;

  //   const subscribeOptions = {
  //     userVisibleOnly: true,
  //     applicationServerKey: urlBase64ToUint8Array(
  //       "BOeEhoxo2390ZlmUwPmCiUIF3yo9EDCeIiyKOr0nP-c6zJL24akb1KPw97xxkHQx99Cb1K8fwTkA6kbAYp9JouE"
  //     ), // Replace with your public key
  //   };

  //   const pushSubscription = await registration.pushManager.subscribe(
  //     subscribeOptions
  //   );
  //   console.log("Received PushSubscription:", JSON.stringify(pushSubscription));

  //   // Send the subscription to your backend to store
  // }

  // function urlBase64ToUint8Array(base64String: string): Uint8Array {
  //   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  //   const base64 = (base64String + padding)
  //     .replace(/-/g, "+")
  //     .replace(/_/g, "/");

  //   const rawData = window.atob(base64);
  //   const outputArray = new Uint8Array(rawData.length);

  //   for (let i = 0; i < rawData.length; ++i) {
  //     outputArray[i] = rawData.charCodeAt(i);
  //   }
  //   return outputArray;
  // }

  function sendNotification(title: string, options?: NotificationOptions) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, options);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        cookies,
        API_URL,
        login,
        logout,
        setCookie,
        removeCookie,
        requestNotificationPermission,
        sendNotification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
