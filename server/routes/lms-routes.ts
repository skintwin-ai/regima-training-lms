/**
 * LMS Integration Routes
 * 
 * Express routes for SCORM, xAPI, and LTI integration endpoints.
 */

import { Router, Request, Response } from 'express';
import { getXAPIService } from '../services/xapi-service';
import { getSCORMService } from '../services/scorm-service';
import { getLTIService } from '../services/lti-service';
import { storage } from '../storage';
import path from 'path';
import fs from 'fs';

const router = Router();

// =============================================================================
// xAPI Routes
// =============================================================================

/**
 * POST /api/lms/xapi/statements
 * Record xAPI statements for learning activities
 */
router.post('/xapi/statements', async (req: Request, res: Response) => {
  try {
    const xapiService = getXAPIService();
    const { statements } = req.body;

    if (!Array.isArray(statements)) {
      return res.status(400).json({ error: 'statements must be an array' });
    }

    const result = await xapiService.sendStatements(statements);
    
    if (result.success) {
      res.json({ success: true, ids: result.ids });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('xAPI statement error:', error);
    res.status(500).json({ error: 'Failed to record xAPI statements' });
  }
});

/**
 * POST /api/lms/xapi/lesson-launched
 * Record lesson launch event
 */
router.post('/xapi/lesson-launched', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { lessonId, lessonTitle, moduleId } = req.body;
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const xapiService = getXAPIService();
    const statement = xapiService.lessonLaunched(
      user.id,
      `${user.username}@regima.training`,
      user.name,
      lessonId,
      lessonTitle,
      moduleId
    );

    const result = await xapiService.sendStatement(statement);
    res.json({ success: result.success, statementId: result.id });
  } catch (error) {
    console.error('xAPI lesson launched error:', error);
    res.status(500).json({ error: 'Failed to record lesson launch' });
  }
});

/**
 * POST /api/lms/xapi/lesson-completed
 * Record lesson completion event
 */
router.post('/xapi/lesson-completed', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { lessonId, lessonTitle, moduleId, duration } = req.body;
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const xapiService = getXAPIService();
    const statement = xapiService.lessonCompleted(
      user.id,
      `${user.username}@regima.training`,
      user.name,
      lessonId,
      lessonTitle,
      moduleId,
      duration
    );

    const result = await xapiService.sendStatement(statement);
    res.json({ success: result.success, statementId: result.id });
  } catch (error) {
    console.error('xAPI lesson completed error:', error);
    res.status(500).json({ error: 'Failed to record lesson completion' });
  }
});

/**
 * POST /api/lms/xapi/quiz-result
 * Record quiz result event
 */
router.post('/xapi/quiz-result', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { quizId, lessonId, quizTitle, score, maxScore, moduleId } = req.body;
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const xapiService = getXAPIService();
    const passed = score >= (maxScore * 0.7);
    
    const statement = passed
      ? xapiService.quizPassed(
          user.id,
          `${user.username}@regima.training`,
          user.name,
          quizId,
          lessonId,
          quizTitle,
          score,
          maxScore,
          moduleId
        )
      : xapiService.quizFailed(
          user.id,
          `${user.username}@regima.training`,
          user.name,
          quizId,
          lessonId,
          quizTitle,
          score,
          maxScore,
          moduleId
        );

    const result = await xapiService.sendStatement(statement);
    res.json({ success: result.success, statementId: result.id, passed });
  } catch (error) {
    console.error('xAPI quiz result error:', error);
    res.status(500).json({ error: 'Failed to record quiz result' });
  }
});

/**
 * GET /api/lms/xapi/local-statements
 * Get locally stored statements (for debugging)
 */
router.get('/xapi/local-statements', async (req: Request, res: Response) => {
  try {
    const xapiService = getXAPIService();
    const statements = xapiService.getLocalStatements();
    res.json({ count: statements.length, statements });
  } catch (error) {
    console.error('xAPI local statements error:', error);
    res.status(500).json({ error: 'Failed to get local statements' });
  }
});

// =============================================================================
// SCORM Routes
// =============================================================================

/**
 * POST /api/lms/scorm/export-lesson
 * Export a lesson as a SCORM package
 */
