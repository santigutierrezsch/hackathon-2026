import admin from "firebase-admin";

/**
 * Express middleware that verifies a Firebase ID token from the
 * Authorization: Bearer <token> header and attaches the decoded
 * token to req.user.
 */
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // { uid, email, name, picture, ... }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
