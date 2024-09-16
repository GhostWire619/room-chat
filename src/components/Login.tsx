// LoginPage.tsx
import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import Register from "./Register";

const LoginPage: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [isRegisterd, setisRegisterd] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("loading...");
      await login(userName, password);

      setError("");
    } catch (err: any) {
      setError("Invalid username or password");
    }
  };

  if (!isRegisterd) {
    return <Register setisRegisterd={setisRegisterd} />;
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#0d0f0f",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        maxHeight: "400px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>
      <form onSubmit={handleLogin}>
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
              color: "white",
              outline: "none",
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
              color: "white",
              outline: "none",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
      {error && (
        <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>
          {error}
        </p>
      )}
      <p style={{ marginTop: "15px", textAlign: "center" }}>
        Don’t have an account yet?{" "}
        <a
          href="#"
          onClick={() => setisRegisterd(false)}
          style={{ color: "#007BFF", textDecoration: "none" }}
        >
          Click here
        </a>
      </p>
    </div>
  );
};

export default LoginPage;
