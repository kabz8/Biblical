import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerAuthRoutes, setupAuth } from "./replit_integrations/auth";
import { isAuthenticated, supabaseAdmin } from "./replit_integrations/auth/replitAuth";
import { authStorage } from "./replit_integrations/auth/storage";
import { db } from "./db";
import { users as authUsers } from "@shared/models/auth";
import { and, eq } from "drizzle-orm";

import {
  insertActivitySubmissionSchema,
  insertCourseSchema,
  insertSongSchema,
  insertTrackSchema,
  insertQuizQuestionSchema,
  insertWordSearchWordSchema,
  insertCrosswordPuzzleSchema,
  insertTestimonySchema,
  insertPrayerSchema,
  insertTutorTaskSchema,
  profiles,
  paymentOrders,
  courses,
  enrollments,
  tutorTasks,
  songs,
  stewardshipTypes,
} from "@shared/schema";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SEED_ON_BOOT = process.env.SEED_ON_BOOT === "true";
const FORCED_ADMIN_EMAIL = "kabaikunjane@gmail.com";
const FORCED_ADMIN_PASSWORD = "KingK00!!";
const OPEN_ADMIN_DASHBOARD = true;
const ADMIN_ROLES = new Set(["admin", "super_admin", "super-admin", "superadmin"]);

/**
 * isAdmin middleware — verifies role-based admin access.
 */
