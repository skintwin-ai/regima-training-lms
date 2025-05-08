import { 
  users, type User, type InsertUser,
  modules, type Module, type InsertModule,
  lessons, type Lesson, type InsertLesson,
  steps, type Step, type InsertStep,
  resources, type Resource, type InsertResource,
  products, type Product, type InsertProduct,
  quizzes, type Quiz, type InsertQuiz,
  userProgress, type UserProgress, type InsertUserProgress,
  userNotes, type UserNote, type InsertUserNote,
  lessonFeedback, type LessonFeedback, type InsertLessonFeedback,
  certificates, type Certificate, type InsertCertificate,
  type Question
} from "@shared/schema";

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

  constructor() {
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
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create a demo user
    const demoUser: InsertUser = {
      username: 'demo',
      password: 'password',
      name: 'Dr. Jane Doe',
      role: 'Skincare Specialist'
    };
    this.createUser(demoUser);
    
    // Sample modules will be created in routes
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
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
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
    return newQuiz;
  }
  
  // User Progress methods
  async getUserProgressByUserId(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }
  
  async updateUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    // Check if progress already exists
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
      return updated;
    }
    
    // Create new progress
    const id = this.currentUserProgressId++;
    const newProgress: UserProgress = { 
      ...progress, 
      id, 
      lastAccessed: new Date() 
    };
    this.userProgress.set(id, newProgress);
    return newProgress;
  }
  
  // User Notes methods
  async getUserNotesByLessonAndUserId(lessonId: number, userId: number): Promise<UserNote | undefined> {
    return Array.from(this.userNotes.values())
      .find(note => note.lessonId === lessonId && note.userId === userId);
  }
  
  async createOrUpdateUserNote(note: InsertUserNote): Promise<UserNote> {
    // Check if note already exists
    const existing = Array.from(this.userNotes.values())
      .find(n => n.lessonId === note.lessonId && n.userId === note.userId);
    
    if (existing) {
      const updated: UserNote = {
        ...existing,
        content: note.content,
        updatedAt: new Date()
      };
      this.userNotes.set(existing.id, updated);
      return updated;
    }
    
    // Create new note
    const id = this.currentUserNoteId++;
    const newNote: UserNote = { 
      ...note, 
      id, 
      updatedAt: new Date() 
    };
    this.userNotes.set(id, newNote);
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
    
    // Get all completed lessons
    const completedLessons = userProgress.filter(p => p.completed);
    
    // Get completed modules (all lessons in the module are completed)
    const completedModuleIds = new Set<number>();
    
    for (const module of modules) {
      const lessons = await this.getLessonsByModuleId(module.id);
      if (lessons.length === 0) continue;
      
      // Check if all lessons in this module are completed
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

export const storage = new MemStorage();
