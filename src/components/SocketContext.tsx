import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Define the shape of the context
interface SocketContextProps {
  newSocket: Socket | null;
  isConnected: boolean;
  usersOnline: { [key: string]: string };
  chat: Message[];
  userName: string;
  setChat: (chat: any) => void;
  sendMessage: (message: string) => void;
  loadMessages: () => void;
}
interface Message {
  id: number;
  text: string;
  userName: string;
}
interface UserStatus {
  userName: string;
  status: string;
}

// Create the context with default values
const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{
  userName: string;
  room: string;
  children: React.ReactNode;
}> = ({ userName, room, children }) => {
  // const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [usersOnline, setUsersOnline] = useState<{ [key: string]: string }>({});
  const [chat, setChat] = useState<Message[]>([]);
  const [room_id, setRoom_id] = useState<string>("");
  const { sendNotification, requestNotificationPermission, API_URL } =
    useAuth();
  const newSocket: Socket = io(`${API_URL}`, {
    reconnectionAttempts: 5,
    timeout: 10000,
    reconnectionDelay: 2000,
    transports: ["websocket"], // Add this line to force WebSocket transport
    extraHeaders: {
      "Access-Control-Allow-Origin": "*",
    },
  });

  useEffect(() => {
    // setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      newSocket.emit("join", { userName, room });
      newSocket.emit("user_connected", { userName });
      setIsConnected(true);
    });

    requestNotificationPermission();

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      newSocket.emit("join", { userName, room });
      newSocket.emit("user_connected", { userName });
      setIsConnected(true);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("Reconnection failed after maximum attempts");
    });

    newSocket.on("receive_message", (data: Message) => {
      setChat((prevChat) => [...prevChat, data]);
      if (data.userName !== userName) {
        sendNotification("New Message", {
          body: `${data.userName}: ${data.text}`,
        });
      }
    });

    newSocket.on("user_status", (data: UserStatus) => {
      setUsersOnline((prevUsers) => ({
        ...prevUsers,
        [data.userName]: data.status,
      }));
    });

    return () => {
      newSocket.emit("leave", { userName, room });
      newSocket.disconnect();
    };
  }, [userName]);

  const loadMessages = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login/room`, {
        title: room,
      });
      const { messages, id } = response.data;
      setChat(messages);
      setRoom_id(id);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = (message: string) => {
    message = message.trim();
    if (message) {
      newSocket.emit("send_message", { userName, message, room_id, room });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        newSocket,
        isConnected,
        usersOnline,
        chat,
        userName,
        setChat,
        sendMessage,
        loadMessages,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
