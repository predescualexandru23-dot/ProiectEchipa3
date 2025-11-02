import { useState, useEffect } from "react";
import Header from "../../components/Header/Header";

export default function TeacherDashboard() {
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [message, setMessage] = useState("");
  const [currentActivity, setCurrentActivity] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [pastActivities, setPastActivities] = useState([]);

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
        fetchCurrentActivity(); // reîncarcă activitatea curentă
        fetchPastActivities(); // actualizează istoricul
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

  // 🔹 Polling pentru feedback în timp real
  useEffect(() => {
    fetchCurrentActivity();
    fetchPastActivities();

    const interval = setInterval(fetchCurrentActivity, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8 space-y-8">
        {/* 🔹 FORMULAR CREARE ACTIVITATE */}
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
            Panou Profesor
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Descriere
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                placeholder="Ex: Feedback seminar 3"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Durată (minute)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                placeholder="Ex: 15"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Cod de acces
              </label>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                placeholder="ex: ABC123"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Creează Activitate
            </button>
          </form>

          {message && (
            <p className="text-center mt-4 text-gray-700 font-medium">
              {message}
            </p>
          )}
        </div>

        {/* 🔹 ACTIVITATE CURENTĂ */}
        {currentActivity && (
          <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-3xl">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
              Activitate curentă: {currentActivity.description}
            </h2>
            <p className="text-center text-gray-600 mb-4">
              Cod: <strong>{currentActivity.accessCode}</strong> • Durată:{" "}
              {currentActivity.duration} minute
            </p>

            <h3 className="text-lg font-semibold mb-2">Feedback primit:</h3>
            {feedbacks.length === 0 ? (
              <p className="text-gray-500 text-center">Niciun feedback încă</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {feedbacks.map((f, i) => (
                  <li
                    key={i}
                    className="bg-gray-100 p-2 rounded-lg shadow-sm text-2xl"
                  >
                    {f.emoji}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 🔹 ACTIVITĂȚI TRECUTE */}
        {/* ACTIVITĂȚI TRECUTE */}
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

                    <div className="flex gap-2 mt-2 text-lg">
                      {Object.entries(counts).map(([emoji, num]) => (
                        <span key={emoji}>
                          {emoji === "happy"
                            ? "😊"
                            : emoji === "sad"
                            ? "😞"
                            : emoji === "surprised"
                            ? "😲"
                            : "😕"}{" "}
                          × {num}
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
