/**
 * xAPI Service
 * 
 * Handles xAPI statement generation and submission to Learning Record Stores (LRS).
 * Implements the Experience API (xAPI/Tin Can) specification for tracking learning activities.
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  XAPIStatement, 
  XAPIActor, 
  XAPIVerb, 
  XAPIObject, 
  XAPIResult, 
  XAPIContext 
} from '@shared/lms-types';
import { XAPI_VERBS } from '@shared/lms-types';

// Configuration interface for xAPI service
interface XAPIConfig {
  endpoint: string;
  auth: {
    type: 'basic' | 'oauth';
    username?: string;
    password?: string;
    token?: string;
  };
  activityIdBase: string;
  version: string;
}

// Default configuration
const DEFAULT_CONFIG: XAPIConfig = {
  endpoint: process.env.XAPI_ENDPOINT || 'http://localhost:8080/xapi',
  auth: {
    type: 'basic',
    username: process.env.XAPI_USERNAME || 'admin',
    password: process.env.XAPI_PASSWORD || 'password',
  },
  activityIdBase: process.env.XAPI_ACTIVITY_BASE || 'https://regima.training/activities',
  version: '1.0.3',
};

export class XAPIService {
  private config: XAPIConfig;
  private statements: XAPIStatement[] = [];

  constructor(config: Partial<XAPIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create an actor from user data
   */
  createActor(userId: number, email: string, name: string): XAPIActor {
    return {
      objectType: 'Agent',
      name,
      mbox: `mailto:${email}`,
      account: {
        homePage: 'https://regima.training',
        name: userId.toString(),
      },
    };
  }

  /**
   * Create an activity object for a lesson
   */
  createLessonActivity(lessonId: number, title: string, description?: string): XAPIObject {
    return {
      objectType: 'Activity',
      id: `${this.config.activityIdBase}/lesson/${lessonId}`,
      definition: {
        type: 'http://adlnet.gov/expapi/activities/lesson',
        name: { 'en-US': title },
        description: description ? { 'en-US': description } : undefined,
        extensions: {
          'https://regima.training/extensions/lessonId': lessonId,
        },
      },
    };
  }

  /**
   * Create an activity object for a module
   */
  createModuleActivity(moduleId: number, title: string, description?: string): XAPIObject {
    return {
      objectType: 'Activity',
      id: `${this.config.activityIdBase}/module/${moduleId}`,
      definition: {
        type: 'http://adlnet.gov/expapi/activities/module',
        name: { 'en-US': title },
        description: description ? { 'en-US': description } : undefined,
        extensions: {
          'https://regima.training/extensions/moduleId': moduleId,
        },
      },
    };
  }

  /**
   * Create an activity object for a quiz
   */
  createQuizActivity(quizId: number, lessonId: number, title: string): XAPIObject {
    return {
      objectType: 'Activity',
      id: `${this.config.activityIdBase}/quiz/${quizId}`,
      definition: {
        type: 'http://adlnet.gov/expapi/activities/assessment',
        name: { 'en-US': title },
        extensions: {
          'https://regima.training/extensions/quizId': quizId,
          'https://regima.training/extensions/lessonId': lessonId,
        },
      },
    };
  }

  /**
   * Create context for a statement
   */
  createContext(moduleId?: number, lessonId?: number, registration?: string): XAPIContext {
    const context: XAPIContext = {
      platform: 'RegimA Training System',
      language: 'en-US',
      extensions: {
        'https://regima.training/extensions/version': '1.0.0',
      },
    };

    if (registration) {
      context.registration = registration;
    }

    if (moduleId) {
      context.contextActivities = {
        parent: [{
          objectType: 'Activity',
          id: `${this.config.activityIdBase}/module/${moduleId}`,
        }],
        grouping: [{
          objectType: 'Activity',
          id: `${this.config.activityIdBase}/course/regima-training`,
        }],
      };
    }

    return context;
  }

  /**
   * Build a complete xAPI statement
   */
  buildStatement(
    actor: XAPIActor,
    verb: XAPIVerb,
    object: XAPIObject,
    result?: XAPIResult,
    context?: XAPIContext
  ): XAPIStatement {
    return {
      id: uuidv4(),
      actor,
      verb,
      object,
      result,
      context,
      timestamp: new Date().toISOString(),
      version: this.config.version,
    };
  }

  // ==========================================================================
  // Pre-built Statement Generators
  // ==========================================================================

  /**
   * Generate statement: User launched a lesson
   */
  lessonLaunched(
    userId: number,
    email: string,
    userName: string,
    lessonId: number,
    lessonTitle: string,
    moduleId?: number
  ): XAPIStatement {
    const actor = this.createActor(userId, email, userName);
    const object = this.createLessonActivity(lessonId, lessonTitle);
    const context = this.createContext(moduleId, lessonId);

    return this.buildStatement(actor, XAPI_VERBS.LAUNCHED, object, undefined, context);
  }

  /**
   * Generate statement: User completed a lesson
   */
  lessonCompleted(
    userId: number,
    email: string,
    userName: string,
    lessonId: number,
    lessonTitle: string,
    moduleId?: number,
    duration?: string
  ): XAPIStatement {
    const actor = this.createActor(userId, email, userName);
    const object = this.createLessonActivity(lessonId, lessonTitle);
    const context = this.createContext(moduleId, lessonId);
    
    const result: XAPIResult = {
      completion: true,
    };
    
    if (duration) {
      result.duration = duration;
    }

    return this.buildStatement(actor, XAPI_VERBS.COMPLETED, object, result, context);
  }

  /**
   * Generate statement: User progressed through a lesson
   */
  lessonProgressed(
    userId: number,
    email: string,
    userName: string,
    lessonId: number,
    lessonTitle: string,
    progressPercent: number,
    moduleId?: number
  ): XAPIStatement {
    const actor = this.createActor(userId, email, userName);
    const object = this.createLessonActivity(lessonId, lessonTitle);
    const context = this.createContext(moduleId, lessonId);
    
    const result: XAPIResult = {
      extensions: {
        'https://regima.training/extensions/progress': progressPercent,
      },
    };

    return this.buildStatement(actor, XAPI_VERBS.PROGRESSED, object, result, context);
  }

  /**
   * Generate statement: User passed a quiz
   */
  quizPassed(
    userId: number,
    email: string,
    userName: string,
    quizId: number,
    lessonId: number,
    quizTitle: string,
    score: number,
    maxScore: number,
    moduleId?: number
  ): XAPIStatement {
    const actor = this.createActor(userId, email, userName);
    const object = this.createQuizActivity(quizId, lessonId, quizTitle);
    const context = this.createContext(moduleId, lessonId);
    
    const result: XAPIResult = {
      score: {
        scaled: score / maxScore,
        raw: score,
        min: 0,
        max: maxScore,
      },
      success: true,
      completion: true,
    };

    return this.buildStatement(actor, XAPI_VERBS.PASSED, object, result, context);
  }

  /**
   * Generate statement: User failed a quiz
   */
  quizFailed(
    userId: number,
    email: string,
    userName: string,
    quizId: number,
    lessonId: number,
    quizTitle: string,
    score: number,
    maxScore: number,
    moduleId?: number
  ): XAPIStatement {
    const actor = this.createActor(userId, email, userName);
    const object = this.createQuizActivity(quizId, lessonId, quizTitle);
    const context = this.createContext(moduleId, lessonId);
    
    const result: XAPIResult = {
      score: {
        scaled: score / maxScore,
        raw: score,
        min: 0,
        max: maxScore,
      },
      success: false,
      completion: true,
    };

    return this.buildStatement(actor, XAPI_VERBS.FAILED, object, result, context);
  }

  /**
   * Generate statement: User answered a quiz question
   */
  questionAnswered(
    userId: number,
    email: string,
    userName: string,
    quizId: number,
    questionId: string,
    questionText: string,
    response: string,
    correct: boolean,
    lessonId: number,
    moduleId?: number
  ): XAPIStatement {
    const actor = this.createActor(userId, email, userName);
    const object: XAPIObject = {
      objectType: 'Activity',
      id: `${this.config.activityIdBase}/quiz/${quizId}/question/${questionId}`,
      definition: {
        type: 'http://adlnet.gov/expapi/activities/cmi.interaction',
        name: { 'en-US': questionText },
        extensions: {
          'https://regima.training/extensions/questionId': questionId,
          'https://regima.training/extensions/quizId': quizId,
        },
      },
    };
    const context = this.createContext(moduleId, lessonId);
    
    const result: XAPIResult = {
      response,
      success: correct,
    };

    return this.buildStatement(actor, XAPI_VERBS.ANSWERED, object, result, context);
  }

  /**
   * Generate statement: User completed a module
   */
  moduleCompleted(
    userId: number,
    email: string,
    userName: string,
    moduleId: number,
    moduleTitle: string,
    lessonsCompleted: number,
    totalLessons: number
  ): XAPIStatement {
    const actor = this.createActor(userId, email, userName);
    const object = this.createModuleActivity(moduleId, moduleTitle);
    const context = this.createContext(moduleId);
    
    const result: XAPIResult = {
      completion: true,
      extensions: {
        'https://regima.training/extensions/lessonsCompleted': lessonsCompleted,
        'https://regima.training/extensions/totalLessons': totalLessons,
      },
    };

    return this.buildStatement(actor, XAPI_VERBS.COMPLETED, object, result, context);
  }

  // ==========================================================================
  // LRS Communication
  // ==========================================================================

  /**
   * Get authorization header for LRS requests
   */
  private getAuthHeader(): string {
    if (this.config.auth.type === 'basic') {
      const credentials = Buffer.from(
        `${this.config.auth.username}:${this.config.auth.password}`
      ).toString('base64');
      return `Basic ${credentials}`;
    }
    return `Bearer ${this.config.auth.token}`;
  }

  /**
   * Send a statement to the LRS
   */
  async sendStatement(statement: XAPIStatement): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch(`${this.config.endpoint}/statements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'X-Experience-API-Version': this.config.version,
        },
        body: JSON.stringify(statement),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `LRS error: ${response.status} - ${errorText}` };
      }

      const result = await response.json();
      return { success: true, id: result[0] || statement.id };
    } catch (error) {
      // If LRS is not available, store locally
      this.statements.push(statement);
      console.log('xAPI statement stored locally (LRS unavailable):', statement.id);
      return { success: true, id: statement.id };
    }
  }

  /**
   * Send multiple statements to the LRS
   */
  async sendStatements(statements: XAPIStatement[]): Promise<{ success: boolean; ids?: string[]; error?: string }> {
    try {
      const response = await fetch(`${this.config.endpoint}/statements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'X-Experience-API-Version': this.config.version,
        },
        body: JSON.stringify(statements),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, error: `LRS error: ${response.status} - ${errorText}` };
      }

      const result = await response.json();
      return { success: true, ids: result };
    } catch (error) {
      // Store locally if LRS unavailable
      this.statements.push(...statements);
      console.log(`${statements.length} xAPI statements stored locally (LRS unavailable)`);
      return { success: true, ids: statements.map(s => s.id!) };
    }
  }

  /**
   * Get locally stored statements (for when LRS is unavailable)
   */
  getLocalStatements(): XAPIStatement[] {
    return [...this.statements];
  }

  /**
   * Clear locally stored statements
   */
  clearLocalStatements(): void {
    this.statements = [];
  }

  /**
   * Flush local statements to LRS
   */
  async flushLocalStatements(): Promise<{ success: boolean; flushed: number; error?: string }> {
    if (this.statements.length === 0) {
      return { success: true, flushed: 0 };
    }

    const result = await this.sendStatements(this.statements);
    if (result.success) {
      const flushed = this.statements.length;
      this.clearLocalStatements();
      return { success: true, flushed };
    }

    return { success: false, flushed: 0, error: result.error };
  }
}

// Singleton instance
let xapiServiceInstance: XAPIService | null = null;

export function getXAPIService(config?: Partial<XAPIConfig>): XAPIService {
  if (!xapiServiceInstance) {
    xapiServiceInstance = new XAPIService(config);
  }
  return xapiServiceInstance;
}

export default XAPIService;
