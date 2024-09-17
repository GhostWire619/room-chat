import React from "react";
import { useAuth } from "./components/AuthContext";
import RoomDashboard from "./components/RoomDashboard";
import LoginPage from "./components/Login";
import ChatRoom from "./components/ChatRoom";
import "./App.css";
import { useEffect, useState } from "react";

const App: React.FC = () => {
  const { cookies } = useAuth();
  const [isChatRoomVisible, setIsChatRoomVisible] = useState(false);

  // Effect to handle responsive layout changes based on device width
  useEffect(() => {
    if (cookies.userData) {
      window.addEventListener("resize", handleResize);
      // Initial call to adjust layout based on current window width
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isChatRoomVisible, cookies.userData]);

  if (!cookies.userData) {
    return <LoginPage />;
  }

  const handleResize = () => {
    const roomDashboard = document.querySelector(
      ".room-dashboard"
    ) as HTMLElement;
    const chatRoom = document.querySelector(".ChatRoom") as HTMLElement;
    const chatRoom_m = document.querySelector(".MessageList") as HTMLElement;
    const chatRoom_i = document.querySelector(".InputContainer") as HTMLElement;

    if (window.innerWidth < 720) {
      if (chatRoom)
        chatRoom.style.display = isChatRoomVisible ? "block" : "none";
      chatRoom.style.width = isChatRoomVisible ? "100vw" : "100vw";
      chatRoom_m.style.maxWidth = isChatRoomVisible ? "100vw" : "100vw";
      chatRoom_i.style.maxWidth = isChatRoomVisible ? "99vw" : "100vw";
      roomDashboard.style.display = isChatRoomVisible ? "none" : "block";
      if (roomDashboard)
        roomDashboard.style.width = isChatRoomVisible ? "100vw" : "100vw";
    } else {
      if (chatRoom) chatRoom.style.display = "block";
      roomDashboard.style.display = "block";
      if (roomDashboard) roomDashboard.style.width = "30vw"; // Or adjust accordingly
      chatRoom.style.width = isChatRoomVisible ? "70vw" : "70vw";
      chatRoom_m.style.maxWidth = isChatRoomVisible ? "69vw" : "69vw";
      chatRoom_i.style.maxWidth = isChatRoomVisible ? "68vw" : "68vw";
    }
  };

  const toggleChatRoom = () => {
    setIsChatRoomVisible(true);
    handleResize();
  };

  return (
    <>
      <div className="App">
        <RoomDashboard toggleChatRoom={toggleChatRoom} />
        <ChatRoom setIsChatRoomVisible={setIsChatRoomVisible} />
      </div>
    </>
  );
};

export default App;
