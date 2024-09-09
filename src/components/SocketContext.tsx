import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  usersOnline: { [key: string]: string };
  chat: Message[];
  userName: string;
  setChat: (chat: Message[]) => void;
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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [usersOnline, setUsersOnline] = useState<{ [key: string]: string }>({});
  const [chat, setChat] = useState<Message[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  const { sendNotification, requestNotificationPermission, API_URL } =
    useAuth();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(`${API_URL}`, {
      reconnectionAttempts: 5,
      timeout: 10000,
      reconnectionDelay: 2000,
      transports: ["websocket"],
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
    });

    const socket = socketRef.current;

    const setupSocketListeners = () => {
      socket.on("receive_message", (data: Message) => {
        setChat((prevChat) => [...prevChat, data]);
        if (data.userName !== userName) {
          sendNotification("New Message", {
            body: `${data.userName}: ${data.text}`,
          });
        }
      });

      socket.on("user_status", (data: UserStatus) => {
        setUsersOnline((prevUsers) => ({
          ...prevUsers,
          [data.userName]: data.status,
        }));
      });

      socket.on("connect", () => {
        console.log("Connected to socket server");
        socket.emit("join", { userName, room });
        socket.emit("user_connected", { userName });
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
        setIsConnected(false);
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`);
        socket.emit("join", { userName, room });
        socket.emit("user_connected", { userName });
        setIsConnected(true);
      });

      socket.on("reconnect_failed", () => {
        console.error("Reconnection failed after maximum attempts");
      });
    };

    setupSocketListeners();

    requestNotificationPermission();

    return () => {
      socket.emit("leave", { userName, room });
      socket.disconnect();
    };
  }, [
    API_URL,
    userName,
    room,
    sendNotification,
    requestNotificationPermission,
  ]);

  const loadMessages = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login/room`, {
        title: room,
      });
      const { messages, id } = response.data;
      setChat(messages);
      setRoomId(id);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = (message: string) => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit("send_message", {
        userName,
        message,
        roomId,
        room,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
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
