import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertModuleSchema,
  insertLessonSchema,
  insertStepSchema,
  insertResourceSchema,
  insertProductSchema,
  insertQuizSchema,
  insertUserProgressSchema,
  insertUserNoteSchema,
  insertLessonFeedbackSchema,
  insertCertificateSchema,
  questionSchema
} from "@shared/schema";
import session from 'express-session';
import MemoryStore from 'memorystore';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    cookie: { maxAge: 86400000 }, // 24 hours
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // Clear expired sessions
    }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || 'regima-training-secret'
  }));

  // Initialize data
  await initializeData();

  // User authentication routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Store user in session
      req.session.userId = user.id;
      
      return res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to logout' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/auth/me', async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      console.error('Auth check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Module routes
  app.get('/api/modules', async (req, res) => {
    try {
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      console.error('Get modules error:', error);
      res.status(500).json({ message: 'Failed to fetch modules' });
    }
  });
  
  app.get('/api/modules/:id', async (req, res) => {
    try {
      const moduleId = parseInt(req.params.id);
      
      if (isNaN(moduleId)) {
        return res.status(400).json({ message: 'Invalid module ID' });
      }
      
      const module = await storage.getModule(moduleId);
      
      if (!module) {
        return res.status(404).json({ message: 'Module not found' });
      }
      
      const lessons = await storage.getLessonsByModuleId(moduleId);
      
      res.json({
        ...module,
        lessons
      });
    } catch (error) {
      console.error('Get module error:', error);
      res.status(500).json({ message: 'Failed to fetch module' });
    }
  });

  // Lesson routes
  app.get('/api/lessons/:id', async (req, res) => {
    try {
      const lessonId = parseInt(req.params.id);
      
      if (isNaN(lessonId)) {
        return res.status(400).json({ message: 'Invalid lesson ID' });
      }
      
      const lesson = await storage.getLesson(lessonId);
      
      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }
      
      // Get related data
      const steps = await storage.getStepsByLessonId(lessonId);
      const resources = await storage.getResourcesByLessonId(lessonId);
      const quiz = await storage.getQuizByLessonId(lessonId);
      
      // Get user-specific data if logged in
      let userProgress = null;
      let userNote = null;
      
      if (req.session.userId) {
        const userId = req.session.userId;
        const userProgresses = await storage.getUserProgressByUserId(userId);
        userProgress = userProgresses.find(p => p.lessonId === lessonId);
        userNote = await storage.getUserNotesByLessonAndUserId(lessonId, userId);
      }
      
      res.json({
        ...lesson,
        steps,
        resources,
        quiz,
        userProgress,
        userNote
      });
    } catch (error) {
      console.error('Get lesson error:', error);
      res.status(500).json({ message: 'Failed to fetch lesson' });
    }
  });

  // User progress routes
  app.post('/api/progress', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const userProgress = await storage.updateUserProgress(progressData);
      res.json(userProgress);
    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({ message: 'Failed to update progress' });
    }
  });
  
  app.get('/api/progress/summary', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const summary = await storage.getUserProgressSummary(req.session.userId);
      res.json(summary);
    } catch (error) {
      console.error('Get progress summary error:', error);
      res.status(500).json({ message: 'Failed to fetch progress summary' });
    }
  });

  // User notes routes
  app.post('/api/notes', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const noteData = insertUserNoteSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const note = await storage.createOrUpdateUserNote(noteData);
      res.json(note);
    } catch (error) {
      console.error('Save note error:', error);
      res.status(500).json({ message: 'Failed to save note' });
    }
  });

  // Lesson feedback routes
  app.post('/api/feedback', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const feedbackData = insertLessonFeedbackSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const feedback = await storage.createLessonFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      console.error('Save feedback error:', error);
      res.status(500).json({ message: 'Failed to save feedback' });
    }
  });

  // Certificate routes
  app.post('/api/certificates', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const certificateData = insertCertificateSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      const certificate = await storage.createCertificate(certificateData);
      res.json(certificate);
    } catch (error) {
      console.error('Create certificate error:', error);
      res.status(500).json({ message: 'Failed to create certificate' });
    }
  });
  
  app.get('/api/certificates', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const certificates = await storage.getUserCertificates(req.session.userId);
      res.json(certificates);
    } catch (error) {
      console.error('Get certificates error:', error);
      res.status(500).json({ message: 'Failed to fetch certificates' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize sample data for the application
async function initializeData() {
  try {
    // Create modules
    const modules = [
      {
        title: "Introduction to REGIMA",
        description: "Learn about the REGIMA skincare philosophy and approach",
        estimatedTime: "30 minutes",
        order: 1
      },
      {
        title: "Skin Assessment Basics",
        description: "Master the fundamentals of skin analysis and client assessment",
        estimatedTime: "45 minutes",
        order: 2
      },
      {
        title: "Product Knowledge",
        description: "Detailed overview of REGIMA product line and applications",
        estimatedTime: "60 minutes",
        order: 3
      },
      {
        title: "Client Consultation",
        description: "Effective consultation techniques and client communication",
        estimatedTime: "45 minutes",
        order: 4
      },
      {
        title: "Advanced Facial Techniques",
        description: "Master the core techniques of REGIMA facial treatments",
        estimatedTime: "45 minutes",
        order: 5
      },
      {
        title: "Chemical Peels",
        description: "Safe application and protocols for chemical peels",
        estimatedTime: "60 minutes",
        order: 6
      },
      {
        title: "Microdermabrasion",
        description: "Microdermabrasion techniques and best practices",
        estimatedTime: "45 minutes",
        order: 7
      },
      {
        title: "Anti-Aging Protocols",
        description: "Advanced anti-aging treatment protocols",
        estimatedTime: "60 minutes",
        order: 8
      },
      {
        title: "Acne Treatments",
        description: "Specialized protocols for acne and problematic skin",
        estimatedTime: "45 minutes",
        order: 9
      },
      {
        title: "Sensitive Skin Care",
        description: "Techniques for treating sensitive and reactive skin",
        estimatedTime: "45 minutes",
        order: 10
      },
      {
        title: "Business Integration",
        description: "Integrating REGIMA treatments into your business",
        estimatedTime: "45 minutes",
        order: 11
      },
      {
        title: "Final Assessment",
        description: "Comprehensive assessment of your REGIMA training",
        estimatedTime: "60 minutes",
        order: 12
      }
    ];
    
    for (const moduleData of modules) {
      await storage.createModule(moduleData);
    }
    
    // Create lesson for module 5 (Advanced Facial Techniques)
    const lesson = await storage.createLesson({
      moduleId: 5,
      title: "Lymphatic Drainage Massage",
      description: "This lesson covers advanced techniques for facial lymphatic drainage massage, a core component of REGIMA's signature facial treatments.",
      content: "Lymphatic drainage massage is an essential technique in advanced skincare, targeting the lymphatic system to reduce puffiness and detoxify the skin. REGIMA's approach combines traditional methods with proprietary movements for optimal results.",
      videoUrl: "https://images.unsplash.com/photo-1595624871930-6e8537998592",
      order: 4
    });
    
    // Create steps for the lesson
    const steps = [
      {
        lessonId: lesson.id,
        title: "Preparation",
        description: "Apply REGIMA Lymphatic Boost Oil to clean skin. Use 2-3 pumps and warm between palms before application.",
        order: 1
      },
      {
        lessonId: lesson.id,
        title: "Initial Clearing",
        description: "Begin at the suboccipital release points behind the ears, using gentle stationary circles to open drainage pathways.",
        order: 2
      },
      {
        lessonId: lesson.id,
        title: "Cheek Drainage",
        description: "Use gentle sweeping motions starting from the center of the face, moving outward toward the lymph nodes. Repeat 3-5 times on each side.",
        order: 3
      },
      {
        lessonId: lesson.id,
        title: "REGIMA Signature Technique",
        description: "Apply the proprietary \"butterfly flutter\" technique along the zygomatic arch, using fingertips in a rapid, light-pressure pattern.",
        order: 4
      },
      {
        lessonId: lesson.id,
        title: "Under-eye Drainage",
        description: "Use ring fingers only with extremely light pressure. Start at inner corner and sweep outward, repeating 5 times.",
        order: 5
      },
      {
        lessonId: lesson.id,
        title: "Completion",
        description: "Finish with gentle pressure at the supraclavicular nodes to complete the drainage pathway.",
        order: 6
      }
    ];
    
    for (const stepData of steps) {
      await storage.createStep(stepData);
    }
    
    // Create resources for the lesson
    const resources = [
      {
        lessonId: lesson.id,
        title: "Lymphatic Pathways Reference",
        type: "pdf",
        url: "/resources/lymphatic-pathways.pdf",
        fileSize: "2.4 MB"
      },
      {
        lessonId: lesson.id,
        title: "REGIMA Protocol Guide",
        type: "pdf",
        url: "/resources/regima-protocol.pdf",
        fileSize: "3.1 MB"
      },
      {
        lessonId: lesson.id,
        title: "Supplemental Technique Video",
        type: "video",
        url: "/resources/supplemental-video.mp4",
        fileSize: "8:34"
      },
      {
        lessonId: lesson.id,
        title: "Practical Assessment Checklist",
        type: "checklist",
        url: "/resources/assessment-checklist.pdf",
        fileSize: ""
      }
    ];
    
    for (const resourceData of resources) {
      await storage.createResource(resourceData);
    }
    
    // Create product
    const product = await storage.createProduct({
      name: "REGIMA Lymphatic Boost Oil",
      description: "This specialized facial oil contains a proprietary blend of arnica, cypress, and juniper berry essential oils that enhance lymphatic drainage results.",
      imageUrl: "https://pixabay.com/get/gf03accc58e9bdb900b9c3f194aad50caa954bcac808800638170bf59999f303a4334c2215d52728b795b39b52181fe94830ef697605b21864efaaeee2d50cc31_1280.jpg",
      ingredients: ["Arnica Montana Extract", "Cypress Essential Oil", "Juniper Berry Oil", "Marula Oil", "Grapeseed Oil"]
    });
    
    // Create quiz for the lesson
    const quiz = await storage.createQuiz({
      lessonId: lesson.id,
      questions: [
        {
          id: "q1",
          question: "Which of the following best describes the proper pressure for facial lymphatic drainage?",
          options: [
            { id: "q1_a", text: "Firm pressure to stimulate circulation" },
            { id: "q1_b", text: "Medium pressure with occasional deep movements" },
            { id: "q1_c", text: "Very light pressure that barely moves the skin" },
            { id: "q1_d", text: "Variable pressure depending on the facial area" }
          ],
          correctOptionId: "q1_c"
        },
        {
          id: "q2",
          question: "Which movement direction is correct for facial lymphatic drainage?",
          options: [
            { id: "q2_a", text: "From the center of the face outward toward lymph nodes" },
            { id: "q2_b", text: "From the outside of the face toward the nose" },
            { id: "q2_c", text: "In circular motions all over the face" },
            { id: "q2_d", text: "From top to bottom in straight lines" }
          ],
          correctOptionId: "q2_a"
        },
        {
          id: "q3",
          question: "Which of these is a contraindication for lymphatic drainage massage?",
          options: [
            { id: "q3_a", text: "Dehydrated skin" },
            { id: "q3_b", text: "Mature skin" },
            { id: "q3_c", text: "Active skin infection" },
            { id: "q3_d", text: "Uneven skin tone" }
          ],
          correctOptionId: "q3_c"
        }
      ]
    });
    
  } catch (error) {
    console.error("Error initializing data:", error);
  }
}
