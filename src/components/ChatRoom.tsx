import React, { useEffect, useState, useRef } from "react";
import "../styles/ChatRoom.css"; // Import the CSS file
import { Avatar, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import bg from "../assets/3jfjc53fsyb61.jpg";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext"; // Import the useSocket hook

interface ChatRoomProps {
  room: string;
}
interface Message {
  id: number;
  text: string;
  userName: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ room }) => {
  const [message, setMessage] = useState<string>("");
  const divRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false);
  const { removeCookie, cookies } = useAuth();

  // Get values from the SocketContext
  const {
    chat,
    usersOnline,
    sendMessage,
    isConnected,
    loadMessages,
    socket,
    setChat,
    // userName,
  } = useSocket();

  const scrollToBottom = () => {
    if (divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth" });
      setShowScrollToBottomButton(false);
    }
  };

  const chatContainer = chatContainerRef.current;

  useEffect(() => {
    loadMessages();
    if (socket) {
      socket.on("receive_message", (data: Message) => {
        setChat((prevChat: Message[]) => [...prevChat, data]);
        // if (data.userName !== userName) {
        //   sendNotification("New Message", {
        //     body: `${data.userName}: ${data.text}`,
        //   });
        // }
      });
    }
  }, [socket]);
  useEffect(() => {
    scrollToBottom(); // Scroll to bottom whenever chat updates
  }, [chat]);

  const handleScroll = () => {
    if (chatContainer) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      setShowScrollToBottomButton(scrollHeight > scrollTop + clientHeight + 5);
    }
  };

  useEffect(() => {
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);

      // Cleanup listener on unmount
      return () => {
        chatContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [chat]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message); // Use the sendMessage function from the context
      setMessage("");
    }
  };

  return (
    <div className="ChatRoom">
      <div style={{ display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={() => removeCookie("roomTitle", { path: "/" })}
          sx={{ color: "purple" }}
        >
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
          backgroundRepeat: "no-repeat", // Ensure no repeat of the image
          backgroundPosition: "center", // Center the image
        }}
        ref={chatContainerRef}
      >
        {chat.map((chatMessage) => (
          <div
            key={chatMessage.id}
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
