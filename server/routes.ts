import type { Express } from "express";
import { createServer, type Server } from "http";
import { getIntegrationManager, createIntegrationRouter } from "./integrations";
import { storage } from "./storage";
import path from "path";
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

  // Image management API
  app.post("/api/images/download-ingredient-images", async (req, res) => {
    try {
      const { ImageManager } = await import('./utils/image-manager');
      const imageManager = ImageManager.getInstance();

      // Import the ingredients catalog
      const { ingredientsCatalog } = await import('./data/ingredients-catalog');

      // Download all ingredient images
      console.log('Starting bulk download of ingredient images...');
      const urlMap = await imageManager.downloadIngredientImages(ingredientsCatalog);

      const stats = imageManager.getStats();

      res.json({
        success: true,
        message: `Downloaded ${urlMap.size} ingredient images`,
        urlMap: Object.fromEntries(urlMap),
        stats
      });
    } catch (error) {
      console.error('Failed to download ingredient images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download images',
        details: error.message
      });
    }
  });

  app.get("/api/images/stats", async (req, res) => {
    try {
      const { ImageManager } = await import('./utils/image-manager');
      const imageManager = ImageManager.getInstance();
      const stats = imageManager.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get image stats' });
    }
  });

  // Ingredients API
  app.get("/api/ingredients", async (req, res) => {
    try {
      // Import the ingredients catalog
      const { ingredientsCatalog } = await import('./data/ingredients-catalog');
      const { ImageManager } = await import('./utils/image-manager');
      const imageManager = ImageManager.getInstance();

      // Map images to local URLs where available
      const ingredientsWithLocalImages = ingredientsCatalog.map(ingredient => {
        let imageUrl = ingredient.imageUrl;

        if (ingredient.imageUrl) {
          const asset = imageManager.findByOriginalUrl(ingredient.imageUrl);
          if (asset) {
            imageUrl = imageManager.getLocalUrl(asset.id) || ingredient.imageUrl;
          }
        }

        return {
          ...ingredient,
          imageUrl
        };
      });

      const ingredients = ingredientsWithLocalImages;

      // Create categories mapping
      const categoriesMap = ingredients.reduce((acc, ingredient) => {
        if (!acc[ingredient.category]) {
          acc[ingredient.category] = [];
        }
        acc[ingredient.category].push(ingredient);
        return acc;
      }, {} as Record<string, any[]>);

      // Extract unique categories
      const categories = Object.keys(categoriesMap);

      res.json({
        ingredients: ingredients,
        categories: categories
      });
    } catch (err) {
      console.error("Error fetching ingredients data:", err);
      res.status(500).json({ message: "Error fetching ingredients data" });
    }
  });

  // Get products data from our catalog
  app.get('/api/products', (_req, res) => {
    try {
      // Direct products array
      const products = [
        {
          id: 1,
          name: "REGIMA Cream Cleanser",
          category: "Cleansers",
          type: "retail",
          description: "Gentle cream cleanser that removes impurities while maintaining skin barrier integrity. Perfect for normal to dry skin types.",
          keyIngredients: [
            "Glycerin",
            "Aloe Vera",
            "Avocado Oil",
            "Vitamin E"
          ],
          skinTypes: ["Normal", "Dry", "Sensitive"],
          size: "200ml",
          usageInstructions: "Apply to damp skin, massage gently, and rinse thoroughly. Use morning and evening."
        },
        {
          id: 2,
          name: "REGIMA Purifying Gel Cleanser",
          category: "Cleansers",
          type: "retail",
          description: "Clarifying gel cleanser that removes excess oil and unclogs pores without stripping the skin.",
          keyIngredients: [
            "Salicylic Acid",
            "Tea Tree Oil",
            "Witch Hazel",
            "Aloe Vera"
          ],
          skinTypes: ["Combination", "Oily", "Acne-Prone"],
          size: "200ml",
          usageInstructions: "Apply to damp skin, massage gently for 30-60 seconds, and rinse thoroughly. Use morning and evening."
        },
        {
          id: 3,
          name: "REGIMA Micellar Cleansing Water",
          category: "Cleansers",
          type: "retail",
          description: "No-rinse micellar water that gently removes makeup, oil, and impurities while maintaining skin hydration.",
          keyIngredients: [
            "Micelles",
            "Cucumber Extract",
            "Chamomile Extract",
            "Vitamin B5"
          ],
          skinTypes: ["All Skin Types", "Sensitive"],
          size: "250ml",
          usageInstructions: "Apply to cotton pad and gently wipe over face, eyes, and neck. No rinsing required. Ideal for makeup removal or quick cleansing."
        },
        {
          id: 4,
          name: "REGIMA AHA/BHA Resurfacing Solution",
          category: "Exfoliants",
          type: "professional",
          description: "Professional-strength chemical exfoliant for clinic use. Contains a blend of AHAs and BHAs to deeply exfoliate and renew skin texture.",
          keyIngredients: [
            "Glycolic Acid (15%)",
            "Lactic Acid (5%)",
            "Salicylic Acid (2%)",
            "Niacinamide"
          ],
          skinTypes: ["All Skin Types", "Aging", "Acne-Prone", "Hyperpigmented"],
          size: "100ml",
          usageInstructions: "For professional use only. Apply evenly to clean, dry skin. Leave on for 1-5 minutes depending on skin type and sensitivity. Neutralize thoroughly."
        },
        {
          id: 5,
          name: "REGIMA Enzymatic Powder Exfoliant",
          category: "Exfoliants",
          type: "retail",
          description: "Water-activated powder exfoliant with fruit enzymes that dissolve dead skin cells and refine pores.",
          keyIngredients: [
            "Papain (Papaya Enzyme)",
            "Bromelain (Pineapple Enzyme)",
            "Rice Powder",
            "Colloidal Oatmeal"
          ],
          skinTypes: ["All Skin Types", "Sensitive"],
          size: "75g",
          usageInstructions: "Pour small amount into palm, add water to create paste. Massage gently onto damp skin for 30-60 seconds, then rinse. Use 2-3 times per week."
        },
        {
          id: 6,
          name: "REGIMA Overnight Resurfacing Peel",
          category: "Exfoliants",
          type: "retail",
          description: "Leave-on overnight peel that exfoliates and renews skin while you sleep for improved texture and radiance.",
          keyIngredients: [
            "Glycolic Acid (8%)",
            "Lactic Acid (5%)",
            "Hyaluronic Acid",
            "Peptide Complex"
          ],
          skinTypes: ["Normal", "Combination", "Oily", "Aging"],
          size: "50ml",
          usageInstructions: "Apply thin layer to clean, dry skin in the evening. Avoid eye area. Rinse thoroughly in the morning. Use 2-3 times per week."
        },
        {
          id: 7,
          name: "REGIMA Vitamin C + Ferulic Brightening Serum",
          category: "Serums",
          type: "retail",
          description: "Potent antioxidant serum that brightens skin tone, reduces dark spots, and protects against environmental damage.",
          keyIngredients: [
            "L-Ascorbic Acid (15%)",
            "Ferulic Acid",
            "Vitamin E",
            "Hyaluronic Acid"
          ],
          skinTypes: ["All Skin Types", "Hyperpigmented", "Dull"],
          size: "30ml",
          usageInstructions: "Apply 3-4 drops to clean face and neck in the morning before moisturizer and sunscreen. Store in cool, dark place."
        },
        {
          id: 8,
          name: "REGIMA Hyaluronic Acid Hydrating Serum",
          category: "Serums",
          type: "retail",
          description: "Multi-molecular weight hyaluronic acid serum that intensely hydrates all skin layers without greasiness.",
          keyIngredients: [
            "Multi-molecular Hyaluronic Acid",
            "Glycerin",
            "B5",
            "Snow Mushroom Extract"
          ],
          skinTypes: ["All Skin Types", "Dehydrated"],
          size: "30ml",
          usageInstructions: "Apply 3-4 drops to damp skin after cleansing. Follow with moisturizer. Can be used morning and evening."
        },
        {
          id: 9,
          name: "REGIMA Retinol Recovery Serum",
          category: "Serums",
          type: "retail",
          description: "Advanced retinol formula that reduces fine lines, refines texture, and improves clarity with minimal irritation.",
          keyIngredients: [
            "Encapsulated Retinol (0.5%)",
            "Granactive Retinoid",
            "Ceramide Complex",
            "Squalane"
          ],
          skinTypes: ["Normal", "Combination", "Aging", "Acne-Prone"],
          size: "30ml",
          usageInstructions: "Apply 1 pump to clean, dry face in the evening. Avoid eye area. Start with 2-3 nights per week, gradually increasing frequency. Always use SPF during the day."
        },
        {
          id: 10,
          name: "REGIMA Niacinamide + Zinc Clarifying Serum",
          category: "Serums",
          type: "retail",
          description: "Balancing serum that regulates oil production, minimizes pores, and reduces blemishes and redness.",
          keyIngredients: [
            "Niacinamide (10%)",
            "Zinc PCA",
            "Tea Tree Extract",
            "Licorice Root Extract"
          ],
          skinTypes: ["Combination", "Oily", "Acne-Prone", "Congested"],
          size: "30ml",
          usageInstructions: "Apply 3-4 drops to clean skin morning and evening before moisturizer. Can be used as a spot treatment on blemishes."
        },
        {
          id: 11,
          name: "REGIMA Hydra-Lock Moisturizer",
          category: "Moisturizers",
          type: "retail",
          description: "Lightweight yet deeply hydrating moisturizer that locks in moisture for up to 72 hours.",
          keyIngredients: [
            "Hyaluronic Acid",
            "Ceramides",
            "Squalane",
            "Glycerin"
          ],
          skinTypes: ["All Skin Types", "Dehydrated"],
          size: "50ml",
          usageInstructions: "Apply to clean face and neck morning and evening. Can be layered over serums for enhanced hydration."
        },
        {
          id: 12,
          name: "REGIMA Ultra-Rich Repair Cream",
          category: "Moisturizers",
          type: "retail",
          description: "Luxurious cream that deeply nourishes and repairs extremely dry or compromised skin barriers.",
          keyIngredients: [
            "Shea Butter",
            "Peptide Complex",
            "Ceramides",
            "Niacinamide"
          ],
          skinTypes: ["Dry", "Very Dry", "Sensitive", "Mature"],
          size: "50ml",
          usageInstructions: "Apply to clean face and neck morning and evening. For extra dry skin, apply a second layer to areas of dryness."
        }
      ];

      // Create category mapping
      const categoryMap = products.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
      }, {} as Record<string, any[]>);

      // Create type mapping
      const typeMap = products.reduce((acc, product) => {
        if (!acc[product.type]) {
          acc[product.type] = [];
        }
        acc[product.type].push(product);
        return acc;
      }, {} as Record<string, any[]>);

      // Extract unique categories and types
      const categories = Object.keys(categoryMap);
      const types = Object.keys(typeMap);

      res.json({
        products: products,
        categories: categories,
        types: types
      });
    } catch (err) {
      console.error("Error fetching products data:", err);
      res.status(500).json({ message: "Error fetching products data" });
    }
  });

  // Initialize and mount integration routes (LMS + Shopify)
  const integrationManager = getIntegrationManager();
  await integrationManager.initialize();
  app.use('/api', createIntegrationRouter(integrationManager));

  const httpServer = createServer(app);
  return httpServer;
}

