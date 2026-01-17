/**
 * Shopify Integration Service
 * 
 * Handles integration with Shopify for selling courses, managing enrollments,
 * and syncing customer data with the RegimA Training System.
 * 
 * Note: RegimA Zone UK owns and pays for the Shopify platforms used by
 * RegimA Worldwide Distribution and related entities.
 */

import crypto from 'crypto';
import type {
  ShopifyProduct,
  ShopifyCustomer,
  ShopifyOrder,
  ShopifyLineItem,
  ShopifyMetafield,
  ShopifyWebhookPayload,
  CourseProductMapping,
  ShopifyEnrollment,
} from '@shared/lms-types';

// Shopify API Configuration
interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion: string;
  webhookSecret: string;
}

// Default configuration from environment
const DEFAULT_CONFIG: ShopifyConfig = {
  shopDomain: process.env.SHOPIFY_SHOP_DOMAIN || 'regima-training.myshopify.com',
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
  apiVersion: process.env.SHOPIFY_API_VERSION || '2024-01',
  webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || '',
};

// Metafield namespaces for course data
const METAFIELD_NAMESPACE = 'regima_training';

export class ShopifyService {
  private config: ShopifyConfig;
  private baseUrl: string;

  // In-memory storage for mappings (would be database in production)
  private productMappings: Map<string, CourseProductMapping> = new Map();
  private enrollments: Map<number, ShopifyEnrollment[]> = new Map();

  constructor(config: Partial<ShopifyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baseUrl = `https://${this.config.shopDomain}/admin/api/${this.config.apiVersion}`;
  }

