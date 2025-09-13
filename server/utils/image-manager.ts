
/**
 * Image Management Utility for REGIMA CMS
 * 
 * This utility handles image storage, retrieval, and management for ingredients
 * and other content within the REGIMA training system.
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

export interface ImageAsset {
  id: string;
  originalUrl: string;
  localPath: string;
  filename: string;
  category: 'ingredient' | 'product' | 'general';
  uploadDate: Date;
  fileSize?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export class ImageManager {
  private static instance: ImageManager;
  private assetsDir = path.join(process.cwd(), 'assets', 'images');
  private metadataFile = path.join(process.cwd(), 'assets', 'image-metadata.json');
  private imageRegistry: Map<string, ImageAsset> = new Map();

  private constructor() {
    this.initializeDirectories();
    this.loadMetadata();
  }

  static getInstance(): ImageManager {
    if (!ImageManager.instance) {
      ImageManager.instance = new ImageManager();
    }
    return ImageManager.instance;
  }

  private async initializeDirectories(): Promise<void> {
    try {
      await mkdir(this.assetsDir, { recursive: true });
      await mkdir(path.join(this.assetsDir, 'ingredients'), { recursive: true });
      await mkdir(path.join(this.assetsDir, 'products'), { recursive: true });
      await mkdir(path.join(this.assetsDir, 'general'), { recursive: true });
    } catch (error) {
      console.error('Failed to create image directories:', error);
    }
  }

  private async loadMetadata(): Promise<void> {
    try {
      const metadataContent = await readFile(this.metadataFile, 'utf-8');
      const metadata: ImageAsset[] = JSON.parse(metadataContent);
      metadata.forEach(asset => {
        this.imageRegistry.set(asset.id, asset);
      });
    } catch (error) {
      // Metadata file doesn't exist yet, that's okay
      console.log('Image metadata file not found, starting fresh');
    }
  }

  private async saveMetadata(): Promise<void> {
    try {
      const metadata = Array.from(this.imageRegistry.values());
      await writeFile(this.metadataFile, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Failed to save image metadata:', error);
    }
  }

  /**
   * Download and store an image from a URL
   */
  async downloadAndStore(
    originalUrl: string,
    category: ImageAsset['category'],
    filename?: string
  ): Promise<ImageAsset | null> {
    try {
      const response = await fetch(originalUrl);
      if (!response.ok) {
        console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        return null;
      }

      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Generate filename if not provided
      const urlParts = originalUrl.split('/');
      const originalFilename = urlParts[urlParts.length - 1] || 'image';
      const finalFilename = filename || this.sanitizeFilename(originalFilename);
      
      // Ensure proper extension
      const ext = this.getFileExtension(originalUrl) || '.png';
      const fullFilename = finalFilename.endsWith(ext) ? finalFilename : `${finalFilename}${ext}`;
      
      const localPath = path.join(this.assetsDir, category, fullFilename);
      
      // Save the file
      await writeFile(localPath, uint8Array);
      
      // Create asset record
      const asset: ImageAsset = {
        id: this.generateId(),
        originalUrl,
        localPath: path.relative(process.cwd(), localPath),
        filename: fullFilename,
        category,
        uploadDate: new Date(),
        fileSize: uint8Array.length
      };
      
      this.imageRegistry.set(asset.id, asset);
      await this.saveMetadata();
      
      console.log(`Successfully downloaded and stored: ${fullFilename}`);
      return asset;
    } catch (error) {
      console.error(`Failed to download image from ${originalUrl}:`, error);
      return null;
    }
  }

  /**
   * Get local URL for serving images
   */
  getLocalUrl(assetId: string): string | null {
    const asset = this.imageRegistry.get(assetId);
    if (!asset) return null;
    
    return `/assets/images/${asset.category}/${asset.filename}`;
  }

  /**
   * Find asset by original URL
   */
  findByOriginalUrl(originalUrl: string): ImageAsset | null {
    for (const asset of this.imageRegistry.values()) {
      if (asset.originalUrl === originalUrl) {
        return asset;
      }
    }
    return null;
  }

  /**
   * Batch download images from ingredient data
   */
  async downloadIngredientImages(ingredients: any[]): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();
    
    for (const ingredient of ingredients) {
      if (ingredient.imageUrl) {
        console.log(`Downloading image for: ${ingredient.name}`);
        
        // Check if we already have this image
        let asset = this.findByOriginalUrl(ingredient.imageUrl);
        
        if (!asset) {
          // Download new image
          const filename = this.sanitizeFilename(ingredient.name);
          asset = await this.downloadAndStore(
            ingredient.imageUrl,
            'ingredient',
            filename
          );
        }
        
        if (asset) {
          urlMap.set(ingredient.imageUrl, this.getLocalUrl(asset.id) || ingredient.imageUrl);
        }
      }
    }
    
    return urlMap;
  }

  private sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private getFileExtension(url: string): string | null {
    const match = url.match(/\.(png|jpg|jpeg|gif|webp|avif)(\?|$)/i);
    return match ? `.${match[1].toLowerCase()}` : null;
  }

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all assets by category
   */
  getAssetsByCategory(category: ImageAsset['category']): ImageAsset[] {
    return Array.from(this.imageRegistry.values()).filter(
      asset => asset.category === category
    );
  }

  /**
   * Get asset statistics
   */
  getStats(): {
    totalAssets: number;
    byCategory: Record<string, number>;
    totalSize: number;
  } {
    const assets = Array.from(this.imageRegistry.values());
    const byCategory: Record<string, number> = {};
    let totalSize = 0;
    
    assets.forEach(asset => {
      byCategory[asset.category] = (byCategory[asset.category] || 0) + 1;
      totalSize += asset.fileSize || 0;
    });
    
    return {
      totalAssets: assets.length,
      byCategory,
      totalSize
    };
  }
}
