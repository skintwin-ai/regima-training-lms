import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { 
  type User, type InsertUser,
  type Module, type InsertModule,
  type Lesson, type InsertLesson,
  type Step, type InsertStep,
  type Resource, type InsertResource,
  type Product, type InsertProduct,
  type Quiz, type InsertQuiz,
  type UserProgress, type InsertUserProgress,
  type UserNote, type InsertUserNote,
  type LessonFeedback, type InsertLessonFeedback,
  type Certificate, type InsertCertificate,
} from "@shared/schema";
import { hashPassword, isHashedPassword } from "./auth/password";
import type { CertificationIngest } from "./platform/certifications";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Modules
  getAllModules(): Promise<Module[]>;
  getModule(id: number): Promise<Module | undefined>;
  createModule(module: InsertModule): Promise<Module>;
  
  // Lessons
  getLessonsByModuleId(moduleId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  
  // Steps
  getStepsByLessonId(lessonId: number): Promise<Step[]>;
  createStep(step: InsertStep): Promise<Step>;
  
  // Resources
  getResourcesByLessonId(lessonId: number): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Products
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Quizzes
  getQuizByLessonId(lessonId: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  
  // User Progress
  getUserProgressByUserId(userId: number): Promise<UserProgress[]>;
  updateUserProgress(userProgress: InsertUserProgress): Promise<UserProgress>;
  
  // User Notes
  getUserNotesByLessonAndUserId(lessonId: number, userId: number): Promise<UserNote | undefined>;
  createOrUpdateUserNote(note: InsertUserNote): Promise<UserNote>;
  
  // Lesson Feedback
  createLessonFeedback(feedback: InsertLessonFeedback): Promise<LessonFeedback>;
  
  // Certificates
  getUserCertificates(userId: number): Promise<Certificate[]>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  
  // Helper methods
  getUserProgressSummary(userId: number): Promise<{
    completedModules: number;
    totalModules: number;
    percentComplete: number;
  }>;
}

export type LocalCertification = CertificationIngest & {
  recordedAt: string;
};

type Snapshot = {
  version: 1;
  users: User[];
  modules: Module[];
  lessons: Lesson[];
  steps: Step[];
  resources: Resource[];
  products: Product[];
  quizzes: Quiz[];
  userProgress: UserProgress[];
  userNotes: UserNote[];
  lessonFeedback: LessonFeedback[];
  certificates: Certificate[];
  certifications: LocalCertification[];
  counters: {
    currentUserId: number;
    currentModuleId: number;
    currentLessonId: number;
    currentStepId: number;
    currentResourceId: number;
    currentProductId: number;
    currentQuizId: number;
    currentUserProgressId: number;
    currentUserNoteId: number;
    currentLessonFeedbackId: number;
    currentCertificateId: number;
  };
};

export type MemStorageOptions = {
  persistPath?: string | null;
  seedDemoUser?: boolean;
};

export const DEFAULT_STORE_PATH = path.resolve(process.cwd(), "data/lms-store.json");

function reviveDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private modules: Map<number, Module>;
  private lessons: Map<number, Lesson>;
  private steps: Map<number, Step>;
  private resources: Map<number, Resource>;
  private products: Map<number, Product>;
  private quizzes: Map<number, Quiz>;
  private userProgress: Map<number, UserProgress>;
  private userNotes: Map<number, UserNote>;
  private lessonFeedback: Map<number, LessonFeedback>;
  private certificates: Map<number, Certificate>;
  private certifications: LocalCertification[];
  
  private currentUserId: number;
  private currentModuleId: number;
  private currentLessonId: number;
  private currentStepId: number;
  private currentResourceId: number;
  private currentProductId: number;
  private currentQuizId: number;
  private currentUserProgressId: number;
  private currentUserNoteId: number;
  private currentLessonFeedbackId: number;
  private currentCertificateId: number;

  readonly persistPath: string | null;

  constructor(options: MemStorageOptions = {}) {
    this.persistPath =
      options.persistPath === null
        ? null
        : options.persistPath ?? DEFAULT_STORE_PATH;

    this.users = new Map();
    this.modules = new Map();
    this.lessons = new Map();
    this.steps = new Map();
    this.resources = new Map();
    this.products = new Map();
    this.quizzes = new Map();
    this.userProgress = new Map();
    this.userNotes = new Map();
    this.lessonFeedback = new Map();
    this.certificates = new Map();
    this.certifications = [];
    
    this.currentUserId = 1;
    this.currentModuleId = 1;
    this.currentLessonId = 1;
    this.currentStepId = 1;
    this.currentResourceId = 1;
    this.currentProductId = 1;
    this.currentQuizId = 1;
    this.currentUserProgressId = 1;
    this.currentUserNoteId = 1;
    this.currentLessonFeedbackId = 1;
    this.currentCertificateId = 1;
    
    const loaded = this.loadFromDisk();
    if (!loaded && options.seedDemoUser !== false) {
      this.seedDemoUser();
    }
  }

  private seedDemoUser() {
    const id = this.currentUserId++;
    const user: User = {
      id,
      username: "demo",
      password: hashPassword("password"),
      name: "Dr. Jane Doe",
      role: "Skincare Specialist",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    this.persistToDisk();
  }

  isEmpty(): boolean {
    return this.modules.size === 0;
  }

  getCertifications(): LocalCertification[] {
    return [...this.certifications];
  }

  recordCertification(event: CertificationIngest): LocalCertification {
    const recorded: LocalCertification = {
      ...event,
      recordedAt: new Date().toISOString(),
    };
    this.certifications.push(recorded);
    this.persistToDisk();
    return recorded;
  }

  private persistToDisk() {
    if (!this.persistPath) return;
    try {
      mkdirSync(path.dirname(this.persistPath), { recursive: true });
      const snapshot: Snapshot = {
        version: 1,
        users: [...this.users.values()],
        modules: [...this.modules.values()],
        lessons: [...this.lessons.values()],
        steps: [...this.steps.values()],
        resources: [...this.resources.values()],
        products: [...this.products.values()],
        quizzes: [...this.quizzes.values()],
        userProgress: [...this.userProgress.values()],
        userNotes: [...this.userNotes.values()],
        lessonFeedback: [...this.lessonFeedback.values()],
        certificates: [...this.certificates.values()],
        certifications: this.certifications,
        counters: {
          currentUserId: this.currentUserId,
          currentModuleId: this.currentModuleId,
          currentLessonId: this.currentLessonId,
          currentStepId: this.currentStepId,
          currentResourceId: this.currentResourceId,
          currentProductId: this.currentProductId,
          currentQuizId: this.currentQuizId,
          currentUserProgressId: this.currentUserProgressId,
          currentUserNoteId: this.currentUserNoteId,
          currentLessonFeedbackId: this.currentLessonFeedbackId,
          currentCertificateId: this.currentCertificateId,
        },
      };
      writeFileSync(this.persistPath, JSON.stringify(snapshot, null, 2));
    } catch (error) {
      console.warn("[lms-store] failed to persist snapshot:", error);
    }
  }

  private loadFromDisk(): boolean {
    if (!this.persistPath || !existsSync(this.persistPath)) {
      return false;
    }
    try {
      const raw = readFileSync(this.persistPath, "utf8");
      if (!raw.trim()) return false;
      const snapshot = JSON.parse(raw) as Snapshot;
      if (!snapshot || !Array.isArray(snapshot.modules)) {
        return false;
      }

      this.users = new Map(
        (snapshot.users ?? []).map((u) => [u.id, { ...u, createdAt: reviveDate(u.createdAt) }])
      );
      this.modules = new Map((snapshot.modules ?? []).map((m) => [m.id, m]));
      this.lessons = new Map((snapshot.lessons ?? []).map((l) => [l.id, l]));
      this.steps = new Map((snapshot.steps ?? []).map((s) => [s.id, s]));
      this.resources = new Map((snapshot.resources ?? []).map((r) => [r.id, r]));
      this.products = new Map((snapshot.products ?? []).map((p) => [p.id, p]));
      this.quizzes = new Map((snapshot.quizzes ?? []).map((q) => [q.id, q]));
      this.userProgress = new Map(
        (snapshot.userProgress ?? []).map((p) => [
          p.id,
          { ...p, lastAccessed: reviveDate(p.lastAccessed) },
        ])
      );
      this.userNotes = new Map(
        (snapshot.userNotes ?? []).map((n) => [
          n.id,
          { ...n, updatedAt: reviveDate(n.updatedAt) },
        ])
      );
      this.lessonFeedback = new Map(
        (snapshot.lessonFeedback ?? []).map((f) => [
          f.id,
          { ...f, createdAt: reviveDate(f.createdAt) },
        ])
      );
      this.certificates = new Map(
        (snapshot.certificates ?? []).map((c) => [
          c.id,
          { ...c, issueDate: reviveDate(c.issueDate) },
        ])
      );
      this.certifications = snapshot.certifications ?? [];

      const counters = snapshot.counters;
      this.currentUserId = counters?.currentUserId ?? nextId(this.users);
      this.currentModuleId = counters?.currentModuleId ?? nextId(this.modules);
      this.currentLessonId = counters?.currentLessonId ?? nextId(this.lessons);
      this.currentStepId = counters?.currentStepId ?? nextId(this.steps);
      this.currentResourceId = counters?.currentResourceId ?? nextId(this.resources);
      this.currentProductId = counters?.currentProductId ?? nextId(this.products);
      this.currentQuizId = counters?.currentQuizId ?? nextId(this.quizzes);
      this.currentUserProgressId = counters?.currentUserProgressId ?? nextId(this.userProgress);
      this.currentUserNoteId = counters?.currentUserNoteId ?? nextId(this.userNotes);
      this.currentLessonFeedbackId = counters?.currentLessonFeedbackId ?? nextId(this.lessonFeedback);
      this.currentCertificateId = counters?.currentCertificateId ?? nextId(this.certificates);
      return true;
    } catch (error) {
      console.warn("[lms-store] failed to load snapshot:", error);
      return false;
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const password = isHashedPassword(insertUser.password)
      ? insertUser.password
      : hashPassword(insertUser.password);
    const user: User = { ...insertUser, password, id, createdAt };
    this.users.set(id, user);
    this.persistToDisk();
    return user;
  }
  
  // Module methods
  async getAllModules(): Promise<Module[]> {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }
  
  async getModule(id: number): Promise<Module | undefined> {
    return this.modules.get(id);
  }
  
  async createModule(module: InsertModule): Promise<Module> {
    const id = this.currentModuleId++;
    const newModule: Module = { ...module, id };
    this.modules.set(id, newModule);
    this.persistToDisk();
    return newModule;
  }
  
  // Lesson methods
  async getLessonsByModuleId(moduleId: number): Promise<Lesson[]> {
    return Array.from(this.lessons.values())
      .filter(lesson => lesson.moduleId === moduleId)
      .sort((a, b) => a.order - b.order);
  }
  
  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }
  
  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    const id = this.currentLessonId++;
    const newLesson: Lesson = { ...lesson, id };
    this.lessons.set(id, newLesson);
    this.persistToDisk();
    return newLesson;
  }
  
  // Step methods
  async getStepsByLessonId(lessonId: number): Promise<Step[]> {
    return Array.from(this.steps.values())
      .filter(step => step.lessonId === lessonId)
      .sort((a, b) => a.order - b.order);
  }
  
  async createStep(step: InsertStep): Promise<Step> {
    const id = this.currentStepId++;
    const newStep: Step = { ...step, id };
    this.steps.set(id, newStep);
    this.persistToDisk();
    return newStep;
  }
  
  // Resource methods
  async getResourcesByLessonId(lessonId: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.lessonId === lessonId);
  }
  
  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const newResource: Resource = { ...resource, id };
    this.resources.set(id, newResource);
    this.persistToDisk();
    return newResource;
  }
  
  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    this.persistToDisk();
    return newProduct;
  }
  
  // Quiz methods
  async getQuizByLessonId(lessonId: number): Promise<Quiz | undefined> {
    return Array.from(this.quizzes.values())
      .find(quiz => quiz.lessonId === lessonId);
  }
  
  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentQuizId++;
    const newQuiz: Quiz = { ...quiz, id };
    this.quizzes.set(id, newQuiz);
    this.persistToDisk();
    return newQuiz;
  }
  
  // User Progress methods
  async getUserProgressByUserId(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }
  
  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = Array.from(this.userProgress.values())
      .find(p => p.userId === progress.userId && 
        p.lessonId === progress.lessonId && 
        p.moduleId === progress.moduleId);
    
    if (existing) {
      const updated: UserProgress = {
        ...existing,
        completed: progress.completed,
        quizScore: progress.quizScore,
        lastAccessed: new Date()
      };
      this.userProgress.set(existing.id, updated);
      this.persistToDisk();
      return updated;
    }
    
    const id = this.currentUserProgressId++;
    const newProgress: UserProgress = { 
      ...progress, 
      id, 
      lastAccessed: new Date() 
    };
    this.userProgress.set(id, newProgress);
    this.persistToDisk();
    return newProgress;
  }
  
  // User Notes methods
  async getUserNotesByLessonAndUserId(lessonId: number, userId: number): Promise<UserNote | undefined> {
    return Array.from(this.userNotes.values())
      .find(note => note.lessonId === lessonId && note.userId === userId);
  }
  
  async createOrUpdateUserNote(note: InsertUserNote): Promise<UserNote> {
    const existing = Array.from(this.userNotes.values())
      .find(n => n.lessonId === note.lessonId && n.userId === note.userId);
    
    if (existing) {
      const updated: UserNote = {
        ...existing,
        content: note.content,
        updatedAt: new Date()
      };
      this.userNotes.set(existing.id, updated);
      this.persistToDisk();
      return updated;
    }
    
    const id = this.currentUserNoteId++;
    const newNote: UserNote = { 
      ...note, 
      id, 
      updatedAt: new Date() 
    };
    this.userNotes.set(id, newNote);
    this.persistToDisk();
    return newNote;
  }
  
  // Lesson Feedback methods
  async createLessonFeedback(feedback: InsertLessonFeedback): Promise<LessonFeedback> {
    const id = this.currentLessonFeedbackId++;
    const newFeedback: LessonFeedback = { 
      ...feedback, 
      id, 
      createdAt: new Date() 
    };
    this.lessonFeedback.set(id, newFeedback);
    this.persistToDisk();
    return newFeedback;
  }
  
  // Certificate methods
  async getUserCertificates(userId: number): Promise<Certificate[]> {
    return Array.from(this.certificates.values())
      .filter(cert => cert.userId === userId);
  }
  
  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const id = this.currentCertificateId++;
    const newCertificate: Certificate = { 
      ...certificate, 
      id, 
      issueDate: new Date() 
    };
    this.certificates.set(id, newCertificate);
    this.persistToDisk();
    return newCertificate;
  }
  
  // Helper methods
  async getUserProgressSummary(userId: number): Promise<{
    completedModules: number;
    totalModules: number;
    percentComplete: number;
  }> {
    const modules = await this.getAllModules();
    const totalModules = modules.length;
    
    const userProgress = await this.getUserProgressByUserId(userId);
    
    const completedLessons = userProgress.filter(p => p.completed);
    
    const completedModuleIds = new Set<number>();
    
    for (const module of modules) {
      const lessons = await this.getLessonsByModuleId(module.id);
      if (lessons.length === 0) continue;
      
      const allLessonsCompleted = lessons.every(lesson => 
        completedLessons.some(p => p.lessonId === lesson.id)
      );
      
      if (allLessonsCompleted) {
        completedModuleIds.add(module.id);
      }
    }
    
    const completedModules = completedModuleIds.size;
    const percentComplete = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
    
    return {
      completedModules,
      totalModules,
      percentComplete
    };
  }
}

function nextId(map: Map<number, unknown>): number {
  let max = 0;
  for (const id of map.keys()) {
    if (id > max) max = id;
  }
  return max + 1;
}

export const storage = new MemStorage();
