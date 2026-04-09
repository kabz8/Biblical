import { db } from "./db";
import {
  tracks, courses, modules, lessons, enrollments, progress, profiles, activitySubmissions,
  songs, quizQuestions, wordSearchWords, crosswordPuzzles, testimonies, prayers,
  type Track, type Course, type Module, type Lesson, type Enrollment, type Progress, type Profile,
  type ActivitySubmission, type InsertActivitySubmission,
  type Song, type InsertSong,
  type QuizQuestion, type InsertQuizQuestion,
  type WordSearchWord, type InsertWordSearchWord,
  type CrosswordPuzzle, type InsertCrosswordPuzzle,
  type Testimony, type InsertTestimony,
  type Prayer, type InsertPrayer,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

type InsertTrack = typeof tracks.$inferInsert;
type InsertCourse = typeof courses.$inferInsert;

export interface IStorage {
  getProfile(userId: string): Promise<Profile | undefined>;
  getTracks(): Promise<Track[]>;
  createTrack(track: InsertTrack): Promise<Track>;
  getCourses(): Promise<Course[]>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  getEnrollments(userId: string): Promise<Enrollment[]>;
  createEnrollment(userId: string, courseId: number): Promise<Enrollment>;
  getProgress(userId: string): Promise<Progress[]>;
  markLessonComplete(userId: string, lessonId: number): Promise<Progress>;
  createActivitySubmission(submission: InsertActivitySubmission): Promise<ActivitySubmission>;
  getActivitySubmissions(type: string): Promise<ActivitySubmission[]>;

  // Songs
  getSongs(displayOn?: string): Promise<Song[]>;
  createSong(song: InsertSong): Promise<Song>;
  deleteSong(id: number): Promise<void>;

  // Quiz Questions
  getQuizQuestions(): Promise<QuizQuestion[]>;
  createQuizQuestion(q: InsertQuizQuestion): Promise<QuizQuestion>;
  deleteQuizQuestion(id: number): Promise<void>;

  // Word Search
  getWordSearchWords(category?: string): Promise<WordSearchWord[]>;
  createWordSearchWord(w: InsertWordSearchWord): Promise<WordSearchWord>;
  deleteWordSearchWord(id: number): Promise<void>;

  // Crosswords
  getCrosswordPuzzles(): Promise<CrosswordPuzzle[]>;
  getCrosswordPuzzle(id: number): Promise<CrosswordPuzzle | undefined>;
  createCrosswordPuzzle(p: InsertCrosswordPuzzle): Promise<CrosswordPuzzle>;
  deleteCrosswordPuzzle(id: number): Promise<void>;

  // Testimonies
  getTestimonies(approvedOnly?: boolean): Promise<Testimony[]>;
  createTestimony(t: InsertTestimony): Promise<Testimony>;
  approveTestimony(id: number): Promise<void>;
  deleteTestimony(id: number): Promise<void>;

  // Prayers
  getPrayers(isPublicOnly?: boolean): Promise<Prayer[]>;
  createPrayer(p: InsertPrayer): Promise<Prayer>;
  approvePrayer(id: number): Promise<void>;
  deletePrayer(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(userId: string) {
    const [p] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return p;
  }

  async getTracks() { return db.select().from(tracks).orderBy(tracks.order); }
  async createTrack(track: InsertTrack) { const [t] = await db.insert(tracks).values(track).returning(); return t; }
  async getCourses() { return db.select().from(courses); }
  async getCourseBySlug(slug: string) { const [c] = await db.select().from(courses).where(eq(courses.slug, slug)); return c; }
  async createCourse(course: InsertCourse) { const [c] = await db.insert(courses).values(course).returning(); return c; }
  async getEnrollments(userId: string) { return db.select().from(enrollments).where(eq(enrollments.userId, userId)); }
  async createEnrollment(userId: string, courseId: number) { const [e] = await db.insert(enrollments).values({ userId, courseId }).returning(); return e; }
  async getProgress(userId: string) { return db.select().from(progress).where(eq(progress.userId, userId)); }
  async markLessonComplete(userId: string, lessonId: number) { const [p] = await db.insert(progress).values({ userId, lessonId }).returning(); return p; }
  async createActivitySubmission(submission: InsertActivitySubmission) { const [s] = await db.insert(activitySubmissions).values(submission).returning(); return s; }
  async getActivitySubmissions(type: string) { return db.select().from(activitySubmissions).where(eq(activitySubmissions.activityType, type)).orderBy(activitySubmissions.submittedAt); }

  // Songs
  async getSongs(displayOn?: string) {
    if (displayOn) {
      return db.select().from(songs).where(eq(songs.displayOn, displayOn));
    }
    return db.select().from(songs).orderBy(songs.createdAt);
  }
  async createSong(song: InsertSong) { const [s] = await db.insert(songs).values(song).returning(); return s; }
  async deleteSong(id: number) { await db.delete(songs).where(eq(songs.id, id)); }

  // Quiz Questions
  async getQuizQuestions() { return db.select().from(quizQuestions).orderBy(quizQuestions.createdAt); }
  async createQuizQuestion(q: InsertQuizQuestion) { const [r] = await db.insert(quizQuestions).values(q).returning(); return r; }
  async deleteQuizQuestion(id: number) { await db.delete(quizQuestions).where(eq(quizQuestions.id, id)); }

  // Word Search
  async getWordSearchWords(category?: string) {
    if (category) return db.select().from(wordSearchWords).where(eq(wordSearchWords.category, category));
    return db.select().from(wordSearchWords).orderBy(wordSearchWords.category);
  }
  async createWordSearchWord(w: InsertWordSearchWord) { const [r] = await db.insert(wordSearchWords).values(w).returning(); return r; }
  async deleteWordSearchWord(id: number) { await db.delete(wordSearchWords).where(eq(wordSearchWords.id, id)); }

  // Crosswords
  async getCrosswordPuzzles() { return db.select().from(crosswordPuzzles).orderBy(crosswordPuzzles.createdAt); }
  async getCrosswordPuzzle(id: number) { const [p] = await db.select().from(crosswordPuzzles).where(eq(crosswordPuzzles.id, id)); return p; }
  async createCrosswordPuzzle(p: InsertCrosswordPuzzle) { const [r] = await db.insert(crosswordPuzzles).values(p).returning(); return r; }
  async deleteCrosswordPuzzle(id: number) { await db.delete(crosswordPuzzles).where(eq(crosswordPuzzles.id, id)); }

  // Testimonies
  async getTestimonies(approvedOnly?: boolean) {
    if (approvedOnly) return db.select().from(testimonies).where(eq(testimonies.isApproved, true)).orderBy(testimonies.createdAt);
    return db.select().from(testimonies).orderBy(testimonies.createdAt);
  }
  async createTestimony(t: InsertTestimony) { const [r] = await db.insert(testimonies).values(t).returning(); return r; }
  async approveTestimony(id: number) { await db.update(testimonies).set({ isApproved: true }).where(eq(testimonies.id, id)); }
  async deleteTestimony(id: number) { await db.delete(testimonies).where(eq(testimonies.id, id)); }

  // Prayers
  async getPrayers(isPublicOnly?: boolean) {
    if (isPublicOnly) return db.select().from(prayers).where(eq(prayers.isPublic, true)).orderBy(prayers.createdAt);
    return db.select().from(prayers).orderBy(prayers.createdAt);
  }
  async createPrayer(p: InsertPrayer) { const [r] = await db.insert(prayers).values(p).returning(); return r; }
  async approvePrayer(id: number) { await db.update(prayers).set({ isPublic: true }).where(eq(prayers.id, id)); }
  async deletePrayer(id: number) { await db.delete(prayers).where(eq(prayers.id, id)); }
}

export const storage = new DatabaseStorage();
