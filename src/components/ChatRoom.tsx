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
  setIsChatRoomVisible: (value: boolean) => void;
}

interface Message {
  id: number;
  text: string;
  userName: string;
}

// interface UserStatus {
//   userName: string;
//   status: string;
// }

const ChatRoom: React.FC<ChatRoomProps> = ({ setIsChatRoomVisible }) => {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { cookies, sendNotification, requestNotificationPermission, API_URL } = useAuth();

  // Single useEffect for socket initialization and cleanup
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

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnected(true);
      
      // Join room after connection
      if (cookies.roomTitle) {
        socket.emit("join", {
          userName: cookies.userData.userName,
          room: cookies.roomTitle,
        });
        console.log("Joined room:", cookies.roomTitle);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
      setIsConnected(false);
    });

    // Message handling
    socket.on("receive_message", (data: Message) => {
      console.log("Received message:", data);
      setChat(prevChat => [...prevChat, data]);
      
      if (data.userName !== cookies.userData.userName) {
        sendNotification("New Message", {
          body: `${data.userName}: ${data.text}`,
        });
      }
    });

    // Load initial messages
    const loadMessages = async () => {
      if (cookies.roomTitle) {
        try {
          const response = await axios.post(`${API_URL}/auth/login/room`, {
            title: cookies.roomTitle,
          });
          setChat(response.data.messages);
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      }
    };
    loadMessages();

    // Cleanup function
    return () => {
      if (socket) {
        socket.emit("leave", {
          userName: cookies.userData.userName,
          room: cookies.roomTitle,
        });
        socket.off("receive_message");
        socket.off("connect");
        socket.off("disconnect");
        socket.disconnect();
      }
    };
  }, [cookies.roomTitle]); // Re-run when room changes

  const handleSendMessage = () => {
    if (message.trim() && socketRef.current && isConnected) {
      socketRef.current.emit("send_message", {
        userName: cookies.userData.userName,
        message,
        room: cookies.roomTitle,
      });
      setMessage("");
    }
  };
  return (
    <div>
      <div className="ChatRoom">
        <div
          style={{
            borderBottom: "1px solid rgb(68, 68, 68)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "68px",
            }}
          >
            <IconButton
              onClick={() => {
                // setChat([]);
                setIsChatRoomVisible(false);
              }}
              sx={{ color: "purple" }}
            >
              <ArrowBackIcon />
            </IconButton>
            <h2>Chat Room: {cookies.roomTitle}</h2>
          </div>

          <div className="OnlineStatus">
            {/* {Object.keys(usersOnline).map((user, index) => (
          <div key={index}>
            <p style={{ marginLeft: "10px" }}>
              {user}
              {usersOnline[user] === "online" ? " 🟢" : " 🔴 "}
            </p>
          </div>
        ))} */}
          </div>
        </div>
        <div
          className="MessageList"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat", // Ensure no repeat of the image
            backgroundPosition: "center", // Center the image
          }}
          ref={chatContainerRef}
        >
          {chat.map((chatMessage) => (
            <div
              key={chatMessage.id ? chatMessage.id : chatMessage.text}
              className="MessageContainer"
              style={{
                display: "flex",
                justifyContent:
                  chatMessage.userName !== cookies.userData.userName
                    ? "flex-start"
                    : "right",
              }}
            >
              <div className="MessageItem">
                <div
                  className="Avatar"
                  style={{
                    display:
                      chatMessage.userName !== cookies.userData.userName
                        ? "block"
                        : "none",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#3f51b5",
                      width: "30px",
                      height: "30px",
                    }}
                  >
                    {chatMessage.userName.charAt(0).toUpperCase()}
                  </Avatar>
                </div>
                <div
                  className={`Message ${
                    chatMessage.userName !== cookies.userData.userName
                      ? " left"
                      : ""
                  }`}
                >
                  <div className="userName">
                    <p>
                      {chatMessage.userName !== cookies.userData.userName
                        ? chatMessage.userName
                        : ""}
                    </p>
                  </div>
                  <div className="MessageBody">{chatMessage.text}</div>
                </div>
              </div>
            </div>
          ))}
          {/* Ensure this is always at the bottom of the chat */}
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
        {!isConnected && (
          <div className="ConnectionStatus">Reconnecting...</div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
