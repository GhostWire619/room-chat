import React, { useEffect, useState, useRef } from "react";
import "../styles/ChatRoom.css"; // Import the CSS file
import { Avatar, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import bg from "../assets/3jfjc53fsyb61.jpg";
import { useAuth } from "./AuthContext";
import io, { Socket } from "socket.io-client";
import axios from "axios";

interface ChatRoomProps {
  room: string;
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

const ChatRoom: React.FC<ChatRoomProps> = ({ room }) => {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);
  const [usersOnline, setUsersOnline] = useState<{ [key: string]: string }>({});
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { removeCookie, cookies, sendNotification, requestNotificationPermission, API_URL } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(API_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
      reconnectionDelay: 2000,
      transports: ["websocket"],
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
    });

    const socket = socketRef.current;

    // Setup socket listeners
    const setupSocketListeners = () => {
      socket.on("receive_message", (data: Message) => {
        setChat((prevChat) => [...prevChat, data]);
        if (data.userName !== cookies.userData.userName) {
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
        socket.emit("join", { userName: cookies.userData.userName, room: "qq" });
        socket.emit("user_connected", { userName: cookies.userData.userName });
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server");
        setIsConnected(false);
      });

      socket.on("reconnect", (attemptNumber) => {
        console.log(`Reconnected after ${attemptNumber} attempts`);
        socket.emit("join", { userName: cookies.userData.userName, room });
        socket.emit("user_connected", { userName: cookies.userData.userName });
        setIsConnected(true);
      });

      socket.on("reconnect_failed", () => {
        console.error("Reconnection failed after maximum attempts");
      });
    };

    setupSocketListeners();
    requestNotificationPermission();

    return () => {
      socket.emit("leave", { userName: cookies.userData.userName, room });
      socket.disconnect();
    };
  }, [API_URL, room, cookies.userData.userName, sendNotification, requestNotificationPermission]);

  useEffect(() => {
    // Load messages on mount
    const loadMessages = async () => {
      try {
        const response = await axios.post(`${API_URL}/auth/login/room`, {
          title: room,
        });
        const { messages } = response.data;
        setChat(messages);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [API_URL, room]);

  const scrollToBottom = () => {
    if (divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollToBottomButton(false);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setShowScrollToBottomButton(scrollHeight > scrollTop + clientHeight + 5);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.addEventListener("scroll", handleScroll);

      return () => {
        chatContainerRef.current?.removeEventListener("scroll", handleScroll);
      };
    }
  }, [chat]);

  const handleSendMessage = () => {
    if (message.trim() && socketRef.current) {
      socketRef.current.emit("send_message", {
        userName: cookies.userData.userName,
        message,
        room,
      });
      setMessage("");
    }
  };

  return (
    <div className="ChatRoom">
      <div style={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={() => removeCookie("roomTitle", { path: "/" })} sx={{ color: "purple" }}>
          <ArrowBackIcon />
        </IconButton>
        <h2>Chat Room: {room}</h2>
      </div>

      <div className="OnlineStatus">
        {Object.keys(usersOnline).map((user, index) => (
          <div key={index}>
            <p style={{ marginLeft: "10px" }}>
              {user}
              {usersOnline[user] === "online" ? " 🟢" : " 🔴 "}
            </p>
          </div>
        ))}
      </div>

      <div
        className="MessageList"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
        ref={chatContainerRef}
      >
        {chat.map((chatMessage) => (
          <div
            key={chatMessage.id}
            className="MessageContainer"
            style={{
              display: chatMessage.userName !== cookies.userData.userName ? "flex-start" : "right",
            }}
          >
            <div className="MessageItem">
              <div
                className="Avatar"
                style={{
                  display: chatMessage.userName !== cookies.userData.userName ? "block" : "none",
                }}
              >
                <Avatar sx={{ bgcolor: "#3f51b5", width: "30px", height: "30px" }}>
                  {chatMessage.userName.charAt(0).toUpperCase()}
                </Avatar>
              </div>
              <div className={`Message ${chatMessage.userName !== cookies.userData.userName ? " left" : ""}`}>
                <div className="userName">
                  <p>{chatMessage.userName !== cookies.userData.userName ? chatMessage.userName : ""}</p>
                </div>
                <div className="MessageBody">{chatMessage.text}</div>
              </div>
            </div>
          </div>
        ))}
        <div ref={divRef} id="target-div"></div>
      </div>

      {showScrollToBottomButton && (
        <button className="scroll-to-bottom" onClick={scrollToBottom}>
          <ExpandMoreIcon />
        </button>
      )}

      <div className="InputContainer">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="MessageInput"
          placeholder="Type a message..."
        />
        <div onClick={handleSendMessage}>
          <SendIcon />
        </div>
      </div>

      {!isConnected && <div className="ConnectionStatus">Reconnecting...</div>}
    </div>
  );
};

export default ChatRoom;
