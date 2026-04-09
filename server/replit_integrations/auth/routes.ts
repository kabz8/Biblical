import type { Express } from "express";
import { isAuthenticated, supabaseAdmin } from "./replitAuth";
import { authStorage } from "./storage";
import { db } from "../../db";
import { profiles } from "@shared/schema";
import { eq } from "drizzle-orm";

export function registerAuthRoutes(app: Express): void {
  async function resolveRole(userId: string, jwtRole?: string | null): Promise<string> {
    try {
      const [profile] = await db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);
      return profile?.role || jwtRole || "student";
    } catch {
      return jwtRole || "student";
    }
  }

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
    const role = await resolveRole(req.user.id, req.user.role);
    res.json({ ...req.user, role });
  });

  /**
   * POST /api/auth/sync
   * Called after registration to create the public.users record.
   */
  app.post("/api/auth/sync", isAuthenticated as any, async (req: any, res) => {
    try {
      await authStorage.upsertUser({
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profileImageUrl: req.user.profileImageUrl,
      });
      const role = await resolveRole(req.user.id, req.user.role);
      res.status(201).json({ ...req.user, role });
    } catch (err) {
      res.status(500).json({ message: "Failed to sync user" });
    }
  });
}
