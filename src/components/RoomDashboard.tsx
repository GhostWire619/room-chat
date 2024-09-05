import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "../styles/RoomDashboard.css";
import ChatRoom from "./ChatRoom";
// Adjust the path accordingly

// import { useNavigate } from 'react-router-dom';

const RoomDashboard: React.FC = () => {
  const [rooms, setRooms] = useState<{ id: number; title: string }[]>([]);
  const [newRoomTitle, setNewRoomTitle] = useState<string>("");
  const { cookies, logout, setCookie, API_URL } = useAuth();
  //   const navigate = useNavigate();

  useEffect(() => {
    // Fetch existing rooms on component mount
    fetchRooms();
  }, []);
  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/rooms/${cookies.id}`); // Adjust URL to your API ${cookies.userData.id}
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // const handleCreateRoom = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     await axios.post(`${API_URL}/auth/register/room`, {
  //       title: newRoomTitle,
  //       user_id: cookies.id,
  //     });
  //     setNewRoomTitle("");

  //     // Fetch updated rooms
  //     fetchRooms();
  //   } catch (error) {
  //     console.error("Error creating room:", error);
  //   }
  // };
  const handlEnterRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/auth/login/room`, {
        title: newRoomTitle,
      });
      setNewRoomTitle("");
      setCookie("roomTitle", newRoomTitle, { path: "/" });
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };
  return (
    <>
      {cookies.roomTitle ? (
        <ChatRoom room={cookies.roomTitle} />
      ) : (
        <div className="room-dashboard">
          <div className="headerContainer">
            <div className="header">
              <h2>Rooms</h2>
            </div>
            <button onClick={logout}>logout</button>
          </div>

          <div className="room-list">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="room-item"
                onClick={() =>
                  setCookie("roomTitle", room.title, { path: "/" })
                }
              >
                {room.title}
              </div>
            ))}
          </div>
          <div className="create-room-form">
            <form onSubmit={handlEnterRoom}>
              <input
                type="text"
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                placeholder="Enter room name"
                required
              />
              <button type="submit">Create Room</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomDashboard;
