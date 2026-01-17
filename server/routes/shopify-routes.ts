/**
 * Shopify Integration Routes
 * 
 * Express routes for Shopify e-commerce integration including
 * product management, order processing, and webhook handling.
 */

import { Router, Request, Response } from 'express';
import { getShopifyService } from '../services/shopify-service';
import { storage } from '../storage';

const router = Router();

// =============================================================================
// Product Management Routes
// =============================================================================

/**
 * POST /api/shopify/products
 * Create a Shopify product for a training module
 */
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { moduleId, price, imageUrl } = req.body;

    // Get module data
    const module = await storage.getModule(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const shopifyService = getShopifyService();
    const product = await shopifyService.createCourseProduct(
      module.id,
      module.title,
      module.description,
      price,
      imageUrl
    );

    res.json({
      success: true,
      product,
      message: `Shopify product created for module: ${module.title}`,
    });
  } catch (error) {
    console.error('Create Shopify product error:', error);
    res.status(500).json({ error: 'Failed to create Shopify product' });
  }
});

/**
 * PUT /api/shopify/products/:productId
 * Update a Shopify product
 */
router.put('/products/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { title, description, price } = req.body;

    const shopifyService = getShopifyService();
    const product = await shopifyService.updateCourseProduct(productId, {
      title,
      description,
      price,
    });

    res.json({
      success: true,
      product,
      message: 'Shopify product updated',
    });
  } catch (error) {
    console.error('Update Shopify product error:', error);
    res.status(500).json({ error: 'Failed to update Shopify product' });
  }
});

/**
 * GET /api/shopify/products
 * Get all course products from Shopify
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const shopifyService = getShopifyService();
    const products = await shopifyService.getCourseProducts();

    res.json({ products });
  } catch (error) {
    console.error('Get Shopify products error:', error);
    res.status(500).json({ error: 'Failed to get Shopify products' });
  }
});

/**
 * GET /api/shopify/products/:productId
 * Get a specific Shopify product
 */
router.get('/products/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const shopifyService = getShopifyService();
    const product = await shopifyService.getProduct(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get Shopify product error:', error);
    res.status(500).json({ error: 'Failed to get Shopify product' });
  }
});

// =============================================================================
// Product-Course Mapping Routes
// =============================================================================

/**
 * POST /api/shopify/mappings
 * Create a mapping between Shopify product and training module
 */
router.post('/mappings', async (req: Request, res: Response) => {
  try {
    const { shopifyProductId, moduleId, shopifyVariantId, accessDuration } = req.body;

    // Validate module exists
    const module = await storage.getModule(moduleId);
    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const shopifyService = getShopifyService();
    const mapping = shopifyService.createProductMapping(
      shopifyProductId,
      moduleId,
      shopifyVariantId,
      accessDuration
    );

    res.json({
      success: true,
      mapping,
      message: `Mapping created: Product ${shopifyProductId} → Module ${moduleId}`,
    });
  } catch (error) {
    console.error('Create mapping error:', error);
    res.status(500).json({ error: 'Failed to create product mapping' });
  }
});

/**
 * GET /api/shopify/mappings
 * Get all product-course mappings
 */
router.get('/mappings', async (req: Request, res: Response) => {
  try {
    const shopifyService = getShopifyService();
    const mappings = shopifyService.getAllProductMappings();

    // Enrich with module data
    const enrichedMappings = await Promise.all(
      mappings.map(async (mapping) => {
        const module = await storage.getModule(mapping.moduleId);
        return {
          ...mapping,
          module: module ? {
            id: module.id,
            title: module.title,
            description: module.description,
          } : null,
        };
      })
    );

    res.json({ mappings: enrichedMappings });
  } catch (error) {
    console.error('Get mappings error:', error);
    res.status(500).json({ error: 'Failed to get product mappings' });
  }
});

/**
 * DELETE /api/shopify/mappings/:productId
 * Delete a product-course mapping
 */
router.delete('/mappings/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const shopifyService = getShopifyService();
    const deleted = shopifyService.deleteProductMapping(productId);

    if (!deleted) {
      return res.status(404).json({ error: 'Mapping not found' });
    }

    res.json({ success: true, message: 'Mapping deleted' });
  } catch (error) {
    console.error('Delete mapping error:', error);
    res.status(500).json({ error: 'Failed to delete product mapping' });
  }
});

// =============================================================================
// Enrollment Routes
// =============================================================================

/**
 * GET /api/shopify/enrollments
 * Get current user's enrollments
 */
router.get('/enrollments', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const shopifyService = getShopifyService();
    const enrollments = shopifyService.getUserEnrollments(req.session.userId);

    // Enrich with module data
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const module = await storage.getModule(enrollment.moduleId);
        return {
          ...enrollment,
          module: module ? {
            id: module.id,
            title: module.title,
            description: module.description,
          } : null,
        };
      })
    );

    res.json({ enrollments: enrichedEnrollments });
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to get enrollments' });
  }
});

/**
 * GET /api/shopify/access/:moduleId
 * Check if user has access to a specific module
 */
router.get('/access/:moduleId', async (req: Request, res: Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const moduleId = parseInt(req.params.moduleId);
    const shopifyService = getShopifyService();
    const hasAccess = shopifyService.hasModuleAccess(req.session.userId, moduleId);

    res.json({ moduleId, hasAccess });
  } catch (error) {
    console.error('Check access error:', error);
    res.status(500).json({ error: 'Failed to check module access' });
  }
});

// =============================================================================
// Customer Routes
// =============================================================================

/**
 * GET /api/shopify/customers/:customerId
 * Get Shopify customer by ID
 */
