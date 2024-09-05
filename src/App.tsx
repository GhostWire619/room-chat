import React from "react";
import { useAuth } from "./components/AuthContext";
import RoomDashboard from "./components/RoomDashboard";
import LoginPage from "./components/Login";
import "./App.css";
import { SocketProvider } from "./components/SocketContext";

const App: React.FC = () => {
  const { cookies } = useAuth();

  if (!cookies.userData) {
    return <LoginPage />;
  }

  return (
    <SocketProvider
      userName={cookies.userData.userName}
      room={cookies.roomTitle}
    >
      <div className="App">
        <RoomDashboard />
      </div>
    </SocketProvider>
  );
};

export default App;
