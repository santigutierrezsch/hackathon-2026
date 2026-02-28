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
    // Decode JWT payload (without verification) to get diagnostic info
    let tokenAud = "unknown";
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
        tokenAud = payload.aud || "unknown";
      }
    } catch {}

    const serverProject = admin.app().options?.credential?.projectId ||
                          process.env.FIREBASE_PROJECT_ID || "unknown";

    console.error(
      `[auth] verifyIdToken failed: ${e.code} — ${e.message}\n` +
      `  Token audience (project): ${tokenAud}\n` +
      `  Server project:           ${serverProject}`
    );

    return res.status(401).json({
      error: "Invalid or expired token",
      code: e.code || "unknown",
      detail: e.message,
      hint: tokenAud !== serverProject
        ? `Token project "${tokenAud}" does not match server project "${serverProject}"`
        : undefined
    });
  }
}
