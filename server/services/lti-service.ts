/**
 * LTI 1.3 Service
 * 
 * Implements Learning Tools Interoperability (LTI) 1.3 protocol
 * to allow external LMS platforms to embed RegimA Training content.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { LTILaunchRequest, LTIPlatformConfig, LTIToolConfig } from '@shared/lms-types';
import { LTI_ROLES } from '@shared/lms-types';

// Generate RSA key pair for JWT signing
function generateKeyPair(): { publicKey: string; privateKey: string } {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  return { publicKey, privateKey };
}

// Default tool configuration
const DEFAULT_TOOL_CONFIG: LTIToolConfig = {
  name: 'RegimA Training System',
  description: 'Professional skincare training platform by RegimA',
  targetLinkUri: process.env.LTI_TARGET_LINK_URI || 'http://localhost:5000/lti/launch',
  oidcInitiationUrl: process.env.LTI_OIDC_URL || 'http://localhost:5000/lti/oidc',
  jwksUri: process.env.LTI_JWKS_URI || 'http://localhost:5000/lti/jwks',
  ...generateKeyPair(),
};

interface LTISession {
  state: string;
  nonce: string;
  platformId: string;
  targetLinkUri: string;
  createdAt: Date;
}

interface DecodedLaunch {
  userId: string;
  email?: string;
  name?: string;
  roles: string[];
  contextId?: string;
  contextTitle?: string;
  resourceLinkId: string;
  resourceLinkTitle?: string;
  custom?: Record<string, string>;
}

export class LTIService {
  private toolConfig: LTIToolConfig;
  private platforms: Map<string, LTIPlatformConfig> = new Map();
  private sessions: Map<string, LTISession> = new Map();
  private nonces: Set<string> = new Set();

  constructor(toolConfig: Partial<LTIToolConfig> = {}) {
    this.toolConfig = { ...DEFAULT_TOOL_CONFIG, ...toolConfig };
  }

  /**
   * Register a platform (LMS) that can launch this tool
   */
  registerPlatform(config: LTIPlatformConfig): void {
    this.platforms.set(config.issuer, config);
    console.log(`LTI Platform registered: ${config.issuer}`);
  }

  /**
   * Get registered platform by issuer
   */
  getPlatform(issuer: string): LTIPlatformConfig | undefined {
    return this.platforms.get(issuer);
  }

  /**
   * Get all registered platforms
   */
  getAllPlatforms(): LTIPlatformConfig[] {
    return Array.from(this.platforms.values());
  }

  /**
   * Generate JWKS (JSON Web Key Set) for the tool
   */
  getJWKS(): object {
    const publicKey = crypto.createPublicKey(this.toolConfig.publicKey);
    const jwk = publicKey.export({ format: 'jwk' });
    
    return {
      keys: [{
        ...jwk,
        kid: 'regima-training-key-1',
        use: 'sig',
        alg: 'RS256',
      }],
    };
  }

  /**
   * Handle OIDC initiation request from platform
   */
  handleOIDCInitiation(params: {
    iss: string;
    login_hint: string;
    target_link_uri: string;
    lti_message_hint?: string;
    client_id?: string;
    lti_deployment_id?: string;
  }): { redirectUrl: string; state: string } {
    const platform = this.getPlatform(params.iss);
    if (!platform) {
      throw new Error(`Unknown platform: ${params.iss}`);
    }

    // Generate state and nonce
    const state = crypto.randomBytes(32).toString('hex');
    const nonce = crypto.randomBytes(32).toString('hex');

    // Store session
    this.sessions.set(state, {
      state,
      nonce,
      platformId: params.iss,
      targetLinkUri: params.target_link_uri,
      createdAt: new Date(),
    });

    // Build authorization URL
    const authUrl = new URL(platform.authorizationEndpoint);
    authUrl.searchParams.set('response_type', 'id_token');
    authUrl.searchParams.set('response_mode', 'form_post');
    authUrl.searchParams.set('client_id', platform.clientId);
    authUrl.searchParams.set('redirect_uri', this.toolConfig.targetLinkUri);
    authUrl.searchParams.set('scope', 'openid');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('nonce', nonce);
    authUrl.searchParams.set('login_hint', params.login_hint);
    
    if (params.lti_message_hint) {
      authUrl.searchParams.set('lti_message_hint', params.lti_message_hint);
    }

    return {
      redirectUrl: authUrl.toString(),
      state,
    };
  }

  /**
   * Validate and decode LTI launch request
   */
  async validateLaunch(idToken: string, state: string): Promise<DecodedLaunch> {
    // Retrieve session
    const session = this.sessions.get(state);
    if (!session) {
      throw new Error('Invalid or expired state');
    }

    // Clean up session
    this.sessions.delete(state);

    // Get platform
    const platform = this.getPlatform(session.platformId);
    if (!platform) {
      throw new Error('Platform not found');
    }

    // Verify JWT
    let decoded: LTILaunchRequest;
    try {
      decoded = jwt.verify(idToken, platform.publicKey, {
        algorithms: ['RS256'],
        issuer: platform.issuer,
        audience: platform.clientId,
      }) as LTILaunchRequest;
    } catch (error) {
      throw new Error(`JWT verification failed: ${error}`);
    }

    // Validate nonce
    if (decoded.nonce !== session.nonce) {
      throw new Error('Nonce mismatch');
    }

    // Check nonce hasn't been used before
    if (this.nonces.has(decoded.nonce)) {
      throw new Error('Nonce already used');
    }
    this.nonces.add(decoded.nonce);

    // Validate message type
    if (decoded['https://purl.imsglobal.org/spec/lti/claim/message_type'] !== 'LtiResourceLinkRequest') {
      throw new Error('Invalid message type');
    }

    // Validate version
    if (decoded['https://purl.imsglobal.org/spec/lti/claim/version'] !== '1.3.0') {
      throw new Error('Unsupported LTI version');
    }

    // Extract user information
    const resourceLink = decoded['https://purl.imsglobal.org/spec/lti/claim/resource_link'];
    const context = decoded['https://purl.imsglobal.org/spec/lti/claim/context'];
    const custom = decoded['https://purl.imsglobal.org/spec/lti/claim/custom'];

    return {
      userId: decoded.sub,
      email: decoded.email,
      name: decoded.name || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim(),
      roles: decoded['https://purl.imsglobal.org/spec/lti/claim/roles'],
      contextId: context?.id,
      contextTitle: context?.title,
      resourceLinkId: resourceLink.id,
      resourceLinkTitle: resourceLink.title,
      custom,
    };
  }

  /**
   * Check if user has instructor role
   */
  isInstructor(roles: string[]): boolean {
    return roles.some(role => 
      role.includes('Instructor') || 
      role.includes('Administrator') ||
      role.includes('ContentDeveloper')
    );
  }

  /**
   * Check if user has learner role
   */
  isLearner(roles: string[]): boolean {
    return roles.some(role => role.includes('Learner'));
  }

  /**
   * Generate tool configuration for platform registration
   */
  getToolConfiguration(): object {
    return {
      title: this.toolConfig.name,
      description: this.toolConfig.description,
      oidc_initiation_url: this.toolConfig.oidcInitiationUrl,
      target_link_uri: this.toolConfig.targetLinkUri,
      public_jwk_url: this.toolConfig.jwksUri,
      extensions: [{
        platform: 'canvas.instructure.com',
        settings: {
          placements: [
            {
              placement: 'course_navigation',
              message_type: 'LtiResourceLinkRequest',
              target_link_uri: this.toolConfig.targetLinkUri,
            },
            {
              placement: 'assignment_selection',
              message_type: 'LtiResourceLinkRequest',
              target_link_uri: this.toolConfig.targetLinkUri,
            },
          ],
        },
      }],
      custom_fields: {
        module_id: '$Canvas.assignment.id',
        lesson_id: '$Canvas.assignment.title',
      },
      scopes: [
        'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
        'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
        'https://purl.imsglobal.org/spec/lti-ags/scope/score',
        'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly',
      ],
    };
  }

  /**
   * Generate Deep Linking response for content selection
   */
  generateDeepLinkingResponse(
    platform: LTIPlatformConfig,
    items: Array<{
      type: 'ltiResourceLink';
      title: string;
      url: string;
      custom?: Record<string, string>;
    }>
  ): string {
    const payload = {
      iss: this.toolConfig.targetLinkUri,
      aud: platform.issuer,
      exp: Math.floor(Date.now() / 1000) + 300,
      iat: Math.floor(Date.now() / 1000),
      nonce: crypto.randomBytes(16).toString('hex'),
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiDeepLinkingResponse',
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': platform.deploymentId,
      'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': items.map(item => ({
        type: item.type,
        title: item.title,
        url: item.url,
        custom: item.custom,
      })),
    };

    return jwt.sign(payload, this.toolConfig.privateKey, {
      algorithm: 'RS256',
      keyid: 'regima-training-key-1',
    });
  }

  /**
   * Clean up expired sessions and old nonces
   */
  cleanup(): void {
    const now = new Date();
    const sessionTimeout = 10 * 60 * 1000; // 10 minutes

    // Clean up expired sessions
    for (const [state, session] of this.sessions) {
      if (now.getTime() - session.createdAt.getTime() > sessionTimeout) {
        this.sessions.delete(state);
      }
    }

    // Limit nonce storage (keep last 10000)
    if (this.nonces.size > 10000) {
      const noncesArray = Array.from(this.nonces);
      this.nonces = new Set(noncesArray.slice(-5000));
    }
  }
}

// Singleton instance
let ltiServiceInstance: LTIService | null = null;

export function getLTIService(toolConfig?: Partial<LTIToolConfig>): LTIService {
  if (!ltiServiceInstance) {
    ltiServiceInstance = new LTIService(toolConfig);
  }
  return ltiServiceInstance;
}

export default LTIService;
