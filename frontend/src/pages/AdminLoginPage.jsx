import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">Smart Feedback Admin</h1>
        <p className="mt-1 text-sm text-slate-600">Secure login using JWT authentication</p>

        {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="mt-4 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLoginPage;