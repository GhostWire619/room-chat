import React, {useEffect, useState} from "react";
import { useAuth } from "./components/AuthContext";
import RoomDashboard from "./components/RoomDashboard";
import LoginPage from "./components/Login";
import "./App.css";
import { SocketProvider } from "./components/SocketContext";

const App: React.FC = () => {
  const { cookies } = useAuth();
  const [room,setRoom] = useState("")
  
  useEffect(()=>{
    setRoom(cookies.roomTitle)
  },[cookies.roomTitle])
  if (!cookies.userData) {
    return <LoginPage />;
  }

  return (
    <SocketProvider
      userName={cookies.userData.userName}
      room={room}
    >
      <div className="App">
        <RoomDashboard />
      </div>
    </SocketProvider>
  );
};

export default App;
