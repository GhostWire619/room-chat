// Register.tsx
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

interface Prop {
  setisRegisterd: (value: boolean) => void;
}

const Register: React.FC<Prop> = ({ setisRegisterd }) => {
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { API_URL } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("loading...");
      const response = await axios.post(`${API_URL}/auth/register`, {
        userName,
        password,
      });
      setSuccess(response.data.msg);
      setError("");
      setUserName("");
      setPassword("");
      setisRegisterd(true);
      alert("success");
    } catch (err: any) {
      setError(err.response?.data?.msg || "Registration failed.");
      setSuccess("");
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#0d0f0f",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Register</h2>
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Username:
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Password:
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              border: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </form>
      {error && (
        <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>
          {error}
        </p>
      )}
      {success && (
        <p style={{ color: "green", marginTop: "15px", textAlign: "center" }}>
          {success}
        </p>
      )}
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Already have an account?{" "}
        <a
          href="#"
          onClick={() => setisRegisterd(true)}
          style={{ color: "#007BFF", textDecoration: "none" }}
        >
          Click here
        </a>
      </p>
    </div>
  );
};

export default Register;