router.post('/scorm/export-lesson', async (req: Request, res: Response) => {
  try {
    const { lessonId, version = '2004' } = req.body;

    // Get lesson data
    const lesson = await storage.getLesson(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const steps = await storage.getStepsByLessonId(lessonId);
    const resources = await storage.getResourcesByLessonId(lessonId);
    const quiz = await storage.getQuizByLessonId(lessonId);

    const lessonData = {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      content: lesson.content,
      videoUrl: lesson.videoUrl || undefined,
      steps: steps.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        order: s.order,
      })),
      resources: resources.map(r => ({
        id: r.id,
        title: r.title,
        type: r.type,
        url: r.url,
      })),
      quiz: quiz ? {
        id: quiz.id,
        questions: quiz.questions as any[],
      } : undefined,
    };

    const scormService = getSCORMService(version as '1.2' | '2004');
    const packageDir = await scormService.generateLessonPackage(lessonData, lesson.moduleId);

    res.json({
      success: true,
      packageDir,
      message: `SCORM ${version} package generated for lesson: ${lesson.title}`,
    });
  } catch (error) {
    console.error('SCORM export lesson error:', error);
    res.status(500).json({ error: 'Failed to export lesson as SCORM' });
  }
});

/**
 * POST /api/lms/scorm/export-module
 * Export an entire module as a SCORM package
 */
router.post('/scorm/export-module', async (req: Request, res: Response) => {
  try {
    const { moduleId, version = '2004' } = req.body;

    // Get module data
    const module = await storage.getModule(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const lessons = await storage.getLessonsByModuleId(moduleId);
    
    const lessonsData = await Promise.all(lessons.map(async (lesson) => {
      const steps = await storage.getStepsByLessonId(lesson.id);
      const resources = await storage.getResourcesByLessonId(lesson.id);
      const quiz = await storage.getQuizByLessonId(lesson.id);

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        videoUrl: lesson.videoUrl || undefined,
        steps: steps.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          order: s.order,
        })),
        resources: resources.map(r => ({
          id: r.id,
          title: r.title,
          type: r.type,
          url: r.url,
        })),
        quiz: quiz ? {
          id: quiz.id,
          questions: quiz.questions as any[],
        } : undefined,
      };
    }));

    const moduleData = {
      id: module.id,
      title: module.title,
      description: module.description,
      estimatedTime: module.estimatedTime,
      lessons: lessonsData,
    };

    const scormService = getSCORMService(version as '1.2' | '2004');
    const packageDir = await scormService.generateModulePackage(moduleData);

    res.json({
      success: true,
      packageDir,
      message: `SCORM ${version} package generated for module: ${module.title}`,
      lessonCount: lessonsData.length,
    });
  } catch (error) {
    console.error('SCORM export module error:', error);
    res.status(500).json({ error: 'Failed to export module as SCORM' });
  }
});

/**
 * GET /api/lms/scorm/download/:packageId
 * Download a generated SCORM package
 */
router.get('/scorm/download/:packageId', async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const packageDir = path.join('/tmp/scorm-packages', packageId);
    const zipPath = `${packageDir}.zip`;

    // Check if package exists
    if (!fs.existsSync(packageDir)) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Create ZIP if it doesn't exist
    if (!fs.existsSync(zipPath)) {
      const scormService = getSCORMService();
      await scormService.createZipPackage(packageDir);
    }

    res.download(zipPath, `${packageId}.zip`);
  } catch (error) {
    console.error('SCORM download error:', error);
    res.status(500).json({ error: 'Failed to download SCORM package' });
  }
});

// =============================================================================
// LTI Routes
// =============================================================================

/**
 * GET /api/lms/lti/jwks
 * Return JWKS for LTI tool
 */
router.get('/lti/jwks', (req: Request, res: Response) => {
  try {
    const ltiService = getLTIService();
    res.json(ltiService.getJWKS());
  } catch (error) {
    console.error('LTI JWKS error:', error);
    res.status(500).json({ error: 'Failed to get JWKS' });
  }
});

/**
 * GET /api/lms/lti/config
 * Return LTI tool configuration for platform registration
 */
router.get('/lti/config', (req: Request, res: Response) => {
  try {
    const ltiService = getLTIService();
    res.json(ltiService.getToolConfiguration());
  } catch (error) {
    console.error('LTI config error:', error);
    res.status(500).json({ error: 'Failed to get tool configuration' });
  }
});

/**
 * POST /api/lms/lti/register-platform
 * Register a new LTI platform
 */
