import { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [message, setMessage] = useState("");
  const [currentActivity, setCurrentActivity] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [pastActivities, setPastActivities] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description, duration, accessCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Activity created successfully!");
        setDescription("");
        setDuration("");
        setAccessCode("");
        fetchCurrentActivity();
        fetchPastActivities();
      } else {
        setMessage(data.message || "Error creating activity");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to server");
    }
  };

  const fetchCurrentActivity = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/activities/current", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setCurrentActivity(null);
        setFeedbacks([]);
        setTimeLeft(0);
        return;
      }
      const data = await res.json();
      setCurrentActivity(data);
      setFeedbacks(data.feedbacks || []);

      // Calculează timpul rămas în secunde
      const now = new Date();
      const endTime = new Date(data.date).getTime() + data.duration * 60000;
      setTimeLeft(Math.max(0, Math.floor((endTime - now.getTime()) / 1000)));
    } catch (err) {
      console.error("Error when fetching current activity", err);
    }
  };

  const fetchPastActivities = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/activities/past", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPastActivities(data);
    } catch (err) {
      console.error("Error when parsing past activities", err);
    }
  };

  // Polling pentru activitatea curentă
  useEffect(() => {
    fetchCurrentActivity();
    fetchPastActivities();
    const interval = setInterval(fetchCurrentActivity, 2000);
    return () => clearInterval(interval);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          fetchPastActivities(); // mută activitatea curentă în trecut când se termină
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Header />
      <div className="professor-dashboard-wrapper">
        <div className="section">
          {/* FORMULAR CREARE ACTIVITATE */}
          <div className="create-actitivty-form-container">
            <h1 className="title" id="big">
              Add Activity
            </h1>

            <form onSubmit={handleSubmit} className="create-activity-form">
              <div className="input_and_label">
                <label>Title (description):</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Feedback seminar no.3"
                />
              </div>

              <div className="input_and_label">
                <label>Duration (minutes):</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Ex: 15"
                />
              </div>

              <div className="input_and_label">
                <label>Access code:</label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="ex: ABC123"
                />
              </div>

              <button type="submit" className="create-activity-button">
                Create Activity
              </button>
            </form>

            {message && <p className="alert-message">{message}</p>}
          </div>

          {/* ACTIVITATE CURENTĂ */}
          {currentActivity && (
            <div className="current-activity-container">
              <h2 className="title">
                Curent Activity: {currentActivity.description}
              </h2>
              <p className="info-text">
                Access code: <strong>{currentActivity.accessCode}</strong>
              </p>

              <p className="info-text">
                Remaining time: <strong>{formatTime(timeLeft)}</strong>
              </p>

              <h3 className="title" id="received-feedback">
                Received feedback:
              </h3>
              {feedbacks.length === 0 ? (
                <p className="title">No feedback given yet</p>
              ) : (
                <ul className="feedback-list">
                  {feedbacks.map((f, i) => (
                    <li key={i} className="list-item-feedback">
                      <span className="emoji-span">
                        {f.emoji === "happy"
                          ? "😊"
                          : f.emoji === "sad"
                          ? "😞"
                          : f.emoji === "surprised"
                          ? "😲"
                          : "😕"}
                      </span>
                      <span className="emoji-name-span">{f.emoji}</span>{" "}
                      <span className="time-span">
                        {new Date(f.timestamp).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="section">
          <div className="past-activities-container">
            <h2 className="title" id="big">
              Past Activities
            </h2>
            {pastActivities.length > 0 ? (
              <div className="past-activities-grid">
                {pastActivities.map((a) => {
                  const totalFeedbacks = a.feedbacks.length;
                  const counts = a.feedbacks.reduce((acc, f) => {
                    acc[f.emoji] = (acc[f.emoji] || 0) + 1;
                    return acc;
                  }, {});
                  return (
                    <div key={a.id} className="past-activity-card">
                      <p className="title">{a.description}</p>
                      <p className="info-text-past-activity">
                        Access code: {a.accessCode}
                      </p>
                      <p className="info-text-past-activity">
                        Duration: {a.duration} minutes
                      </p>
                      <p className="info-text-past-activity">
                        Data: {new Date(a.date).toLocaleString()}
                      </p>
                      <p className="info-text-past-activity">
                        Total feedback given: {totalFeedbacks}
                      </p>
                      <div className="info-text-past-activity-emoji">
                        {Object.entries(counts).map(([emoji, num]) => (
                          <span key={emoji}>
                            {emoji === "happy"
                              ? "😊"
                              : emoji === "sad"
                              ? "😞"
                              : emoji === "surprised"
                              ? "😲"
                              : "😕"}
                            × {num}{" "}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="title">No past activities</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
