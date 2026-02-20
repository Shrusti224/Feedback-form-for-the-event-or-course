import { Navigate, Route, Routes } from "react-router-dom";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import PublicFormPage from "./pages/PublicFormPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/forms/:id" element={<PublicFormPage />} />
      <Route path="/" element={<Navigate to="/admin/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;