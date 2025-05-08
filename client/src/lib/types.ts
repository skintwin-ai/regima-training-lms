// User types
export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

// Module types
export interface Module {
  id: number;
  title: string;
  description: string;
  estimatedTime: string;
  order: number;
  lessons?: Lesson[];
}

// Lesson types
export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  order: number;
  steps?: Step[];
  resources?: Resource[];
  quiz?: Quiz;
}

// Step types
export interface Step {
  id: number;
  lessonId: number;
  title: string;
  description: string;
  order: number;
}

// Resource types
export interface Resource {
  id: number;
  lessonId: number;
  title: string;
  type: string;
  url: string;
  fileSize?: string;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  ingredients: string[];
}

// Quiz types
export interface Quiz {
  id: number;
  lessonId: number;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
}

export interface QuestionOption {
  id: string;
  text: string;
}

// Progress types
export interface UserProgress {
  id: number;
  userId: number;
  moduleId: number;
  lessonId: number;
  completed: boolean;
  quizScore?: number;
  lastAccessed: Date;
}

export interface ProgressSummary {
  completedModules: number;
  totalModules: number;
  percentComplete: number;
  completedModuleIds?: number[];
  lessonProgress?: Record<number, UserProgress>;
}

// Note types
export interface UserNote {
  id: number;
  userId: number;
  lessonId: number;
  content: string;
  updatedAt: Date;
}

// Feedback types
export interface LessonFeedback {
  id: number;
  userId: number;
  lessonId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Certificate types
export interface Certificate {
  id: number;
  userId: number;
  moduleId: number;
  issueDate: Date;
}
