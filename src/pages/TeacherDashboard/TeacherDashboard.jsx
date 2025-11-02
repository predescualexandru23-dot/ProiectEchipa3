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
  const [timeLeft, setTimeLeft] = useState(null);
  const [justExpired, setJustExpired] = useState(false);

  // 🔹 Creare activitate
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, duration, accessCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Activitate creată cu succes");
        setDescription("");
        setDuration("");
        setAccessCode("");
        fetchCurrentActivity();
        fetchPastActivities();
      } else {
        setMessage(data.message || "❌ Eroare la creare");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Eroare la conectarea cu serverul");
    }
  };

  // 🔹 Obține activitatea curentă
  const fetchCurrentActivity = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/activities/current");
      if (!res.ok) {
        setCurrentActivity(null);
        setFeedbacks([]);
        return;
      }
      const data = await res.json();
      setCurrentActivity(data);
      setFeedbacks(data.feedbacks || []);

      // calculează timpul rămas
      if (data.date && data.duration) {
        const now = new Date();
        const startTime = new Date(data.date);
        const endTime = new Date(startTime.getTime() + data.duration * 60000);
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);
      }
    } catch (err) {
      console.error("Eroare la preluarea activității curente:", err);
    }
  };

  // 🔹 Obține activitățile trecute
  const fetchPastActivities = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/activities/past");
      const data = await res.json();
      setPastActivities(data);
    } catch (err) {
      console.error("Eroare la preluarea activităților trecute:", err);
    }
  };

  // 🔹 Polling pentru activitate curentă (cu protecție după expirare)
  useEffect(() => {
    if (!justExpired) {
      fetchCurrentActivity();
    }
    fetchPastActivities();

    const interval = setInterval(() => {
      if (!justExpired) {
        fetchCurrentActivity();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [justExpired]);

  // 🔹 Timer pentru activitatea curentă
  useEffect(() => {
    if (!currentActivity || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const expiredActivity = {
            ...currentActivity,
            feedbacks: feedbacks || [],
          };

          // adaugă imediat în lista de activități trecute
          setPastActivities((prev) => {
            if (
              expiredActivity.id &&
              prev.some((p) => p.id === expiredActivity.id)
            ) {
              return prev;
            }
            return [expiredActivity, ...prev];
          });

          setCurrentActivity(null);
          setFeedbacks([]);
          setTimeLeft(0);
          setJustExpired(true);

          fetchPastActivities();
          setTimeout(() => setJustExpired(false), 3000);

          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentActivity, timeLeft, feedbacks]);

  // 🔹 Formatare timp (mm:ss)
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 🔹 Map emoji la simbol
  const emojiMap = {
    happy: "😊",
    sad: "😞",
    surprised: "😲",
    confused: "😕",
  };

  return (
    <>
      <Header />
      <div className="teacher-dashboard-container">
        {/* FORMULAR CREARE ACTIVITATE */}
        <div className="create-actitivty-form-container">
          <h1 className="title">Add Activity</h1>

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

          {message && (
            <p className="text-center mt-4 text-gray-700 font-medium">
              {message}
            </p>
          )}
        </div>

        {/* 🔹 Activitate curentă */}
        {currentActivity && (
          <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-3xl">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
              Activitate curentă: {currentActivity.description}
            </h2>
            <p className="text-center text-gray-600 mb-2">
              Cod: <strong>{currentActivity.accessCode}</strong> • Durată:{" "}
              {currentActivity.duration} minute
            </p>
            <p className="text-center text-gray-700 mb-4">
              🕒 Timp rămas: {formatTime(timeLeft || 0)}
            </p>

            <h3 className="text-lg font-semibold mb-2 text-center">
              Feedback primit:
            </h3>
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 text-center">Niciun feedback încă</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {feedbacks.map((f, i) => (
                  <li
                    key={i}
                    className="py-2 flex items-center justify-between"
                  >
                    <span className="text-2xl">
                      {emojiMap[f.emoji] || "❓"}
                    </span>
                    <span className="text-gray-700 capitalize">{f.emoji}</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(f.timestamp).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 🔹 Activități trecute */}
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-5xl">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">
            Activități trecute
          </h2>
          {pastActivities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {pastActivities.map((a) => {
                const totalFeedbacks = a.feedbacks.length;
                const counts = a.feedbacks.reduce((acc, f) => {
                  acc[f.emoji] = (acc[f.emoji] || 0) + 1;
                  return acc;
                }, {});
                return (
                  <div
                    key={a.id}
                    className="p-4 bg-gray-50 border rounded-xl shadow hover:shadow-md transition"
                  >
                    <p className="font-semibold text-lg text-indigo-600">
                      {a.description}
                    </p>
                    <p className="text-sm text-gray-600">Cod: {a.accessCode}</p>
                    <p className="text-sm text-gray-600">
                      Durată: {a.duration} min
                    </p>
                    <p className="text-sm text-gray-600">
                      Data: {new Date(a.date).toLocaleString()}
                    </p>
                    <p className="text-sm mt-2 text-gray-700">
                      Total feedback-uri: {totalFeedbacks}
                    </p>

                    <div className="flex gap-2 mt-2 text-lg flex-wrap">
                      {Object.entries(counts).map(([emoji, num]) => (
                        <span key={emoji}>
                          {emojiMap[emoji] || emoji} × {num}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Nu există activități trecute.</p>
          )}
        </div>
      </div>
    </>
  );
}
