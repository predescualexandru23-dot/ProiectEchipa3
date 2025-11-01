import { useState, useEffect } from "react";
import axios from "axios";

export default function ActivityPage() {
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [activity, setActivity] = useState(null);
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0); // în secunde

  // Polling feedback
  useEffect(() => {
    let interval;

    if (activity) {
      const fetchFeedback = async () => {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/activities/feedback/${activity.accessCode}`
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
      const res = await axios.post(
        "http://localhost:5000/api/activities/join",
        {
          accessCode: accessCodeInput,
        }
      );

      if (!res.data) {
        setMessage("Cod invalid sau activitate inexistentă");
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
      setMessage("Eroare la conectarea la activitate");
    }
  };

  // Trimite feedback
  const sendFeedback = async (emoji) => {
    if (timeLeft <= 0) return;

    try {
      await axios.post("http://localhost:5000/api/activities/feedback", {
        accessCode: activity.accessCode,
        emoji,
      });
      // fetch feedback imediat
      const res = await axios.get(
        `http://localhost:5000/api/activities/feedback/${activity.accessCode}`
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
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Introdu codul activității</h2>
        <input
          value={accessCodeInput}
          onChange={(e) => setAccessCodeInput(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "1rem" }}
        />
        <button onClick={joinActivity} style={{ padding: "0.5rem 1rem" }}>
          Accesează activitatea
        </button>
        {message && <p style={{ color: "red" }}>{message}</p>}
      </div>
    );
  }

  // Pagina activității
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Activitate: {activity.accessCode}</h2>
      <p style={{ fontSize: "1.2rem" }}>
        🕒 Timp rămas: {formatTime(timeLeft)}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 100px)",
          gap: "10px",
          justifyContent: "center",
          margin: "2rem 0",
        }}
      >
        <button
          onClick={() => sendFeedback("happy")}
          disabled={timeLeft === 0}
          style={{
            fontSize: "2rem",
            cursor: timeLeft === 0 ? "not-allowed" : "pointer",
          }}
        >
          😊
        </button>
        <button
          onClick={() => sendFeedback("sad")}
          disabled={timeLeft === 0}
          style={{
            fontSize: "2rem",
            cursor: timeLeft === 0 ? "not-allowed" : "pointer",
          }}
        >
          😞
        </button>
        <button
          onClick={() => sendFeedback("surprised")}
          disabled={timeLeft === 0}
          style={{
            fontSize: "2rem",
            cursor: timeLeft === 0 ? "not-allowed" : "pointer",
          }}
        >
          😲
        </button>
        <button
          onClick={() => sendFeedback("confused")}
          disabled={timeLeft === 0}
          style={{
            fontSize: "2rem",
            cursor: timeLeft === 0 ? "not-allowed" : "pointer",
          }}
        >
          😕
        </button>
      </div>

      <h3>Feedback primit:</h3>
      <ul>
        {feedbacks.map((f, i) => (
          <li key={i}>
            {f.emoji} - {new Date(f.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>

      {timeLeft === 0 && (
        <p style={{ fontWeight: "bold" }}>⏰ Activitatea s-a încheiat.</p>
      )}

      <button
        onClick={goBack}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#ccc",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        ⬅️ Înapoi la cod activitate
      </button>
    </div>
  );
}
