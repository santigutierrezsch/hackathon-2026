import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = loading
  const [dbUser,       setDbUser]       = useState(null);
  const [loading,      setLoading]      = useState(true);

  // ── Listen to Firebase auth state ─────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          const res   = await fetch("/api/auth/login", {
            method:  "POST",
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setDbUser(data.user);
          }
        } catch {
          // Server might be offline during dev — don't crash
        }
      } else {
        setDbUser(null);
      }

      setLoading(false);
    });

    return unsub;
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  async function getToken() {
    if (!firebaseUser) return null;
    return firebaseUser.getIdToken();
  }

  async function refreshDbUser() {
    if (!firebaseUser) return;
    try {
      const token = await getToken();
      const res   = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDbUser(data.user);
      }
    } catch {}
  }

  async function logout() {
    await signOut(auth);
    setDbUser(null);
  }

  const value = {
    firebaseUser,
    dbUser,
    loading,
    getToken,
    refreshDbUser,
    logout,
    // Convenience flags
    isLoggedIn:      !!firebaseUser,
    hasUsername:     !!dbUser?.username,
    needsUsername:   !!firebaseUser && dbUser !== null && !dbUser?.username,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
