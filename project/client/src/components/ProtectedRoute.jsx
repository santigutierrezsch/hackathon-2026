import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Wraps a route so only authenticated users with a username can access it.
 * - Not logged in → /login
 * - Logged in but no username → /set-username
 */
export default function ProtectedRoute({ children }) {
  const { firebaseUser, dbUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌱</div>
          <div>Loading…</div>
        </div>
      </div>
    );
  }

  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (dbUser && !dbUser.username) return <Navigate to="/set-username" replace />;

  return children;
}