  /**
   * Make authenticated request to Shopify Admin API
   */
  private async shopifyRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.config.accessToken,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Make GraphQL request to Shopify Admin API
   */
  private async shopifyGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}/graphql.json`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.config.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shopify GraphQL error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    if (result.errors) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  }

  // ==========================================================================
  // Product Management
  // ==========================================================================

  /**
   * Create a Shopify product for a training module
   */
  async createCourseProduct(
    moduleId: number,
    title: string,
    description: string,
    price: string,
    imageUrl?: string
  ): Promise<ShopifyProduct> {
    const productData = {
      product: {
        title: `Training: ${title}`,
        body_html: description,
        vendor: 'RegimA Training',
        product_type: 'Digital Course',
        tags: ['training', 'course', 'digital', `module-${moduleId}`],
        variants: [{
          price,
          sku: `REGIMA-COURSE-${moduleId}`,
          inventory_management: null, // Digital product, no inventory
          requires_shipping: false,
        }],
        images: imageUrl ? [{ src: imageUrl }] : [],
        metafields: [
          {
            namespace: METAFIELD_NAMESPACE,
            key: 'module_id',
            value: moduleId.toString(),
            type: 'number_integer',
          },
          {
            namespace: METAFIELD_NAMESPACE,
            key: 'product_type',
            value: 'course',
            type: 'single_line_text_field',
          },
        ],
      },
    };

    const result = await this.shopifyRequest<{ product: any }>('/products.json', 'POST', productData);
    
    // Store mapping
    this.productMappings.set(result.product.id.toString(), {
      id: Date.now(),
      moduleId,
      shopifyProductId: result.product.id.toString(),
      shopifyVariantId: result.product.variants[0].id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.transformProduct(result.product);
  }

  /**
   * Update a Shopify product
   */
  async updateCourseProduct(
    productId: string,
    updates: Partial<{
      title: string;
      description: string;
      price: string;
    }>
  ): Promise<ShopifyProduct> {
    const productData: any = { product: { id: productId } };
    
    if (updates.title) productData.product.title = `Training: ${updates.title}`;
    if (updates.description) productData.product.body_html = updates.description;
    if (updates.price) productData.product.variants = [{ price: updates.price }];

    const result = await this.shopifyRequest<{ product: any }>(
      `/products/${productId}.json`,
      'PUT',
      productData
    );

    return this.transformProduct(result.product);
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<ShopifyProduct | null> {
    try {
      const result = await this.shopifyRequest<{ product: any }>(`/products/${productId}.json`);
      return this.transformProduct(result.product);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all course products
   */
  async getCourseProducts(): Promise<ShopifyProduct[]> {
    const result = await this.shopifyRequest<{ products: any[] }>(
      '/products.json?product_type=Digital%20Course'
    );
    return result.products.map(p => this.transformProduct(p));
  }

  /**
   * Transform Shopify product response to our type
   */
  private transformProduct(product: any): ShopifyProduct {
    return {
      id: product.id.toString(),
      title: product.title,
      handle: product.handle,
      description: product.body_html || '',
      productType: product.product_type,
      vendor: product.vendor,
      tags: product.tags ? product.tags.split(', ') : [],
      variants: product.variants.map((v: any) => ({
        id: v.id.toString(),
        title: v.title,
        price: v.price,
        sku: v.sku,
        inventoryQuantity: v.inventory_quantity || 0,
      })),
      metafields: [],
    };
  }

  // ==========================================================================
  // Customer Management
  // ==========================================================================

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<ShopifyCustomer | null> {
    try {
      const result = await this.shopifyRequest<{ customer: any }>(`/customers/${customerId}.json`);
      return this.transformCustomer(result.customer);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get customer by email
   */
  async getCustomerByEmail(email: string): Promise<ShopifyCustomer | null> {
    try {
      const result = await this.shopifyRequest<{ customers: any[] }>(
        `/customers/search.json?query=email:${encodeURIComponent(email)}`
      );
      if (result.customers.length === 0) return null;
      return this.transformCustomer(result.customers[0]);
    } catch (error) {
      return null;
    }
  }

  /**
   * Add tags to customer
   */
  async addCustomerTags(customerId: string, tags: string[]): Promise<ShopifyCustomer> {
    const customer = await this.getCustomer(customerId);
    if (!customer) throw new Error('Customer not found');

    const existingTags = customer.tags;
    const newTags = [...new Set([...existingTags, ...tags])];

    const result = await this.shopifyRequest<{ customer: any }>(
      `/customers/${customerId}.json`,
      'PUT',
      { customer: { id: customerId, tags: newTags.join(', ') } }
    );

    return this.transformCustomer(result.customer);
  }

  /**
   * Transform Shopify customer response
   */
  private transformCustomer(customer: any): ShopifyCustomer {
    return {
      id: customer.id.toString(),
      email: customer.email,
      firstName: customer.first_name || '',
      lastName: customer.last_name || '',
      tags: customer.tags ? customer.tags.split(', ') : [],
      metafields: [],
    };
  }

  // ==========================================================================
  // Order & Enrollment Management
  // ==========================================================================

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<ShopifyOrder | null> {
    try {
      const result = await this.shopifyRequest<{ order: any }>(`/orders/${orderId}.json`);
      return this.transformOrder(result.order);
    } catch (error) {
      return null;
    }
  }

  /**
   * Transform Shopify order response
   */
  private transformOrder(order: any): ShopifyOrder {
    return {
      id: order.id.toString(),
      name: order.name,
      email: order.email,
      customer: order.customer ? this.transformCustomer(order.customer) : {
        id: '',
        email: order.email,
        firstName: '',
        lastName: '',
        tags: [],
        metafields: [],
      },
      lineItems: order.line_items.map((item: any) => ({
        id: item.id.toString(),
        productId: item.product_id?.toString() || '',
        variantId: item.variant_id?.toString() || '',
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
      fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
      financialStatus: order.financial_status,
      createdAt: order.created_at,
    };
  }

  /**
   * Process order for course enrollment
   */
  async processOrderForEnrollment(
    order: ShopifyOrder,
    userId: number
  ): Promise<ShopifyEnrollment[]> {
    const enrollments: ShopifyEnrollment[] = [];

    for (const item of order.lineItems) {
      // Check if this product is mapped to a course
      const mapping = this.productMappings.get(item.productId);
      if (!mapping) continue;

      // Create enrollment
      const enrollment: ShopifyEnrollment = {
        id: Date.now() + Math.random(),
        userId,
        orderId: order.id,
        productId: item.productId,
        moduleId: mapping.moduleId,
        enrolledAt: new Date(),
        expiresAt: mapping.accessDuration
          ? new Date(Date.now() + mapping.accessDuration * 24 * 60 * 60 * 1000)
          : undefined,
        status: 'active',
      };

      enrollments.push(enrollment);

      // Store enrollment
      const userEnrollments = this.enrollments.get(userId) || [];
      userEnrollments.push(enrollment);
      this.enrollments.set(userId, userEnrollments);
    }

    return enrollments;
  }

  /**
   * Get user enrollments
   */
  getUserEnrollments(userId: number): ShopifyEnrollment[] {
    return this.enrollments.get(userId) || [];
  }

  /**
   * Check if user has access to a module
   */
  hasModuleAccess(userId: number, moduleId: number): boolean {
    const enrollments = this.getUserEnrollments(userId);
    return enrollments.some(e => 
      e.moduleId === moduleId && 
      e.status === 'active' &&
      (!e.expiresAt || e.expiresAt > new Date())
    );
  }

  // ==========================================================================
  // Webhook Handling
  // ==========================================================================

  /**
   * Verify Shopify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(body, 'utf8')
      .digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(signature)
    );
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(
    topic: string,
    payload: unknown,
    onEnrollment?: (enrollment: ShopifyEnrollment, order: ShopifyOrder) => Promise<void>
  ): Promise<{ success: boolean; message: string }> {
    console.log(`Processing Shopify webhook: ${topic}`);

    switch (topic) {
      case 'orders/paid':
        return this.handleOrderPaid(payload as any, onEnrollment);
      
      case 'orders/cancelled':
        return this.handleOrderCancelled(payload as any);
      
      case 'customers/create':
        return this.handleCustomerCreate(payload as any);
      
      case 'customers/update':
        return this.handleCustomerUpdate(payload as any);
      
      case 'products/update':
        return this.handleProductUpdate(payload as any);
      
      default:
        return { success: true, message: `Webhook ${topic} acknowledged but not processed` };
    }
  }

  /**
   * Handle order paid webhook
   */
  private async handleOrderPaid(
    orderData: any,
    onEnrollment?: (enrollment: ShopifyEnrollment, order: ShopifyOrder) => Promise<void>
  ): Promise<{ success: boolean; message: string }> {
    const order = this.transformOrder(orderData);
    
    // Check if order contains course products
    const courseItems = order.lineItems.filter(item => 
      this.productMappings.has(item.productId)
    );

    if (courseItems.length === 0) {
      return { success: true, message: 'No course products in order' };
    }

    // Note: In production, you would look up or create the user based on customer email
    // For now, we'll return a message indicating enrollment should be processed
    return {
      success: true,
      message: `Order ${order.name} contains ${courseItems.length} course(s). Enrollment pending user lookup.`,
    };
  }

  /**
   * Handle order cancelled webhook
   */
  private async handleOrderCancelled(orderData: any): Promise<{ success: boolean; message: string }> {
    const orderId = orderData.id.toString();
    
    // Find and cancel enrollments for this order
    for (const [userId, enrollments] of this.enrollments) {
      for (const enrollment of enrollments) {
        if (enrollment.orderId === orderId) {
          enrollment.status = 'cancelled';
        }
      }
    }

    return { success: true, message: `Enrollments for order ${orderId} cancelled` };
  }

  /**
   * Handle customer create webhook
   */
  private async handleCustomerCreate(customerData: any): Promise<{ success: boolean; message: string }> {
    const customer = this.transformCustomer(customerData);
    console.log(`New Shopify customer: ${customer.email}`);
    return { success: true, message: `Customer ${customer.email} registered` };
  }

  /**
   * Handle customer update webhook
   */
  private async handleCustomerUpdate(customerData: any): Promise<{ success: boolean; message: string }> {
    const customer = this.transformCustomer(customerData);
    console.log(`Shopify customer updated: ${customer.email}`);
    return { success: true, message: `Customer ${customer.email} updated` };
  }

  /**
   * Handle product update webhook
   */
  private async handleProductUpdate(productData: any): Promise<{ success: boolean; message: string }> {
    const product = this.transformProduct(productData);
    console.log(`Shopify product updated: ${product.title}`);
    return { success: true, message: `Product ${product.title} updated` };
  }

  // ==========================================================================
  // Product-Course Mapping
  // ==========================================================================

  /**
   * Create mapping between Shopify product and training module
   */
  createProductMapping(
    shopifyProductId: string,
    moduleId: number,
    shopifyVariantId?: string,
    accessDuration?: number
  ): CourseProductMapping {
    const mapping: CourseProductMapping = {
      id: Date.now(),
      moduleId,
      shopifyProductId,
      shopifyVariantId,
      accessDuration,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.productMappings.set(shopifyProductId, mapping);
    return mapping;
  }

  /**
   * Get product mapping
   */
  getProductMapping(shopifyProductId: string): CourseProductMapping | undefined {
    return this.productMappings.get(shopifyProductId);
  }

  /**
   * Get all product mappings
   */
  getAllProductMappings(): CourseProductMapping[] {
    return Array.from(this.productMappings.values());
  }

  /**
   * Delete product mapping
   */
  deleteProductMapping(shopifyProductId: string): boolean {
    return this.productMappings.delete(shopifyProductId);
  }

  // ==========================================================================
  // Webhook Registration
  // ==========================================================================

  /**
   * Register webhooks with Shopify
   */
  async registerWebhooks(callbackUrl: string): Promise<void> {
    const topics = [
      'orders/paid',
      'orders/cancelled',
      'customers/create',
      'customers/update',
      'products/update',
    ];

    for (const topic of topics) {
      try {
        await this.shopifyRequest('/webhooks.json', 'POST', {
          webhook: {
            topic,
            address: `${callbackUrl}/api/shopify/webhook`,
            format: 'json',
          },
        });
        console.log(`Webhook registered: ${topic}`);
      } catch (error) {
        console.error(`Failed to register webhook ${topic}:`, error);
      }
    }
  }

  /**
   * List registered webhooks
   */
  async listWebhooks(): Promise<any[]> {
    const result = await this.shopifyRequest<{ webhooks: any[] }>('/webhooks.json');
    return result.webhooks;
  }
}

// Singleton instance
let shopifyServiceInstance: ShopifyService | null = null;

export function getShopifyService(config?: Partial<ShopifyConfig>): ShopifyService {
  if (!shopifyServiceInstance) {
    shopifyServiceInstance = new ShopifyService(config);
  }
  return shopifyServiceInstance;
}

export default ShopifyService;
