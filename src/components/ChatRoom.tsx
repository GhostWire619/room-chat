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

const ChatRoom: React.FC<ChatRoomProps> = ({ room, setIsChatRoomVisible }) => {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);
  // const [usersOnline, setUsersOnline] = useState<{ [key: string]: string }>({});
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [prevRoom, setPrevRoom] = useState("");
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { cookies, sendNotification, requestNotificationPermission, API_URL } =
    useAuth();

  useEffect(() => {
    // Load messages on mount
    disconnectReceiveMessage();
    const loadMessages = async () => {
      if (cookies.roomTitle) {
        try {
          const response = await axios.post(`${API_URL}/auth/login/room`, {
            title: room,
          });
          const { messages } = response.data;
          setChat(messages);
          setPrevRoom(cookies.roomTitle);
          setupSocketListeners();
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      }
    };

    loadMessages();

    return () => {
      if (socketRef.current && cookies.roomTitle)
        socketRef.current.emit("leave", {
          userName: cookies.userData.userName,
          room,
        });
    };
  }, [API_URL, room]);

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
      // socket.on("user_status", (data: UserStatus) => {
      //   // setUsersOnline((prevUsers) => ({
      //   //   ...prevUsers,
      //   //   [data.userName]: data.status,
      //   // }));
      // });

      socket.on("receive_message", (data: Message) => {
        setChat((prevChat) => [...prevChat, data]);
        if (data.userName !== cookies.userData.userName) {
          sendNotification("New Message", {
            body: `${data.userName}: ${data.text}`,
          });
        }
      });

      socket.on("connect", () => {
        console.log("Connected to socket server");
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
  }, []);

  const scrollToBottom = () => {
    if (divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollToBottomButton(false);
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom whenever chat updates
  }, [chat]);

  // useEffect(() => {
  //   console.log("room title is :" + cookies.roomTitle);
  //   if (cookies.roomTitle) {
  //     setupSocketListeners();
  //     console.log(cookies.roomTitle);
  //   } // Scroll to bottom whenever chat updates
  // }, [room, cookies.roomTitle]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
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

  const setupSocketListeners = () => {
    if (socketRef.current) {
      socketRef.current.on("receive_message", (data: Message) => {
        setChat((prevChat) => [...prevChat, data]);
        if (data.userName !== cookies.userData.userName) {
          sendNotification("New Message", {
            body: `${data.userName}: ${data.text}`,
          });
        }
      });

      socketRef.current.emit("join", {
        userName: cookies.userData.userName,
        room: cookies.roomTitle,
      });
      console.log("joind room" + cookies.roomTitle);
    }
  };
  const disconnectReceiveMessage = () => {
    if (socketRef.current) {
      // Remove the event listener for "receive_message"
      socketRef.current.off("receive_message");

      if (prevRoom) {
        socketRef.current.emit("leave", {
          userName: cookies.userData.userName,
          room: prevRoom,
        });
        console.log("lft room" + prevRoom);
      }

      console.log("Stopped receiving messages.");
    }
  };

  return (
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
              disconnectReceiveMessage();
              setIsChatRoomVisible(false);
            }}
            sx={{ color: "purple" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <h2>Chat Room: {room}</h2>
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

      {!isConnected && <div className="ConnectionStatus">Reconnecting...</div>}
    </div>
  );
};

export default ChatRoom;
