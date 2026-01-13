import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Login/Login.css";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        name,
        email,
        password,
        role,
      });
      alert("Cont creat cu succes!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Eroare la înregistrare");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-card-wrapper">
        <div className="switcher">
          <div id="login-indicator">Sign Up</div>
          <button onClick={() => navigate("/login")} id="signup-switch-button">
            Log In
          </button>
        </div>
        <div className="login-card">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              placeholder="Nume complet"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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

            {/* <select
              className="border p-2 rounded"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="student">Student</option>
              <option value="profesor">Profesor</option>
            </select> */}

            <div className="radio-group">
              <label
                className={`radio-plus-label ${
                  role === "student" ? "active" : ""
                }`}
                id="label-student"
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-radio"
                />
                Student
              </label>

              <label
                className={`radio-plus-label ${
                  role === "profesor" ? "active" : ""
                }`}
                id="label-professor"
              >
                <input
                  type="radio"
                  name="role"
                  value="profesor"
                  checked={role === "profesor"}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-radio"
                />
                Profesor
              </label>
            </div>

            <button type="submit" id="submit-button">
              Creează cont
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
