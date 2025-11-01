import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Activity from "./pages/Activity/Activity";
import TeacherDashboard from "./pages/TeacherDashboard/TeacherDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="profesor">
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <Activity />
              </ProtectedRoute>
            }
          />
          {/* la fel pentru student */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
