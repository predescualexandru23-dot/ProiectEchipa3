import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const API_URL =
    "https://feedback-app-123-d3b8dkfce8h2ctey.westeurope-01.azurewebsites.net/api/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("name", data.user.name);

      if (data.user.role === "profesor") {
        navigate("/dashboard");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Eroare la autentificare");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-card-wrapper">
        <div className="switcher">
          <button
            id="signup-switch-button"
            onClick={() => navigate("/register")}
          >
            Sign Up
          </button>
          <div id="login-indicator">Log In</div>
        </div>
        <div className="login-card">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <input
              type="email"
              placeholder="Email"
              className="text-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Parolă"
              className="text-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" id="submit-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
