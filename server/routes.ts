import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerAuthRoutes, setupAuth, authStorage } from "./replit_integrations/auth";
import { isAuthenticated } from "./replit_integrations/auth/replitAuth";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/models/auth";

import {
  insertActivitySubmissionSchema,
  insertSongSchema,
  insertQuizQuestionSchema,
  insertWordSearchWordSchema,
  insertCrosswordPuzzleSchema,
  insertTestimonySchema,
} from "@shared/schema";

const ADMIN_EMAIL = "admin@biblicalfinancialcourses.com";

const isAdmin: RequestHandler = (req: any, res, next) => {
  if (req.isAuthenticated() && req.user?.email === ADMIN_EMAIL) return next();
  res.status(403).json({ message: "Forbidden — admin only" });
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  // ── Activity Submissions ────────────────────────────────────────────────
  app.get("/api/activity-submissions/:type", async (req, res) => {
    const submissions = await storage.getActivitySubmissions(req.params.type);
    res.json(submissions);
  });

  app.post("/api/activity-submissions", isAuthenticated, async (req: any, res) => {
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

  // ── Enrollments ────────────────────────────────────────────────────────
  app.get(api.enrollments.list.path, isAuthenticated, async (req: any, res) => {
    res.json(await storage.getEnrollments(req.user.id));
  });
  app.post(api.enrollments.create.path, isAuthenticated, async (req: any, res) => {
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
  app.get(api.progress.list.path, isAuthenticated, async (req: any, res) => {
    res.json(await storage.getProgress(req.user.id));
  });
  app.post(api.progress.markComplete.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.progress.markComplete.input.parse(req.body);
      const record = await storage.markLessonComplete(req.user.id, input.lessonId);
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });

  // ── Admin Stats ────────────────────────────────────────────────────────
  app.get(api.admin.stats.path, isAuthenticated, async (_, res) => {
    res.json({ totalUsers: 0, totalRevenue: 0, activeEnrollments: 0 });
  });

  // ── Songs (Public GET, Admin POST/DELETE) ──────────────────────────────
  app.get("/api/songs", async (req, res) => {
    const { displayOn } = req.query;
    const list = await storage.getSongs(typeof displayOn === "string" ? displayOn : undefined);
    res.json(list);
  });
  app.post("/api/admin/songs", isAdmin, async (req, res) => {
    try {
      const data = insertSongSchema.parse(req.body);
      const song = await storage.createSong(data);
      res.status(201).json(song);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create song" });
    }
  });
  app.delete("/api/admin/songs/:id", isAdmin, async (req, res) => {
    await storage.deleteSong(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Quiz Questions (Public GET, Admin POST/DELETE) ─────────────────────
  app.get("/api/quiz-questions", async (_, res) => {
    res.json(await storage.getQuizQuestions());
  });
  app.post("/api/admin/quiz-questions", isAdmin, async (req, res) => {
    try {
      const data = insertQuizQuestionSchema.parse(req.body);
      const q = await storage.createQuizQuestion(data);
      res.status(201).json(q);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create question" });
    }
  });
  app.delete("/api/admin/quiz-questions/:id", isAdmin, async (req, res) => {
    await storage.deleteQuizQuestion(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Word Search Words (Public GET, Admin POST/DELETE) ──────────────────
  app.get("/api/word-search-words", async (req, res) => {
    const { category } = req.query;
    res.json(await storage.getWordSearchWords(typeof category === "string" ? category : undefined));
  });
  app.post("/api/admin/word-search-words", isAdmin, async (req, res) => {
    try {
      const data = insertWordSearchWordSchema.parse(req.body);
      const w = await storage.createWordSearchWord(data);
      res.status(201).json(w);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to add word" });
    }
  });
  app.delete("/api/admin/word-search-words/:id", isAdmin, async (req, res) => {
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
  app.post("/api/admin/crosswords", isAdmin, async (req, res) => {
    try {
      const data = insertCrosswordPuzzleSchema.parse(req.body);
      const p = await storage.createCrosswordPuzzle(data);
      res.status(201).json(p);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create crossword" });
    }
  });
  app.delete("/api/admin/crosswords/:id", isAdmin, async (req, res) => {
    await storage.deleteCrosswordPuzzle(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Testimonies (Public GET, Admin POST/DELETE) ────────────────────────
  app.get("/api/testimonies", async (_, res) => {
    res.json(await storage.getTestimonies());
  });
  app.post("/api/admin/testimonies", isAdmin, async (req, res) => {
    try {
      const data = insertTestimonySchema.parse(req.body);
      const t = await storage.createTestimony(data);
      res.status(201).json(t);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create testimony" });
    }
  });
  app.delete("/api/admin/testimonies/:id", isAdmin, async (req, res) => {
    await storage.deleteTestimony(Number(req.params.id));
    res.sendStatus(204);
  });

  // ── Seeds ──────────────────────────────────────────────────────────────
  async function seedAll() {
    try {
      // Admin user
      const existing = await authStorage.getUserByEmail(ADMIN_EMAIL);
      if (!existing) {
        const hash = await bcrypt.hash("Mango2026!?", 12);
        await db.insert(users).values({ email: ADMIN_EMAIL, password: hash, firstName: "Admin", lastName: "BFC" });
        console.log("[seed] Admin user created.");
      }

      // Courses
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
      // Quiz Questions
      const { quizQuestions: quizTable, wordSearchWords: wsTable, crosswordPuzzles: cwTable } = await import("@shared/schema");
      const existingQuiz = await db.select().from(quizTable).limit(1);
      if (existingQuiz.length === 0) {
        const seedQuiz = [
          { scripture: "Matthew 6:24", question: "According to Jesus, what cannot a person serve two masters of at the same time?", optionA: "God and man", optionB: "God and Money", optionC: "Truth and lies", optionD: "Faith and fear", correctOption: 1 },
          { scripture: "Proverbs 22:7", question: "What does Proverbs 22:7 say about the borrower?", optionA: "The borrower is wise", optionB: "The borrower is free", optionC: "The borrower is slave to the lender", optionD: "The borrower is blessed", correctOption: 2 },
          { scripture: "Malachi 3:10", question: "What does God challenge us to do in Malachi 3:10 to test His faithfulness?", optionA: "Pray without ceasing", optionB: "Bring the full tithe into the storehouse", optionC: "Give to the poor generously", optionD: "Fast and seek His face", correctOption: 1 },
          { scripture: "Luke 16:11", question: "If you have not been trustworthy with worldly wealth, what will God not give you?", optionA: "Earthly riches", optionB: "Wisdom", optionC: "True riches", optionD: "Eternal life", correctOption: 2 },
          { scripture: "Philippians 4:19", question: "Paul promises that God will supply every need according to what?", optionA: "Your faith and prayers", optionB: "His glorious riches in Christ Jesus", optionC: "The measure of your giving", optionD: "The size of your church", correctOption: 1 },
          { scripture: "Deuteronomy 8:18", question: "Who gives us the power to produce wealth?", optionA: "Our own intelligence", optionB: "Our labour and effort", optionC: "God", optionD: "Our community", correctOption: 2 },
          { scripture: "Proverbs 13:11", question: "According to Proverbs 13:11, how does wealth gathered in a hurry disappear?", optionA: "Slowly over time", optionB: "All at once in disaster", optionC: "It vanishes like smoke", optionD: "It quickly diminishes", correctOption: 3 },
          { scripture: "1 Timothy 6:10", question: "What is described as 'a root of all kinds of evil'?", optionA: "Pride", optionB: "Greed", optionC: "The love of money", optionD: "Debt", correctOption: 2 },
        ];
        await db.insert(quizTable).values(seedQuiz);
      }

      // Word Search Words
      const existingWS = await db.select().from(wsTable).limit(1);
      if (existingWS.length === 0) {
        const seedWS = [
          { word: "BETHLEHEM", category: "places" }, { word: "JERUSALEM", category: "places" }, { word: "NAZARETH", category: "places" },
          { word: "JERICHO", category: "places" }, { word: "GALILEE", category: "places" }, { word: "BETHANY", category: "places" },
          { word: "CAPERNAUM", category: "places" }, { word: "JORDAN", category: "places" }, { word: "SINAI", category: "places" },
          { word: "EDEN", category: "places" },
          { word: "MATTHEW", category: "books" }, { word: "MARK", category: "books" }, { word: "LUKE", category: "books" },
          { word: "JOHN", category: "books" }, { word: "ACTS", category: "books" }, { word: "ROMANS", category: "books" },
          { word: "GALATIANS", category: "books" }, { word: "EPHESIANS", category: "books" }, { word: "HEBREWS", category: "books" },
          { word: "REVELATION", category: "books" },
        ];
        await db.insert(wsTable).values(seedWS);
      }

      // Crossword Puzzle
      const existingCW = await db.select().from(cwTable).limit(1);
      if (existingCW.length === 0) {
        // Pre-built layout for the starter crossword
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

  seedAll().catch(console.error);
  return httpServer;
}