router.get('/customers/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const shopifyService = getShopifyService();
    const customer = await shopifyService.getCustomer(customerId);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to get customer' });
  }
});

/**
 * GET /api/shopify/customers/email/:email
 * Get Shopify customer by email
 */
router.get('/customers/email/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const shopifyService = getShopifyService();
    const customer = await shopifyService.getCustomerByEmail(email);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    console.error('Get customer by email error:', error);
    res.status(500).json({ error: 'Failed to get customer' });
  }
});

// =============================================================================
// Order Routes
// =============================================================================

/**
 * GET /api/shopify/orders/:orderId
 * Get Shopify order by ID
 */
router.get('/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const shopifyService = getShopifyService();
    const order = await shopifyService.getOrder(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

/**
 * POST /api/shopify/orders/:orderId/process
 * Manually process an order for enrollment
 */
router.post('/orders/:orderId/process', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const shopifyService = getShopifyService();
    const order = await shopifyService.getOrder(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const enrollments = await shopifyService.processOrderForEnrollment(order, userId);

    res.json({
      success: true,
      enrollments,
      message: `Processed ${enrollments.length} enrollment(s) from order ${order.name}`,
    });
  } catch (error) {
    console.error('Process order error:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// =============================================================================
// Webhook Routes
// =============================================================================

/**
 * POST /api/shopify/webhook
 * Handle incoming Shopify webhooks
 */
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const shopifyService = getShopifyService();
    
    // Get webhook topic from header
    const topic = req.headers['x-shopify-topic'] as string;
    const hmac = req.headers['x-shopify-hmac-sha256'] as string;
    
    if (!topic) {
      return res.status(400).json({ error: 'Missing webhook topic' });
    }

    // Verify webhook signature (in production)
    // Note: Body needs to be raw for signature verification
    // This would require raw body middleware in production
    
    // Process webhook
    const result = await shopifyService.handleWebhook(
      topic,
      req.body,
      async (enrollment, order) => {
        // Callback for enrollment processing
        console.log(`Enrollment created for order ${order.name}:`, enrollment);
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

/**
 * POST /api/shopify/webhooks/register
 * Register webhooks with Shopify
 */
router.post('/webhooks/register', async (req: Request, res: Response) => {
  try {
    const { callbackUrl } = req.body;

    if (!callbackUrl) {
      return res.status(400).json({ error: 'callbackUrl is required' });
    }

    const shopifyService = getShopifyService();
    await shopifyService.registerWebhooks(callbackUrl);

    res.json({ success: true, message: 'Webhooks registered' });
  } catch (error) {
    console.error('Register webhooks error:', error);
    res.status(500).json({ error: 'Failed to register webhooks' });
  }
});

/**
 * GET /api/shopify/webhooks
 * List registered webhooks
 */
router.get('/webhooks', async (req: Request, res: Response) => {
  try {
    const shopifyService = getShopifyService();
    const webhooks = await shopifyService.listWebhooks();

    res.json({ webhooks });
  } catch (error) {
    console.error('List webhooks error:', error);
    res.status(500).json({ error: 'Failed to list webhooks' });
  }
});

// =============================================================================
// Sync Routes
// =============================================================================

/**
 * POST /api/shopify/sync/modules
 * Sync all modules to Shopify as products
 */
router.post('/sync/modules', async (req: Request, res: Response) => {
  try {
    const { defaultPrice = '99.00' } = req.body;
    const modules = await storage.getAllModules();
    const shopifyService = getShopifyService();
    
    const results = [];
    
    for (const module of modules) {
      try {
        // Check if mapping already exists
        const existingMappings = shopifyService.getAllProductMappings();
        const existingMapping = existingMappings.find(m => m.moduleId === module.id);
        
        if (existingMapping) {
          results.push({
            moduleId: module.id,
            title: module.title,
            status: 'skipped',
            message: 'Already mapped to Shopify product',
          });
          continue;
        }

        // Create Shopify product
        const product = await shopifyService.createCourseProduct(
          module.id,
          module.title,
          module.description,
          defaultPrice
        );

        results.push({
          moduleId: module.id,
          title: module.title,
          status: 'created',
          shopifyProductId: product.id,
        });
      } catch (error) {
        results.push({
          moduleId: module.id,
          title: module.title,
          status: 'error',
          error: String(error),
        });
      }
    }

    res.json({
      success: true,
      results,
      summary: {
        total: modules.length,
        created: results.filter(r => r.status === 'created').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length,
      },
    });
  } catch (error) {
    console.error('Sync modules error:', error);
    res.status(500).json({ error: 'Failed to sync modules to Shopify' });
  }
});

// =============================================================================
// Status Route
// =============================================================================

/**
 * GET /api/shopify/status
 * Get Shopify integration status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const shopifyService = getShopifyService();
    const mappings = shopifyService.getAllProductMappings();
    
    let productsCount = 0;
    let webhooksCount = 0;
    
    try {
      const products = await shopifyService.getCourseProducts();
      productsCount = products.length;
    } catch (e) {
      // API might not be configured
    }
    
    try {
      const webhooks = await shopifyService.listWebhooks();
      webhooksCount = webhooks.length;
    } catch (e) {
      // API might not be configured
    }

    res.json({
      configured: !!process.env.SHOPIFY_ACCESS_TOKEN,
      shopDomain: process.env.SHOPIFY_SHOP_DOMAIN || 'Not configured',
      productMappings: mappings.length,
      shopifyProducts: productsCount,
      registeredWebhooks: webhooksCount,
    });
  } catch (error) {
    console.error('Shopify status error:', error);
    res.status(500).json({ error: 'Failed to get Shopify status' });
  }
});

export default router;
