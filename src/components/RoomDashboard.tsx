import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import "../styles/RoomDashboard.css";
// Adjust the path accordingly

interface Props {
  toggleChatRoom: () => void;
}

// import { useNavigate } f<rom 'react-router-dom';

const RoomDashboard: React.FC<Props> = ({ toggleChatRoom }) => {
  const [rooms, setRooms] = useState<{ id: number; title: string }[]>([]);
  const [newRoomTitle, setNewRoomTitle] = useState<string>("");
  const [isJoin, setIsJoin] = useState(true);
  const { cookies, logout, setCookie, API_URL } = useAuth();
  const [error, setError] = useState<string>("");
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

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/auth/register/room`, {
        title: newRoomTitle,
        user_id: cookies.id,
      });
      setNewRoomTitle("");

      // Fetch updated rooms
      fetchRooms();
      setError("");
      alert("room created successfuly");
    } catch (error) {
      setError("Room alrady exists");
    }
  };
  const handlEnterRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/auth/login/room`, {
        title: newRoomTitle,
      });
      setNewRoomTitle("");
      setCookie("roomTitle", newRoomTitle, { path: "/" });
      setError("");
    } catch (error) {
      setError("room dsnt exist");
    }
  };

  return (
    <>
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
              onClick={() => {
                setCookie("roomTitle", room.title, { path: "/" });
                toggleChatRoom();
              }}
            >
              <p>{room.title}</p>
            </div>
          ))}
        </div>
        {isJoin ? (
          <div className="create-room-form">
            <form onSubmit={handlEnterRoom}>
              <input
                type="text"
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                placeholder="Enter room name"
                required
              />
              <button type="submit">Join</button>
            </form>
            {error && (
              <p
                style={{
                  color: "red",
                  marginTop: "5px",
                  textAlign: "center",
                  fontSize: "small",
                }}
              >
                {error}
              </p>
            )}
            <p style={{ marginTop: "5px", textAlign: "center" }}>
              to create New room{" "}
              <a
                href="#"
                onClick={() => setIsJoin(false)}
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Click here
              </a>
            </p>
          </div>
        ) : (
          <div className="create-room-form">
            <form onSubmit={handleCreateRoom}>
              <input
                type="text"
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                placeholder="Enter room name"
                required
              />
              <button type="submit">Create</button>
            </form>
            {error && (
              <p
                style={{
                  color: "red",
                  marginTop: "5px",
                  textAlign: "center",
                  fontSize: "small",
                }}
              >
                {error}
              </p>
            )}
            <p style={{ marginTop: "5px", textAlign: "center" }}>
              to join existing room{" "}
              <a
                href="#"
                onClick={() => setIsJoin(true)}
                style={{ color: "#007BFF", textDecoration: "none" }}
              >
                Click here
              </a>
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default RoomDashboard;