const isAdmin: RequestHandler = async (req: any, res, next) => {
  if (OPEN_ADMIN_DASHBOARD) return next();
  if (!req.user) {
    return res.status(403).json({ message: "Forbidden — admin only" });
  }
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.userId, req.user.id))
    .limit(1);
  const requestRole = String(req.user.role || "").toLowerCase();
  const profileRole = String(profile?.role || "").toLowerCase();
  const hasRole = ADMIN_ROLES.has(requestRole) || ADMIN_ROLES.has(profileRole);
  const isFallbackEmailAdmin = !!ADMIN_EMAIL && req.user.email?.toLowerCase() === ADMIN_EMAIL;
  const isAdminUser = hasRole || isFallbackEmailAdmin;
  if (!isAdminUser) {
    return res.status(403).json({ message: "Forbidden — admin only" });
  }
  next();
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // Ensure requested default admin exists and is marked as admin.
  // Run in background so API startup is never blocked on auth admin calls.
  async function bootstrapForcedAdmin() {
    if (!supabaseAdmin) return;
    try {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      const existing = list?.users?.find((u: any) => u.email?.toLowerCase() === FORCED_ADMIN_EMAIL);
      let adminUserId = existing?.id as string | undefined;
      if (!existing) {
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email: FORCED_ADMIN_EMAIL,
          password: FORCED_ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { role: "admin", first_name: "Kabai", last_name: "Kunjane" },
        });
        if (!error) adminUserId = created.user?.id;
      } else {
        await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          password: FORCED_ADMIN_PASSWORD,
          user_metadata: { ...(existing.user_metadata || {}), role: "admin" },
        });
      }
      if (adminUserId) {
        const [existingProfile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.userId, adminUserId))
          .limit(1);
        if (existingProfile) {
          await db.update(profiles).set({ role: "admin" }).where(eq(profiles.id, existingProfile.id));
        } else {
          await db.insert(profiles).values({ userId: adminUserId, role: "admin" });
        }
      }
    } catch (e) {
      console.warn("[auth] Forced admin bootstrap failed:", (e as Error).message);
    }
  }
  void bootstrapForcedAdmin();

  // ── Activity Submissions ────────────────────────────────────────────────
  app.get("/api/activity-submissions/:type", async (req, res) => {
    const submissions = await storage.getActivitySubmissions(req.params.type);
    res.json(submissions);
  });

  app.post("/api/activity-submissions", isAuthenticated as any, async (req: any, res) => {
    try {
      const data = insertActivitySubmissionSchema.parse({ ...req.body, userId: req.user.id });
      const submission = await storage.createActivitySubmission(data);
      res.status(201).json(submission);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create submission" });
    }
  });

  // ── Courses / Tracks ───────────────────────────────────────────────────
  app.get(api.tracks.list.path, async (_, res) => res.json(await storage.getTracks()));
  app.get(api.courses.list.path, async (_, res) => res.json(await storage.getCourses()));
  app.get(api.courses.get.path, async (req, res) => {
    const course = await storage.getCourseBySlug(req.params.slug);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  });
  app.post("/api/admin/tracks", isAuthenticated as any, isAdmin, async (req, res) => {
    try {
      const data = insertTrackSchema.parse(req.body);
      res.status(201).json(await storage.createTrack(data));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create track" });
    }
  });
  app.post("/api/admin/courses", isAuthenticated as any, isAdmin, async (req, res) => {
    try {
      const data = insertCourseSchema.parse(req.body);
      res.status(201).json(await storage.createCourse(data));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // ── Enrollments ────────────────────────────────────────────────────────
  app.get(api.enrollments.list.path, isAuthenticated as any, async (req: any, res) => {
    res.json(await storage.getEnrollments(req.user.id));
  });
  app.post(api.enrollments.create.path, isAuthenticated as any, async (req: any, res) => {
    try {
      const input = api.enrollments.create.input.parse(req.body);
      const enrollment = await storage.createEnrollment(req.user.id, input.courseId);
      res.status(201).json(enrollment);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      throw err;
    }
  });

  // ── Progress ───────────────────────────────────────────────────────────
  app.get(api.progress.list.path, isAuthenticated as any, async (req: any, res) => {
    res.json(await storage.getProgress(req.user.id));
  });
  app.post(api.progress.markComplete.path, isAuthenticated as any, async (req: any, res) => {
    try {
      const input = api.progress.markComplete.input.parse(req.body);
      const record = await storage.markLessonComplete(req.user.id, input.lessonId);
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // ── User Dashboard Data ────────────────────────────────────────────────
  app.get("/api/me/profile", isAuthenticated as any, async (req: any, res) => {
    const [u] = await db.select().from(authUsers).where(eq(authUsers.id, req.user.id)).limit(1);
    const [p] = await db.select().from(profiles).where(eq(profiles.userId, req.user.id)).limit(1);
    res.json({
      firstName: u?.firstName || req.user.firstName || "",
      lastName: u?.lastName || req.user.lastName || "",
      email: u?.email || req.user.email || "",
      locale: p?.locale || "en",
      theme: p?.theme || "system",
    });
  });

  app.patch("/api/me/profile", isAuthenticated as any, async (req: any, res) => {
    const input = z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      locale: z.string().optional(),
      theme: z.string().optional(),
    }).parse(req.body);

    await db.update(authUsers).set({
      firstName: input.firstName,
      lastName: input.lastName,
      updatedAt: new Date(),
    }).where(eq(authUsers.id, req.user.id));

    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, req.user.id)).limit(1);
    if (existingProfile) {
      await db.update(profiles).set({
        locale: input.locale || existingProfile.locale || "en",
        theme: input.theme || existingProfile.theme || "system",
      }).where(eq(profiles.id, existingProfile.id));
    } else {
      await db.insert(profiles).values({
        userId: req.user.id,
        role: "student",
        locale: input.locale || "en",
        theme: input.theme || "system",
      });
    }
    res.status(200).json({ ok: true });
  });

  app.get("/api/me/payments", isAuthenticated as any, async (req: any, res) => {
    const rows = await db
      .select({
        id: paymentOrders.id,
        courseId: paymentOrders.courseId,
        courseTitle: courses.title,
        amount: paymentOrders.amount,
        currency: paymentOrders.currency,
        provider: paymentOrders.provider,
        status: paymentOrders.status,
        createdAt: paymentOrders.createdAt,
        paidAt: paymentOrders.paidAt,
      })
      .from(paymentOrders)
      .leftJoin(courses, eq(paymentOrders.courseId, courses.id))
      .where(eq(paymentOrders.userId, req.user.id));
    res.json(rows);
  });

  app.post("/api/me/prayers", isAuthenticated as any, async (req: any, res) => {
    const input = z.object({ title: z.string().min(2), content: z.string().min(5) }).parse(req.body);
    const [u] = await db.select().from(authUsers).where(eq(authUsers.id, req.user.id)).limit(1);
    const prayer = await storage.createPrayer({
      name: `${u?.firstName || req.user.firstName || ""} ${u?.lastName || req.user.lastName || ""}`.trim() || req.user.email,
      email: req.user.email || null,
      title: input.title,
      content: input.content,
      status: "open",
      isPublic: false,
    });
    res.status(201).json(prayer);
  });

  app.post("/api/me/testimonies", isAuthenticated as any, async (req: any, res) => {
    const input = z.object({
      title: z.string().min(2),
      story: z.string().min(10),
      category: z.string().optional(),
      location: z.string().optional(),
    }).parse(req.body);
    const [u] = await db.select().from(authUsers).where(eq(authUsers.id, req.user.id)).limit(1);
    const testimony = await storage.createTestimony({
      name: `${u?.firstName || req.user.firstName || ""} ${u?.lastName || req.user.lastName || ""}`.trim() || req.user.email,
      location: input.location || null,
      category: input.category || "General",
      title: input.title,
      story: input.story,
      isApproved: false,
    });
    res.status(201).json(testimony);
  });

  app.get("/api/me/tasks", isAuthenticated as any, async (req: any, res) => {
    const rows = await db
      .select({
        id: tutorTasks.id,
        title: tutorTasks.title,
        description: tutorTasks.description,
        status: tutorTasks.status,
        dueAt: tutorTasks.dueAt,
        createdAt: tutorTasks.createdAt,
        completedAt: tutorTasks.completedAt,
        courseId: tutorTasks.courseId,
        courseTitle: courses.title,
      })
      .from(tutorTasks)
      .leftJoin(courses, eq(tutorTasks.courseId, courses.id))
      .where(eq(tutorTasks.studentUserId, req.user.id));
    res.json(rows);
  });

  app.patch("/api/me/tasks/:id/complete", isAuthenticated as any, async (req: any, res) => {
    const taskId = Number(req.params.id);
    if (!Number.isFinite(taskId)) return res.status(400).json({ message: "Invalid task id" });
    await db
      .update(tutorTasks)
      .set({ status: "completed", completedAt: new Date() })
      .where(and(eq(tutorTasks.id, taskId), eq(tutorTasks.studentUserId, req.user.id)));
    res.sendStatus(204);
  });

  // ── Admin Stats ────────────────────────────────────────────────────────
  app.get(api.admin.stats.path, isAuthenticated as any, async (_, res) => {
    res.json({ totalUsers: 0, totalRevenue: 0, activeEnrollments: 0 });
  });

  app.get("/api/admin/students", isAuthenticated as any, isAdmin, async (_, res) => {
    const rows = await db
      .select({
        userId: enrollments.userId,
        email: authUsers.email,
        firstName: authUsers.firstName,
        lastName: authUsers.lastName,
        courseId: enrollments.courseId,
        courseTitle: courses.title,
        enrolledAt: enrollments.enrolledAt,
      })
      .from(enrollments)
      .leftJoin(authUsers, eq(enrollments.userId, authUsers.id))
      .leftJoin(courses, eq(enrollments.courseId, courses.id));

    const studentsMap = new Map<string, any>();
    for (const r of rows) {
      if (!studentsMap.has(r.userId)) {
        studentsMap.set(r.userId, {
          userId: r.userId,
          email: r.email,
          firstName: r.firstName,
          lastName: r.lastName,
          enrollments: [],
        });
      }
      studentsMap.get(r.userId).enrollments.push({
        courseId: r.courseId,
        courseTitle: r.courseTitle,
        enrolledAt: r.enrolledAt,
      });
    }

    // Also include registered users who are not yet enrolled in any course.
    const allUsers = await db
      .select({
        id: authUsers.id,
        email: authUsers.email,
        firstName: authUsers.firstName,
        lastName: authUsers.lastName,
      })
      .from(authUsers);

    for (const u of allUsers) {
      if (!studentsMap.has(u.id)) {
        studentsMap.set(u.id, {
          userId: u.id,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          enrollments: [],
        });
      }
    }

    // Supabase-auth-only users might not be mirrored yet in public.users.
    if (supabaseAdmin) {
      try {
        const { data } = await supabaseAdmin.auth.admin.listUsers();
        for (const u of data?.users || []) {
          if (!u.id || !u.email) continue;
          if (!studentsMap.has(u.id)) {
            studentsMap.set(u.id, {
              userId: u.id,
              email: u.email,
              firstName: (u.user_metadata as any)?.first_name || "",
              lastName: (u.user_metadata as any)?.last_name || "",
              enrollments: [],
            });
          }
        }
      } catch {
        // Non-fatal: still return DB users if Supabase admin list fails.
      }
    }

    res.json([...studentsMap.values()]);
  });

  app.post("/api/admin/sync-users", isAuthenticated as any, isAdmin, async (_req, res) => {
    if (!supabaseAdmin) {
      return res.status(503).json({ message: "Supabase admin client not configured" });
    }

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      return res.status(500).json({ message: error.message || "Failed to list users from Supabase" });
    }

    let synced = 0;
    for (const u of data?.users || []) {
      if (!u.id || !u.email) continue;
      const meta: any = u.user_metadata || {};
      await authStorage.upsertUser({
        id: u.id,
        email: u.email,
        firstName: meta.first_name || meta.firstName || null,
        lastName: meta.last_name || meta.lastName || null,
        profileImageUrl: meta.avatar_url || null,
      });

      const [existingProfile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, u.id))
        .limit(1);

      if (!existingProfile) {
        await db.insert(profiles).values({
          userId: u.id,
          role: meta.role || "student",
          locale: "en",
          theme: "system",
        });
      }
      synced++;
    }

    res.json({ synced });
  });

  app.get("/api/admin/tasks", isAuthenticated as any, isAdmin, async (_, res) => {
    const rows = await db
      .select({
        id: tutorTasks.id,
        title: tutorTasks.title,
        description: tutorTasks.description,
        status: tutorTasks.status,
        dueAt: tutorTasks.dueAt,
        createdAt: tutorTasks.createdAt,
        completedAt: tutorTasks.completedAt,
        studentUserId: tutorTasks.studentUserId,
        studentEmail: authUsers.email,
        studentFirstName: authUsers.firstName,
        studentLastName: authUsers.lastName,
        courseId: tutorTasks.courseId,
        courseTitle: courses.title,
      })
      .from(tutorTasks)
      .leftJoin(authUsers, eq(tutorTasks.studentUserId, authUsers.id))
      .leftJoin(courses, eq(tutorTasks.courseId, courses.id));
    res.json(rows);
  });

  app.post("/api/admin/tasks", isAuthenticated as any, isAdmin, async (req: any, res) => {
    try {
      const parsed = insertTutorTaskSchema.parse({
        ...req.body,
        createdByUserId: req.user.id,
        dueAt: req.body?.dueAt ? new Date(req.body.dueAt) : null,
      });
      const [task] = await db.insert(tutorTasks).values(parsed).returning();
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // ── Songs (Public GET, Admin POST/DELETE) ──────────────────────────────
  app.get("/api/songs", async (req, res) => {
    const { displayOn } = req.query;
    const list = await storage.getSongs(typeof displayOn === "string" ? displayOn : undefined);
    res.json(list);
  });
  app.get("/api/stewardship-types", async (req, res) => {
    const { group } = req.query;
    const list = await storage.getStewardshipTypes(typeof group === "string" ? group : undefined);
    res.json(list);
  });
  app.post("/api/admin/songs", isAuthenticated as any, isAdmin, async (req, res) => {
    try {
      const data = insertSongSchema.parse(req.body);
      res.status(201).json(await storage.createSong(data));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create song" });
    }
  });
  app.delete("/api/admin/songs/:id", isAuthenticated as any, isAdmin, async (req, res) => {
    await storage.deleteSong(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Quiz Questions (Public GET, Admin POST/DELETE) ─────────────────────
  app.get("/api/quiz-questions", async (_, res) => {
    res.json(await storage.getQuizQuestions());
  });
  app.post("/api/admin/quiz-questions", isAuthenticated as any, isAdmin, async (req, res) => {
    try {
      const data = insertQuizQuestionSchema.parse(req.body);
      res.status(201).json(await storage.createQuizQuestion(data));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create question" });
    }
  });
  app.delete("/api/admin/quiz-questions/:id", isAuthenticated as any, isAdmin, async (req, res) => {
    await storage.deleteQuizQuestion(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Word Search Words (Public GET, Admin POST/DELETE) ──────────────────
  app.get("/api/word-search-words", async (req, res) => {
    const { category } = req.query;
    res.json(await storage.getWordSearchWords(typeof category === "string" ? category : undefined));
  });
  app.post("/api/admin/word-search-words", isAuthenticated as any, isAdmin, async (req, res) => {
    try {
      const data = insertWordSearchWordSchema.parse(req.body);
      res.status(201).json(await storage.createWordSearchWord(data));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to add word" });
    }
  });
  app.delete("/api/admin/word-search-words/:id", isAuthenticated as any, isAdmin, async (req, res) => {
    await storage.deleteWordSearchWord(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Crosswords (Public GET, Admin POST/DELETE) ─────────────────────────
  app.get("/api/crosswords", async (_, res) => {
    res.json(await storage.getCrosswordPuzzles());
  });
  app.get("/api/crosswords/:id", async (req, res) => {
    const puzzle = await storage.getCrosswordPuzzle(Number(req.params.id));
    if (!puzzle) return res.status(404).json({ message: "Not found" });
    res.json(puzzle);
  });
  app.post("/api/admin/crosswords", isAuthenticated as any, isAdmin, async (req, res) => {
    try {
      const data = insertCrosswordPuzzleSchema.parse(req.body);
      res.status(201).json(await storage.createCrosswordPuzzle(data));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create crossword" });
    }
  });
  app.delete("/api/admin/crosswords/:id", isAuthenticated as any, isAdmin, async (req, res) => {
    await storage.deleteCrosswordPuzzle(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Testimonies (Public GET, Admin POST/DELETE) ────────────────────────
  app.get("/api/testimonies", async (_, res) => {
    res.json(await storage.getTestimonies(true));
  });
  app.get("/api/admin/testimonies", isAuthenticated as any, isAdmin, async (_, res) => {
    res.json(await storage.getTestimonies(false));
  });
  app.post("/api/admin/testimonies", isAuthenticated as any, isAdmin, async (req, res) => {
    try {
      const data = insertTestimonySchema.parse({ ...req.body, isApproved: true });
      res.status(201).json(await storage.createTestimony(data));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create testimony" });
    }
  });
  app.patch("/api/admin/testimonies/:id/approve", isAuthenticated as any, isAdmin, async (req, res) => {
    await storage.approveTestimony(Number(req.params.id));
    res.sendStatus(204);
  });
  app.delete("/api/admin/testimonies/:id", isAuthenticated as any, isAdmin, async (req, res) => {
    await storage.deleteTestimony(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Prayers (Public GET for approved, Admin full CRUD-lite) ────────────
  app.get("/api/prayers", async (_, res) => {
    res.json(await storage.getPrayers(true));
  });
  app.get("/api/admin/prayers", isAuthenticated as any, isAdmin, async (_, res) => {
    res.json(await storage.getPrayers(false));
  });
  app.post("/api/admin/prayers", isAuthenticated as any, isAdmin, async (req, res) => {
    try {
      const data = insertPrayerSchema.parse(req.body);
      res.status(201).json(await storage.createPrayer(data));
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create prayer" });
    }
  });
  app.patch("/api/admin/prayers/:id/approve", isAuthenticated as any, isAdmin, async (req, res) => {
    await storage.approvePrayer(Number(req.params.id));
    res.sendStatus(204);
  });
  app.delete("/api/admin/prayers/:id", isAuthenticated as any, isAdmin, async (req, res) => {
    await storage.deletePrayer(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Database & Supabase Auth Seed ─────────────────────────────────────
  async function seedAll() {
    try {
      // ── Supabase Auth: ensure admin user exists ──────────────────────
      if (supabaseAdmin && ADMIN_EMAIL && ADMIN_PASSWORD) {
        try {
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          const adminExists = list?.users?.some((u: any) => u.email === ADMIN_EMAIL);
          if (!adminExists) {
            const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
              email: ADMIN_EMAIL,
              password: ADMIN_PASSWORD,
              email_confirm: true,
              user_metadata: { first_name: "Admin", last_name: "BFC", role: "admin" },
            });
            if (error) {
              console.warn("[seed] Could not create admin in Supabase Auth:", error.message);
            } else {
              console.log("[seed] Admin user created in Supabase Auth.");
              // Mirror into public.users
              await authStorage.upsertUser({
                id: created.user.id,
                email: ADMIN_EMAIL,
                firstName: "Admin",
                lastName: "BFC",
              });
            }
          } else {
            console.log("[seed] Admin user already exists in Supabase Auth.");
          }
        } catch (authErr: any) {
          console.warn("[seed] Supabase Auth seed skipped:", authErr.message);
        }
      } else {
        console.warn("[seed] Missing supabase admin client or ADMIN_EMAIL/ADMIN_PASSWORD — skipping Supabase Auth seed.");
      }

      // ── Course data ──────────────────────────────────────────────────
      const { tracks: tracksTable, courses: coursesTable } = await import("@shared/schema");
      const seedTracks = [
        { slug: "foundations", title: "Foundations of Stewardship", description: "Learn the biblical principles of managing money and resources with wisdom and faith.", order: 1 },
        { slug: "investing", title: "Kingdom Investing", description: "How to invest your resources for eternal impact, growth, and generosity.", order: 2 },
        { slug: "debt-freedom", title: "Debt-Free Living", description: "Biblical strategies for eliminating debt and building a legacy of financial freedom.", order: 3 },
        { slug: "generosity", title: "The Generous Life", description: "Discover the joy and biblical mandate of radical, joyful giving.", order: 4 },
      ];
      for (const t of seedTracks) {
        await db.insert(tracksTable).values(t).onConflictDoUpdate({ target: tracksTable.slug, set: { title: t.title } });
      }
      const tracksList = await storage.getTracks();
      const trackMap = Object.fromEntries(tracksList.map(t => [t.slug, t.id]));
      const seedCourses = [
        { trackSlug: "foundations", slug: "stewardship-101", title: "Stewardship 101", description: "A comprehensive introduction to biblical financial management.", price: 0, level: "beginner", duration: "4 hours" },
        { trackSlug: "foundations", slug: "budgeting-masterclass", title: "Budgeting Masterclass", description: "Take control of your cash flow with practical, Bible-based budgeting tools.", price: 9900, level: "intermediate", duration: "6 hours" },
        { trackSlug: "investing", slug: "kingdom-investing", title: "Kingdom Investing Principles", description: "Learn how to grow your wealth while keeping an eternal perspective.", price: 14900, level: "intermediate", duration: "8 hours" },
        { trackSlug: "investing", slug: "retirement-gods-way", title: "Retirement God's Way", description: "Plan for the future with faith and wisdom.", price: 12900, level: "advanced", duration: "5 hours" },
        { trackSlug: "debt-freedom", slug: "debt-freedom-plan", title: "The Debt Freedom Plan", description: "A proven, Scripture-backed system for eliminating all consumer debt.", price: 7900, level: "beginner", duration: "6 hours" },
        { trackSlug: "generosity", slug: "radical-generosity", title: "Radical Generosity", description: "Experience the transforming power of giving.", price: 0, level: "beginner", duration: "3 hours" },
      ];
      for (const c of seedCourses) {
        const trackId = trackMap[c.trackSlug];
        if (!trackId) continue;
        const { trackSlug, ...rest } = c;
        await db.insert(coursesTable).values({ ...rest, trackId, isPublished: true }).onConflictDoUpdate({ target: coursesTable.slug, set: { title: rest.title } });
      }

      // ── Game content ──────────────────────────────────────────────────
      const { quizQuestions: quizTable, wordSearchWords: wsTable, crosswordPuzzles: cwTable } = await import("@shared/schema");
      const existingSongs = await storage.getSongs();
      if (existingSongs.length === 0) {
        await db.insert(songs).values([
          { title: "How Great Thou Art", artist: "Traditional", category: "Hymn", songKey: "G", tempo: "72 BPM", displayOn: "both" },
          { title: "Great Is Thy Faithfulness", artist: "Traditional", category: "Hymn", songKey: "C", tempo: "68 BPM", displayOn: "worship" },
          { title: "Way Maker", artist: "Sinach", category: "Worship", songKey: "E", tempo: "76 BPM", displayOn: "both" },
          { title: "Goodness of God", artist: "Bethel Music", category: "Contemporary", songKey: "G", tempo: "63 BPM", displayOn: "sing-along" },
        ]);
      }

      const stewardshipTypeSeeds = [
        { name: "Debt Freedom", slug: "debt-freedom", group: "testimony", order: 1, isActive: true },
        { name: "Business Breakthrough", slug: "business-breakthrough", group: "testimony", order: 2, isActive: true },
        { name: "Family Restoration", slug: "family-restoration", group: "testimony", order: 3, isActive: true },
        { name: "Job Miracle", slug: "job-miracle", group: "testimony", order: 4, isActive: true },
        { name: "Home Purchased", slug: "home-purchased", group: "testimony", order: 5, isActive: true },
        { name: "Investment Win", slug: "investment-win", group: "testimony", order: 6, isActive: true },
        { name: "General", slug: "general", group: "testimony", order: 7, isActive: true },
      ] as const;
      for (const st of stewardshipTypeSeeds) {
        await db.insert(stewardshipTypes).values(st).onConflictDoUpdate({
          target: stewardshipTypes.slug,
          set: { name: st.name, group: st.group, order: st.order, isActive: st.isActive },
        });
      }

      const existingQuiz = await db.select().from(quizTable).limit(1);
      if (existingQuiz.length === 0) {
        await db.insert(quizTable).values([
          { scripture: "Matthew 6:24", question: "According to Jesus, what cannot a person serve two masters of at the same time?", optionA: "God and man", optionB: "God and Money", optionC: "Truth and lies", optionD: "Faith and fear", correctOption: 1 },
          { scripture: "Proverbs 22:7", question: "What does Proverbs 22:7 say about the borrower?", optionA: "The borrower is wise", optionB: "The borrower is free", optionC: "The borrower is slave to the lender", optionD: "The borrower is blessed", correctOption: 2 },
          { scripture: "Malachi 3:10", question: "What does God challenge us to do in Malachi 3:10 to test His faithfulness?", optionA: "Pray without ceasing", optionB: "Bring the full tithe into the storehouse", optionC: "Give to the poor generously", optionD: "Fast and seek His face", correctOption: 1 },
          { scripture: "Luke 16:11", question: "If you have not been trustworthy with worldly wealth, what will God not give you?", optionA: "Earthly riches", optionB: "Wisdom", optionC: "True riches", optionD: "Eternal life", correctOption: 2 },
          { scripture: "Philippians 4:19", question: "Paul promises that God will supply every need according to what?", optionA: "Your faith and prayers", optionB: "His glorious riches in Christ Jesus", optionC: "The measure of your giving", optionD: "The size of your church", correctOption: 1 },
          { scripture: "Deuteronomy 8:18", question: "Who gives us the power to produce wealth?", optionA: "Our own intelligence", optionB: "Our labour and effort", optionC: "God", optionD: "Our community", correctOption: 2 },
          { scripture: "Proverbs 13:11", question: "According to Proverbs 13:11, how does wealth gathered in a hurry disappear?", optionA: "Slowly over time", optionB: "All at once in disaster", optionC: "It vanishes like smoke", optionD: "It quickly diminishes", correctOption: 3 },
          { scripture: "1 Timothy 6:10", question: "What is described as 'a root of all kinds of evil'?", optionA: "Pride", optionB: "Greed", optionC: "The love of money", optionD: "Debt", correctOption: 2 },
        ]);
      }

      const existingWS = await db.select().from(wsTable).limit(1);
      if (existingWS.length === 0) {
        await db.insert(wsTable).values([
          { word: "BETHLEHEM", category: "places" }, { word: "JERUSALEM", category: "places" }, { word: "NAZARETH", category: "places" },
          { word: "JERICHO", category: "places" }, { word: "GALILEE", category: "places" }, { word: "BETHANY", category: "places" },
          { word: "CAPERNAUM", category: "places" }, { word: "JORDAN", category: "places" }, { word: "SINAI", category: "places" },
          { word: "EDEN", category: "places" },
          { word: "MATTHEW", category: "books" }, { word: "MARK", category: "books" }, { word: "LUKE", category: "books" },
          { word: "JOHN", category: "books" }, { word: "ACTS", category: "books" }, { word: "ROMANS", category: "books" },
          { word: "GALATIANS", category: "books" }, { word: "EPHESIANS", category: "books" }, { word: "HEBREWS", category: "books" },
          { word: "REVELATION", category: "books" },
        ]);
      }

      const existingCW = await db.select().from(cwTable).limit(1);
      if (existingCW.length === 0) {
        const cwData = {
          gridW: 11, gridH: 11,
          words: [
            { word: "STEWARD", clue: "One who manages another's resources faithfully", row: 0, col: 0, dir: "across", num: 1 },
            { word: "TITHE", clue: "Giving ten percent of income to God", row: 0, col: 0, dir: "down", num: 1 },
            { word: "FAITH", clue: "Trust and confidence placed in God", row: 2, col: 2, dir: "across", num: 3 },
            { word: "GRACE", clue: "God's unmerited favour toward us", row: 0, col: 6, dir: "down", num: 2 },
            { word: "WISDOM", clue: "Godly insight for making sound decisions", row: 4, col: 0, dir: "across", num: 4 },
            { word: "DEBT", clue: "What the borrower owes the lender", row: 1, col: 4, dir: "down", num: 5 },
            { word: "SOWING", clue: "The act of giving that leads to reaping", row: 6, col: 2, dir: "across", num: 6 },
            { word: "TRUST", clue: "Relying on God for all provision", row: 2, col: 8, dir: "down", num: 7 },
            { word: "BLESSING", clue: "God's favour and abundance poured out", row: 8, col: 0, dir: "across", num: 8 },
            { word: "MONEY", clue: "A tool, not a master — to be stewarded", row: 4, col: 8, dir: "down", num: 9 },
          ],
        };
        await db.insert(cwTable).values({ title: "Biblical Finance Basics", data: JSON.stringify(cwData) });
      }

      console.log("[seed] Database ready.");
    } catch (err) {
      console.error("[seed] Error:", err);
    }
  }

  if (SEED_ON_BOOT) {
    seedAll().catch(console.error);
  }
  return httpServer;
}
