import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

   return (
    <header className="header">
      <div className="welcome">
        Bun venit{role === "profesor" ? ", Prof." : ""} {name || "utilizator"}!
      </div>
      <button onClick={handleLogout} className="logout-btn">
      🔒 Logout
      </button>
    </header>
  );
}

