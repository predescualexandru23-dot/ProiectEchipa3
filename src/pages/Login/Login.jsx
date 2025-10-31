import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      alert("Autentificare reușită!");
      navigate("/"); // poți schimba destinația după login
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
