import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users, sessions } from "./models/auth";
export { users, sessions };

export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").default("student"),
  locale: text("locale").default("en"),
  theme: text("theme").default("system"),
});

export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").references(() => tracks.id),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull().default(0),
  level: text("level").default("beginner"),
  duration: text("duration"),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").default(false),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  title: text("title").notNull(),
  videoUrl: text("video_url"),
  content: text("content"),
  duration: integer("duration").default(0),
  order: integer("order").notNull().default(0),
  isFreePreview: boolean("is_free_preview").default(false),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  status: text("status").default("active"),
});

export const paymentOrders = pgTable("payment_orders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  amount: integer("amount").notNull(), // minor units (e.g. cents)
  currency: text("currency").notNull().default("USD"),
  provider: text("provider").notNull().default("manual"), // stripe | flutterwave | manual
  providerOrderId: text("provider_order_id"),
  status: text("status").notNull().default("pending"), // pending | paid | failed | refunded
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => paymentOrders.id),
  providerTxnId: text("provider_txn_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("pending"), // pending | succeeded | failed | refunded
  rawPayload: text("raw_payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const activitySubmissions = pgTable("activity_submissions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  activityType: text("activity_type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// ── CMS Content Tables ────────────────────────────────────────────────────

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  artist: text("artist"),
  category: text("category").notNull().default("Worship"),
  songKey: text("song_key"),
  tempo: text("tempo"),
  lyrics: text("lyrics"),
  chords: text("chords"),
  displayOn: text("display_on").notNull().default("sing-along"), // sing-along | worship | both
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  scripture: text("scripture").notNull(),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctOption: integer("correct_option").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wordSearchWords = pgTable("word_search_words", {
  id: serial("id").primaryKey(),
  word: text("word").notNull(),
  category: text("category").notNull().default("places"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const crosswordPuzzles = pgTable("crossword_puzzles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const testimonies = pgTable("testimonies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  category: text("category").notNull().default("General"),
  title: text("title").notNull(),
  story: text("story").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prayers = pgTable("prayers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("open"), // open | answered | archived
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Zod Schemas ───────────────────────────────────────────────────────────

export const insertActivitySubmissionSchema = createInsertSchema(activitySubmissions).omit({ id: true, submittedAt: true });
export const insertSongSchema = createInsertSchema(songs).omit({ id: true, createdAt: true });
export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({ id: true, createdAt: true });
export const insertWordSearchWordSchema = createInsertSchema(wordSearchWords).omit({ id: true, createdAt: true });
export const insertCrosswordPuzzleSchema = createInsertSchema(crosswordPuzzles).omit({ id: true, createdAt: true });
export const insertTestimonySchema = createInsertSchema(testimonies).omit({ id: true, createdAt: true });
export const insertPrayerSchema = createInsertSchema(prayers).omit({ id: true, createdAt: true });

// ── Types ─────────────────────────────────────────────────────────────────

export type ActivitySubmission = typeof activitySubmissions.$inferSelect;
export type InsertActivitySubmission = z.infer<typeof insertActivitySubmissionSchema>;
export type Song = typeof songs.$inferSelect;
export type InsertSong = z.infer<typeof insertSongSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type WordSearchWord = typeof wordSearchWords.$inferSelect;
export type InsertWordSearchWord = z.infer<typeof insertWordSearchWordSchema>;
export type CrosswordPuzzle = typeof crosswordPuzzles.$inferSelect;
export type InsertCrosswordPuzzle = z.infer<typeof insertCrosswordPuzzleSchema>;
export type Testimony = typeof testimonies.$inferSelect;
export type InsertTestimony = z.infer<typeof insertTestimonySchema>;
export type Prayer = typeof prayers.$inferSelect;
export type InsertPrayer = z.infer<typeof insertPrayerSchema>;
export type PaymentOrder = typeof paymentOrders.$inferSelect;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;

export const coursesRelations = relations(courses, ({ one, many }) => ({
  track: one(tracks, { fields: [courses.trackId], references: [tracks.id] }),
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, { fields: [modules.courseId], references: [courses.id] }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  module: one(modules, { fields: [lessons.moduleId], references: [modules.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
}));

export const insertTrackSchema = createInsertSchema(tracks).omit({ id: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertModuleSchema = createInsertSchema(modules).omit({ id: true });
export const insertLessonSchema = createInsertSchema(lessons).omit({ id: true });

export type Track = typeof tracks.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type Profile = typeof profiles.$inferSelect;

export type LessonWithModule = Lesson & { module: Module };
export type ModuleWithLessons = Module & { lessons: Lesson[] };
export type CourseWithRelations = Course & { modules: ModuleWithLessons[] };
export type EnrollmentWithCourse = Enrollment & { course: Course };
