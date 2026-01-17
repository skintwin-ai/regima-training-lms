/**
 * Unified Integration Module
 * 
 * Central configuration and initialization for all LMS and Shopify integrations.
 * This module provides a single entry point for managing integrations across
 * the RegimA Training System.
 */

import { Router } from 'express';
import { getXAPIService } from '../services/xapi-service';
import { getSCORMService } from '../services/scorm-service';
import { getLTIService } from '../services/lti-service';
import { getShopifyService } from '../services/shopify-service';
import lmsRoutes from '../routes/lms-routes';
import shopifyRoutes from '../routes/shopify-routes';

// =============================================================================
// Integration Configuration
// =============================================================================

export interface IntegrationConfig {
  // xAPI Configuration
  xapi: {
    enabled: boolean;
    endpoint: string;
    auth: {
      type: 'basic' | 'oauth';
      username?: string;
      password?: string;
      token?: string;
    };
    activityIdBase: string;
  };

  // SCORM Configuration
  scorm: {
    enabled: boolean;
    version: '1.2' | '2004';
    outputDir: string;
  };

  // LTI Configuration
  lti: {
    enabled: boolean;
    targetLinkUri: string;
    oidcInitiationUrl: string;
    jwksUri: string;
  };

  // Shopify Configuration
  shopify: {
    enabled: boolean;
    shopDomain: string;
    accessToken: string;
    apiVersion: string;
    webhookSecret: string;
  };
}

// Default configuration from environment variables
export const defaultConfig: IntegrationConfig = {
  xapi: {
    enabled: process.env.XAPI_ENABLED === 'true',
    endpoint: process.env.XAPI_ENDPOINT || 'http://localhost:8080/xapi',
    auth: {
      type: (process.env.XAPI_AUTH_TYPE as 'basic' | 'oauth') || 'basic',
      username: process.env.XAPI_USERNAME,
      password: process.env.XAPI_PASSWORD,
      token: process.env.XAPI_TOKEN,
    },
    activityIdBase: process.env.XAPI_ACTIVITY_BASE || 'https://regima.training/activities',
  },
  scorm: {
    enabled: true, // SCORM is always available for export
    version: (process.env.SCORM_VERSION as '1.2' | '2004') || '2004',
    outputDir: process.env.SCORM_OUTPUT_DIR || '/tmp/scorm-packages',
  },
  lti: {
    enabled: process.env.LTI_ENABLED === 'true',
    targetLinkUri: process.env.LTI_TARGET_LINK_URI || 'http://localhost:5000/lti/launch',
    oidcInitiationUrl: process.env.LTI_OIDC_URL || 'http://localhost:5000/lti/oidc',
    jwksUri: process.env.LTI_JWKS_URI || 'http://localhost:5000/lti/jwks',
  },
  shopify: {
    enabled: !!process.env.SHOPIFY_ACCESS_TOKEN,
    shopDomain: process.env.SHOPIFY_SHOP_DOMAIN || '',
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '',
    apiVersion: process.env.SHOPIFY_API_VERSION || '2024-01',
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET || '',
  },
};

// =============================================================================
// Integration Manager
// =============================================================================

export class IntegrationManager {
  private config: IntegrationConfig;
  private initialized: boolean = false;

