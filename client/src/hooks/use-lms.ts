/**
 * LMS Integration Hook
 * 
 * React hook for interacting with LMS integration features
 * including xAPI tracking and SCORM exports.
 */

import { useState, useCallback } from 'react';

interface XAPIResult {
  success: boolean;
  statementId?: string;
  error?: string;
}

interface SCORMExportResult {
  success: boolean;
  packageDir?: string;
  message?: string;
  error?: string;
}

interface LMSStatus {
  xapi: { enabled: boolean; localStatements: number };
  scorm: { enabled: boolean; versions: string[] };
  lti: { enabled: boolean; version: string; registeredPlatforms: number };
}

export function useLMS() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Track lesson launch via xAPI
   */
  const trackLessonLaunched = useCallback(async (
    lessonId: number,
    lessonTitle: string,
    moduleId?: number
  ): Promise<XAPIResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lms/xapi/lesson-launched', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, lessonTitle, moduleId }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to track lesson launch');
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Track lesson completion via xAPI
   */
  const trackLessonCompleted = useCallback(async (
    lessonId: number,
    lessonTitle: string,
    moduleId?: number,
    duration?: string
  ): Promise<XAPIResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lms/xapi/lesson-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, lessonTitle, moduleId, duration }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to track lesson completion');
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Track quiz result via xAPI
   */
  const trackQuizResult = useCallback(async (
    quizId: number,
    lessonId: number,
    quizTitle: string,
    score: number,
    maxScore: number,
    moduleId?: number
  ): Promise<XAPIResult & { passed?: boolean }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lms/xapi/quiz-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, lessonId, quizTitle, score, maxScore, moduleId }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to track quiz result');
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export lesson as SCORM package
   */
  const exportLessonSCORM = useCallback(async (
    lessonId: number,
    version: '1.2' | '2004' = '2004'
  ): Promise<SCORMExportResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lms/scorm/export-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, version }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to export lesson');
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Export module as SCORM package
   */
  const exportModuleSCORM = useCallback(async (
    moduleId: number,
    version: '1.2' | '2004' = '2004'
  ): Promise<SCORMExportResult & { lessonCount?: number }> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lms/scorm/export-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, version }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to export module');
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get LMS integration status
   */
  const getLMSStatus = useCallback(async (): Promise<LMSStatus | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/lms/status');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get LMS status');
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    trackLessonLaunched,
    trackLessonCompleted,
    trackQuizResult,
    exportLessonSCORM,
    exportModuleSCORM,
    getLMSStatus,
  };
}

export default useLMS;
