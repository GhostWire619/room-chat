import React from "react";
import { useAuth } from "./components/AuthContext";
import RoomDashboard from "./components/RoomDashboard";
import LoginPage from "./components/Login";
import "./App.css";


const App: React.FC = () => {
  const { cookies } = useAuth();
  
  
 
  if (!cookies.userData) {
    return <LoginPage />;
  }

  return (
  
      <div className="App">
        <RoomDashboard />
      </div>
  );
};

export default App;