router.post('/lti/register-platform', async (req: Request, res: Response) => {
  try {
    const platformConfig = req.body;
    
    // Validate required fields
    const required = ['issuer', 'clientId', 'deploymentId', 'authorizationEndpoint', 'tokenEndpoint', 'jwksUri', 'publicKey'];
    for (const field of required) {
      if (!platformConfig[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const ltiService = getLTIService();
    ltiService.registerPlatform(platformConfig);

    res.json({
      success: true,
      message: `Platform registered: ${platformConfig.issuer}`,
    });
  } catch (error) {
    console.error('LTI register platform error:', error);
    res.status(500).json({ error: 'Failed to register platform' });
  }
});

/**
 * GET /api/lms/lti/platforms
 * List registered LTI platforms
 */
router.get('/lti/platforms', (req: Request, res: Response) => {
  try {
    const ltiService = getLTIService();
    const platforms = ltiService.getAllPlatforms();
    
    // Return sanitized platform info (no private keys)
    const sanitized = platforms.map(p => ({
      issuer: p.issuer,
      clientId: p.clientId,
      deploymentId: p.deploymentId,
      authorizationEndpoint: p.authorizationEndpoint,
    }));

    res.json({ platforms: sanitized });
  } catch (error) {
    console.error('LTI platforms error:', error);
    res.status(500).json({ error: 'Failed to list platforms' });
  }
});

/**
 * POST /api/lms/lti/oidc
 * Handle OIDC initiation from LMS platform
 */
router.post('/lti/oidc', (req: Request, res: Response) => {
  try {
    const { iss, login_hint, target_link_uri, lti_message_hint, client_id, lti_deployment_id } = req.body;

    const ltiService = getLTIService();
    const { redirectUrl, state } = ltiService.handleOIDCInitiation({
      iss,
      login_hint,
      target_link_uri,
      lti_message_hint,
      client_id,
      lti_deployment_id,
    });

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('LTI OIDC error:', error);
    res.status(400).json({ error: `OIDC initiation failed: ${error}` });
  }
});

/**
 * GET /api/lms/lti/oidc
 * Handle OIDC initiation via GET (some platforms use GET)
 */
router.get('/lti/oidc', (req: Request, res: Response) => {
  try {
    const { iss, login_hint, target_link_uri, lti_message_hint, client_id, lti_deployment_id } = req.query;

    const ltiService = getLTIService();
    const { redirectUrl, state } = ltiService.handleOIDCInitiation({
      iss: iss as string,
      login_hint: login_hint as string,
      target_link_uri: target_link_uri as string,
      lti_message_hint: lti_message_hint as string,
      client_id: client_id as string,
      lti_deployment_id: lti_deployment_id as string,
    });

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('LTI OIDC error:', error);
    res.status(400).json({ error: `OIDC initiation failed: ${error}` });
  }
});

/**
 * POST /api/lms/lti/launch
 * Handle LTI launch callback
 */
router.post('/lti/launch', async (req: Request, res: Response) => {
  try {
    const { id_token, state } = req.body;

    const ltiService = getLTIService();
    const launch = await ltiService.validateLaunch(id_token, state);

    // Create or find user
    let user = await storage.getUserByUsername(launch.userId);
    
    if (!user) {
      // Create new user from LTI launch
      user = await storage.createUser({
        username: launch.userId,
        password: crypto.randomBytes(16).toString('hex'), // Random password
        name: launch.name || 'LTI User',
        role: ltiService.isInstructor(launch.roles) ? 'instructor' : 'learner',
      });
    }

    // Set session
    req.session.userId = user.id;

    // Determine redirect based on custom parameters
    let redirectPath = '/';
    if (launch.custom?.module_id) {
      redirectPath = `/modules/${launch.custom.module_id}`;
    } else if (launch.custom?.lesson_id) {
      redirectPath = `/lesson/${launch.custom.lesson_id}`;
    }

    // Redirect to the app
    res.redirect(redirectPath);
  } catch (error) {
    console.error('LTI launch error:', error);
    res.status(400).json({ error: `LTI launch failed: ${error}` });
  }
});

// =============================================================================
// Integration Status
// =============================================================================

/**
 * GET /api/lms/status
 * Get LMS integration status
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const xapiService = getXAPIService();
    const ltiService = getLTIService();

    res.json({
      xapi: {
        enabled: true,
        localStatements: xapiService.getLocalStatements().length,
      },
      scorm: {
        enabled: true,
        versions: ['1.2', '2004'],
      },
      lti: {
        enabled: true,
        version: '1.3',
        registeredPlatforms: ltiService.getAllPlatforms().length,
      },
    });
  } catch (error) {
    console.error('LMS status error:', error);
    res.status(500).json({ error: 'Failed to get LMS status' });
  }
});

export default router;