  constructor(config: Partial<IntegrationConfig> = {}) {
    this.config = this.mergeConfig(defaultConfig, config);
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfig(
    defaultCfg: IntegrationConfig,
    customCfg: Partial<IntegrationConfig>
  ): IntegrationConfig {
    return {
      xapi: { ...defaultCfg.xapi, ...customCfg.xapi },
      scorm: { ...defaultCfg.scorm, ...customCfg.scorm },
      lti: { ...defaultCfg.lti, ...customCfg.lti },
      shopify: { ...defaultCfg.shopify, ...customCfg.shopify },
    };
  }

  /**
   * Initialize all enabled integrations
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Integrations already initialized');
      return;
    }

    console.log('Initializing integrations...');

    // Initialize xAPI service
    if (this.config.xapi.enabled) {
      getXAPIService({
        endpoint: this.config.xapi.endpoint,
        auth: this.config.xapi.auth,
        activityIdBase: this.config.xapi.activityIdBase,
      });
      console.log('✓ xAPI service initialized');
    }

    // Initialize SCORM service
    if (this.config.scorm.enabled) {
      getSCORMService(this.config.scorm.version, this.config.scorm.outputDir);
      console.log(`✓ SCORM service initialized (version ${this.config.scorm.version})`);
    }

    // Initialize LTI service
    if (this.config.lti.enabled) {
      getLTIService({
        targetLinkUri: this.config.lti.targetLinkUri,
        oidcInitiationUrl: this.config.lti.oidcInitiationUrl,
        jwksUri: this.config.lti.jwksUri,
      });
      console.log('✓ LTI service initialized');
    }

    // Initialize Shopify service
    if (this.config.shopify.enabled) {
      getShopifyService({
        shopDomain: this.config.shopify.shopDomain,
        accessToken: this.config.shopify.accessToken,
        apiVersion: this.config.shopify.apiVersion,
        webhookSecret: this.config.shopify.webhookSecret,
      });
      console.log('✓ Shopify service initialized');
    }

    this.initialized = true;
    console.log('All integrations initialized');
  }

  /**
   * Get integration status
   */
  getStatus(): Record<string, { enabled: boolean; configured: boolean }> {
    return {
      xapi: {
        enabled: this.config.xapi.enabled,
        configured: !!this.config.xapi.endpoint,
      },
      scorm: {
        enabled: this.config.scorm.enabled,
        configured: true,
      },
      lti: {
        enabled: this.config.lti.enabled,
        configured: !!this.config.lti.targetLinkUri,
      },
      shopify: {
        enabled: this.config.shopify.enabled,
        configured: !!this.config.shopify.accessToken,
      },
    };
  }

  /**
   * Get configuration (sanitized, no secrets)
   */
  getSanitizedConfig(): Partial<IntegrationConfig> {
    return {
      xapi: {
        ...this.config.xapi,
        auth: {
          type: this.config.xapi.auth.type,
          username: this.config.xapi.auth.username ? '***' : undefined,
          password: this.config.xapi.auth.password ? '***' : undefined,
          token: this.config.xapi.auth.token ? '***' : undefined,
        },
      },
      scorm: this.config.scorm,
      lti: this.config.lti,
      shopify: {
        ...this.config.shopify,
        accessToken: this.config.shopify.accessToken ? '***' : '',
        webhookSecret: this.config.shopify.webhookSecret ? '***' : '',
      },
    };
  }
}

// =============================================================================
// Express Router Setup
// =============================================================================

/**
 * Create and configure the integration router
 */
export function createIntegrationRouter(manager?: IntegrationManager): Router {
  const router = Router();
  const integrationManager = manager || new IntegrationManager();

  // Mount LMS routes
  router.use('/lms', lmsRoutes);

  // Mount Shopify routes
  router.use('/shopify', shopifyRoutes);

  // Integration status endpoint
  router.get('/status', (req, res) => {
    res.json({
      status: integrationManager.getStatus(),
      config: integrationManager.getSanitizedConfig(),
    });
  });

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      healthy: true,
      timestamp: new Date().toISOString(),
      integrations: integrationManager.getStatus(),
    });
  });

  return router;
}

// =============================================================================
// Singleton Instance
// =============================================================================

let integrationManagerInstance: IntegrationManager | null = null;

export function getIntegrationManager(config?: Partial<IntegrationConfig>): IntegrationManager {
  if (!integrationManagerInstance) {
    integrationManagerInstance = new IntegrationManager(config);
  }
  return integrationManagerInstance;
}

export default {
  IntegrationManager,
  createIntegrationRouter,
  getIntegrationManager,
  defaultConfig,
};
