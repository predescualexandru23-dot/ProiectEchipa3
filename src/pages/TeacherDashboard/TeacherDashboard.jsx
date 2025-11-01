import { useState } from "react";
import Header from "../../components/Header/Header";

export default function TeacherDashboard() {
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, duration, accessCode }),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Activitate creată cu succes ✅");
      setDescription("");
      setDuration("");
      setAccessCode("");
    } else {
      setMessage(data.message || "Eroare la creare ❌");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
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
      </div>
    </>
  );
}
