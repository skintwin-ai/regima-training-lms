/**
 * Shopify Integration Hook
 * 
 * React hook for interacting with Shopify e-commerce features
 * including product management, enrollments, and access control.
 */

import { useState, useCallback, useEffect } from 'react';

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  variants: Array<{
    id: string;
    title: string;
    price: string;
    sku: string;
  }>;
}

interface ProductMapping {
  id: number;
  moduleId: number;
  shopifyProductId: string;
  shopifyVariantId?: string;
  accessDuration?: number;
  module?: {
    id: number;
    title: string;
    description: string;
  };
}

interface Enrollment {
  id: number;
  userId: number;
  orderId: string;
  productId: string;
  moduleId: number;
  enrolledAt: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'cancelled';
  module?: {
    id: number;
    title: string;
    description: string;
  };
}

interface ShopifyStatus {
  configured: boolean;
  shopDomain: string;
  productMappings: number;
  shopifyProducts: number;
  registeredWebhooks: number;
}

export function useShopify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [status, setStatus] = useState<ShopifyStatus | null>(null);

  /**
   * Get Shopify integration status
   */
  const getStatus = useCallback(async (): Promise<ShopifyStatus | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/status');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get Shopify status');
      }
      
      setStatus(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get all course products from Shopify
   */
  const getProducts = useCallback(async (): Promise<ShopifyProduct[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/products');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get products');
      }
      
      return result.products;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a Shopify product for a training module
   */
  const createProduct = useCallback(async (
    moduleId: number,
    price: string,
    imageUrl?: string
  ): Promise<ShopifyProduct | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, price, imageUrl }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product');
      }
      
      return result.product;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get all product-course mappings
   */
  const getMappings = useCallback(async (): Promise<ProductMapping[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/mappings');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get mappings');
      }
      
      return result.mappings;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a product-course mapping
   */
  const createMapping = useCallback(async (
    shopifyProductId: string,
    moduleId: number,
    shopifyVariantId?: string,
    accessDuration?: number
  ): Promise<ProductMapping | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopifyProductId, moduleId, shopifyVariantId, accessDuration }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create mapping');
      }
      
      return result.mapping;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a product-course mapping
   */
  const deleteMapping = useCallback(async (productId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/shopify/mappings/${productId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete mapping');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get current user's enrollments
   */
  const getEnrollments = useCallback(async (): Promise<Enrollment[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/enrollments');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get enrollments');
      }
      
      setEnrollments(result.enrollments);
      return result.enrollments;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if user has access to a specific module
   */
  const checkModuleAccess = useCallback(async (moduleId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/shopify/access/${moduleId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to check access');
      }
      
      return result.hasAccess;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sync all modules to Shopify
   */
  const syncModules = useCallback(async (defaultPrice: string = '99.00'): Promise<{
    total: number;
    created: number;
    skipped: number;
    errors: number;
  } | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/sync/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultPrice }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync modules');
      }
      
      return result.summary;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register webhooks with Shopify
   */
  const registerWebhooks = useCallback(async (callbackUrl: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopify/webhooks/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callbackUrl }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to register webhooks');
      }
      
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load status on mount
  useEffect(() => {
    getStatus();
  }, [getStatus]);

  return {
    loading,
    error,
    enrollments,
    status,
    getStatus,
    getProducts,
    createProduct,
    getMappings,
    createMapping,
    deleteMapping,
    getEnrollments,
    checkModuleAccess,
    syncModules,
    registerWebhooks,
  };
}

export default useShopify;
