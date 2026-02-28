import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { isLoggedIn, hasUsername, loading } = useAuth();
  const navigate = useNavigate();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isLoggedIn) {
      navigate(hasUsername ? "/dashboard" : "/set-username", { replace: true });
    }
  }, [loading, isLoggedIn, hasUsername, navigate]);

  async function handleGoogleSignIn() {
    setErr("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // AuthContext listener will fire → redirect handled by useEffect above
    } catch (e) {
      if (e.code !== "auth/popup-closed-by-user") {
        setErr(e.message || "Sign-in failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading) return null;

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 60 }}>
      <div className="card r1" style={{ textAlign: "center", padding: "40px 32px" }}>
        <div className="tape tl" />
        <div className="tape tr" />

        <div style={{ fontSize: 56, marginBottom: 12 }}>🌱</div>

        <h1 className="h1" style={{ fontSize: 30, marginBottom: 6 }}>EcoTracker</h1>
        <p className="sub" style={{ marginBottom: 28, fontSize: 15 }}>
          Track your sustainability habits, earn XP, and compete with friends.
        </p>

        <div className="divider" />

        <div className="sectionTitle" style={{ marginTop: 20 }}>Get started</div>

        <button
          className="btn primary"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "14px 20px",
            fontSize: 15,
            marginTop: 8,
            borderRadius: 18,
          }}
          onClick={handleGoogleSignIn}
          disabled={busy}
        >
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {busy ? "Signing in…" : "Continue with Google"}
        </button>

        {err && (
          <div className="smallNote" style={{ color: "#c0392b", marginTop: 12 }}>
            {err}
          </div>
        )}

        <div className="smallNote" style={{ marginTop: 20 }}>
          By signing in you agree to track your eco-friendly activities and earn XP. No data is sold or shared.
        </div>

        <div className="divider" style={{ marginTop: 24 }} />

        <div className="sectionTitle">What you can do</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8, textAlign: "left" }}>
          {[
            ["⚡", "Earn XP for sustainable actions"],
            ["🏆", "Compete on global & friends leaderboards"],
            ["👥", "Add friends and track their progress"],
            ["🛠️", "Access sustainability tools & resources"],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
