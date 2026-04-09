import { createClient } from "@supabase/supabase-js";
import type { Express, RequestHandler } from "express";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Server-side admin client — never expose this key to the frontend.
export const supabaseAdmin = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// No passport/session setup needed — Supabase Auth manages sessions via JWT.
export async function setupAuth(_app: Express) {
  if (!supabaseAdmin) {
    console.warn("[auth] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — auth disabled in this environment.");
  }
}

// Stub kept for compatibility — no longer used.
export function getSession() {
  return (_req: any, _res: any, next: any) => next();
}

/**
 * Middleware: verify Supabase JWT from Authorization: Bearer <token> header.
 * Sets req.user = { id, email, firstName, lastName, user_metadata }
 */
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ message: "Auth not configured" });
  }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  // Attach a normalised user object
  const meta = data.user.user_metadata || {};
  req.user = {
    id: data.user.id,
    email: data.user.email,
    firstName: meta.first_name || meta.firstName || null,
    lastName: meta.last_name || meta.lastName || null,
    profileImageUrl: meta.avatar_url || null,
    role: meta.role || "student",
  };
  next();
};
