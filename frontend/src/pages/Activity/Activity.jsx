import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../components/Header/Header";
import "./Activity.css";

export default function ActivityPage() {
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [activity, setActivity] = useState(null);
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0); // în secunde
  const API_URL = "https://feedback-app-123-d3b8dkfce8h2ctey.westeurope-01.azurewebsites.net/api/";

  // Polling feedback
  useEffect(() => {
    let interval;

    if (activity) {
      const fetchFeedback = async () => {
        try {
          const res = await axios.get(
            `${API_URL}/activities/feedback/${activity.accessCode}`
          );
          setFeedbacks(res.data);
        } catch (err) {
          console.error(err);
        }
      };

      fetchFeedback();
      interval = setInterval(fetchFeedback, 2000);
    }

    return () => clearInterval(interval);
  }, [activity]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Join activitate
  const joinActivity = async () => {
    try {
      const res = await axios.post(`${API_URL}/activities/join`, {
        accessCode: accessCodeInput,
      });

      if (!res.data) {
        setMessage("Invalid code or inexistent activity");
        return;
      }

      const activityData = res.data;

      setActivity(activityData);
      setMessage("");

      const now = new Date();
      const endTime = new Date(activityData.date);
      endTime.setMinutes(endTime.getMinutes() + activityData.duration);
      setTimeLeft(Math.max(0, Math.floor((endTime - now) / 1000)));
    } catch (err) {
      console.error(err);
      setMessage("Error connecting to activity");
    }
  };

  // Trimite feedback
  const sendFeedback = async (emoji) => {
    if (timeLeft <= 0) return;

    try {
      await axios.post(`${API_URL}/activities/feedback`, {
        accessCode: activity.accessCode,
        emoji,
      });
      // fetch feedback imediat
      const res = await axios.get(
        `${API_URL}/activities/feedback/${activity.accessCode}`
      );
      setFeedbacks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Formatare timer
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Resetare stare
  const goBack = () => {
    setActivity(null);
    setAccessCodeInput("");
    setMessage("");
    setFeedbacks([]);
    setTimeLeft(0);
  };

  // Pagina de input cod activitate
  if (!activity) {
    return (
      <>
        <Header />
        <div className="code-input-container">
          <h2>Enter activity code:</h2>
          <input
            value={accessCodeInput}
            onChange={(e) => setAccessCodeInput(e.target.value)}
            className="input-filed"
          />
          <button onClick={joinActivity} className="enter-button">
            Enter
          </button>
          {message && <p style={{ color: "red" }}>{message}</p>}
        </div>
      </>
    );
  }

  // Pagina activității
  return (
    <>
      <Header />
      <div className="activity-container">
        <h2 className="activity-code">Offer feedback!</h2>

        <p className="time-remaining">Time remaining: {formatTime(timeLeft)}</p>

        <div className="feedback-grid">
          <button
            className="feedback-button"
            onClick={() => sendFeedback("Happy")}
            disabled={timeLeft === 0}
          >
            😊
          </button>
          <button
            className="feedback-button"
            onClick={() => sendFeedback("Sad")}
            disabled={timeLeft === 0}
          >
            😞
          </button>
          <button
            className="feedback-button"
            onClick={() => sendFeedback("Surprised")}
            disabled={timeLeft === 0}
          >
            😲
          </button>
          <button
            className="feedback-button"
            onClick={() => sendFeedback("Confused")}
            disabled={timeLeft === 0}
          >
            😕
          </button>
        </div>
        <h3 className="activity-list-title">
          Activity Code: {activity.accessCode}
        </h3>

        <ul id="activity-list">
          {feedbacks.map((f, i) => (
            <li className="list-item" key={i}>
              {new Date(f.timestamp).toLocaleTimeString()} - {f.emoji}
            </li>
          ))}
        </ul>
        {timeLeft === 0 && (
          <p id="end-activity-toast">This activity has ended</p>
        )}

        <button className="back-button" onClick={goBack}>
          Exit activity
        </button>
      </div>
    </>
  );
}