// Initialize sample data for the application
async function initializeData() {
  try {
    // Create skincare training modules
    const modules = [
      {
        title: "Skin Anatomy & Physiology",
        description: "Essential knowledge of skin structure, functions, and the science behind REGIMA treatments",
        estimatedTime: "45 minutes",
        order: 1
      },
      {
        title: "Skin Types & Conditions",
        description: "Learn to identify different skin types, common conditions, and appropriate REGIMA solutions",
        estimatedTime: "60 minutes",
        order: 2
      },
      {
        title: "Professional Skincare Analysis",
        description: "Advanced techniques for skin assessment using REGIMA diagnostic protocols",
        estimatedTime: "60 minutes",
        order: 3
      },
      {
        title: "Skincare Ingredients & Formulations",
        description: "Comprehensive study of active ingredients, their functions, benefits, and application in REGIMA products",
        estimatedTime: "90 minutes",
        order: 4
      },
      {
        title: "Cleansing & Preparation Techniques",
        description: "Master the REGIMA cleansing protocols for optimal treatment preparation",
        estimatedTime: "45 minutes",
        order: 5
      },
      {
        title: "Exfoliation Methods",
        description: "Chemical, enzymatic, and mechanical exfoliation techniques using REGIMA professional products",
        estimatedTime: "60 minutes",
        order: 6
      },
      {
        title: "Extraction & Clarifying Procedures",
        description: "Safe and effective extraction techniques for congested skin conditions",
        estimatedTime: "45 minutes",
        order: 7
      },
      {
        title: "Facial Massage & Lymphatic Drainage",
        description: "REGIMA signature massage techniques for enhanced product penetration and detoxification",
        estimatedTime: "60 minutes",
        order: 8
      },
      {
        title: "Treatment Masking Protocols",
        description: "Application techniques and timing for REGIMA's professional treatment masks",
        estimatedTime: "45 minutes",
        order: 9
      },
      {
        title: "Advanced Anti-Aging Treatments",
        description: "Specialized REGIMA protocols for addressing fine lines, wrinkles, and loss of firmness",
        estimatedTime: "60 minutes",
        order: 10
      },
      {
        title: "Acne & Problematic Skin Solutions",
        description: "Targeted treatment protocols for managing acne, congestion, and oily skin conditions",
        estimatedTime: "60 minutes",
        order: 11
      },
      {
        title: "Hyperpigmentation & Brightening",
        description: "REGIMA approaches to treating hyperpigmentation, uneven skin tone, and sun damage",
        estimatedTime: "60 minutes",
        order: 12
      },
      {
        title: "Sensitive & Reactive Skin Management",
        description: "Gentle yet effective protocols for sensitive, reactive, and compromised skin barriers",
        estimatedTime: "45 minutes",
        order: 13
      },
      {
        title: "Client Consultation & Treatment Planning",
        description: "Professional consultation skills and creating customized REGIMA treatment plans",
        estimatedTime: "60 minutes",
        order: 14
      },
      {
        title: "Home Care Recommendations",
        description: "Guidelines for prescribing effective home care regimens with REGIMA retail products",
        estimatedTime: "45 minutes",
        order: 15
      },
      {
        title: "REGIMA Business Implementation",
        description: "Strategies for successfully integrating REGIMA treatments into your skincare business",
        estimatedTime: "60 minutes",
        order: 16
      }
    ];

    for (const moduleData of modules) {
      await storage.createModule(moduleData);
    }

    // Create lesson for module 8 (Facial Massage & Lymphatic Drainage)
    const lesson = await storage.createLesson({
      moduleId: 8,
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

    // Create product with detailed ingredient information
    const product = await storage.createProduct({
      name: "REGIMA Lymphatic Boost Oil",
      description: "This specialized facial oil contains a proprietary blend of arnica, cypress, and juniper berry essential oils that enhance lymphatic drainage results.",
      imageUrl: "https://pixabay.com/get/gf03accc58e9bdb900b9c3f194aad50caa954bcac808800638170bf59999f303a4334c2215d52728b795b39b52181fe94830ef697605b21864efaaeee2d50cc31_1280.jpg",
      ingredients: [
        "Arnica Montana Extract - Anti-inflammatory; reduces puffiness and swelling; improves circulation",
        "Cypress Essential Oil - Astringent; stimulates circulation; reduces fluid retention",
        "Juniper Berry Oil - Detoxifying; lymphatic stimulant; antiseptic properties",
        "Marula Oil - Rich in antioxidants; deeply moisturizing; enhances skin barrier",
        "Grapeseed Oil - Lightweight carrier; non-comedogenic; rich in linoleic acid"
      ]
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