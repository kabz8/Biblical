import type { Express } from "express";
import { isAuthenticated, supabaseAdmin } from "./replitAuth";
import { authStorage } from "./storage";

export function registerAuthRoutes(app: Express): void {
  /**
   * GET /api/auth/user
   * Verifies the Supabase JWT and returns the current user.
   * Also lazily upserts the user into our public.users table.
   */
  app.get("/api/auth/user", isAuthenticated as any, async (req: any, res) => {
    try {
      // Lazy-sync the Supabase user into our application users table
      await authStorage.upsertUser({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profileImageUrl: req.user.profileImageUrl,
      });
    } catch {
      // Non-fatal — still return the user from the JWT
    }
    res.json(req.user);
  });

  /**
   * POST /api/auth/sync
   * Called after registration to create the public.users record.
   */
  app.post("/api/auth/sync", isAuthenticated as any, async (req: any, res) => {
    try {
      const user = await authStorage.upsertUser({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profileImageUrl: req.user.profileImageUrl,
      });
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ message: "Failed to sync user" });
    }
  });
}
