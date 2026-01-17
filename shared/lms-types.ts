/**
 * LMS Integration Types
 * 
 * Type definitions for SCORM, xAPI, and LTI integration
 * with the RegimA Training System.
 */

import { z } from "zod";

// =============================================================================
// SCORM Types
// =============================================================================

export interface SCORMManifest {
  identifier: string;
  version: string;
  title: string;
  description: string;
  organizations: SCORMOrganization[];
  resources: SCORMResource[];
}

export interface SCORMOrganization {
  identifier: string;
  title: string;
  items: SCORMItem[];
}

export interface SCORMItem {
  identifier: string;
  title: string;
  identifierref?: string;
  children?: SCORMItem[];
}

export interface SCORMResource {
  identifier: string;
  type: string;
  href: string;
  files: string[];
}

export interface SCORMRuntimeData {
  cmi: {
    completion_status: "completed" | "incomplete" | "not attempted" | "unknown";
    success_status: "passed" | "failed" | "unknown";
    score: {
      scaled: number;
      raw: number;
      min: number;
      max: number;
    };
    progress_measure: number;
    session_time: string;
    total_time: string;
    location: string;
    suspend_data: string;
  };
}

// =============================================================================
// xAPI Types
// =============================================================================

export const xAPIVerbSchema = z.object({
  id: z.string().url(),
  display: z.record(z.string()),
});

export const xAPIActorSchema = z.object({
  objectType: z.literal("Agent").optional(),
  name: z.string().optional(),
  mbox: z.string().optional(),
  mbox_sha1sum: z.string().optional(),
  openid: z.string().optional(),
  account: z.object({
    homePage: z.string().url(),
    name: z.string(),
  }).optional(),
});

export const xAPIObjectSchema = z.object({
  objectType: z.enum(["Activity", "Agent", "Group", "StatementRef", "SubStatement"]).optional(),
  id: z.string(),
  definition: z.object({
    type: z.string().url().optional(),
    name: z.record(z.string()).optional(),
    description: z.record(z.string()).optional(),
    moreInfo: z.string().url().optional(),
    extensions: z.record(z.unknown()).optional(),
  }).optional(),
});

export const xAPIResultSchema = z.object({
  score: z.object({
    scaled: z.number().min(-1).max(1).optional(),
    raw: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  success: z.boolean().optional(),
  completion: z.boolean().optional(),
  response: z.string().optional(),
  duration: z.string().optional(),
  extensions: z.record(z.unknown()).optional(),
});

export const xAPIContextSchema = z.object({
  registration: z.string().uuid().optional(),
  instructor: xAPIActorSchema.optional(),
  team: z.object({
    objectType: z.literal("Group"),
    name: z.string().optional(),
    member: z.array(xAPIActorSchema).optional(),
  }).optional(),
  contextActivities: z.object({
    parent: z.array(xAPIObjectSchema).optional(),
    grouping: z.array(xAPIObjectSchema).optional(),
    category: z.array(xAPIObjectSchema).optional(),
    other: z.array(xAPIObjectSchema).optional(),
  }).optional(),
  revision: z.string().optional(),
  platform: z.string().optional(),
  language: z.string().optional(),
  statement: z.object({
    objectType: z.literal("StatementRef"),
    id: z.string().uuid(),
  }).optional(),
  extensions: z.record(z.unknown()).optional(),
});

export const xAPIStatementSchema = z.object({
  id: z.string().uuid().optional(),
  actor: xAPIActorSchema,
  verb: xAPIVerbSchema,
  object: xAPIObjectSchema,
  result: xAPIResultSchema.optional(),
  context: xAPIContextSchema.optional(),
  timestamp: z.string().datetime().optional(),
  stored: z.string().datetime().optional(),
  authority: xAPIActorSchema.optional(),
  version: z.string().optional(),
  attachments: z.array(z.object({
    usageType: z.string().url(),
    display: z.record(z.string()),
    description: z.record(z.string()).optional(),
    contentType: z.string(),
    length: z.number(),
    sha2: z.string(),
    fileUrl: z.string().url().optional(),
  })).optional(),
});

export type XAPIVerb = z.infer<typeof xAPIVerbSchema>;
export type XAPIActor = z.infer<typeof xAPIActorSchema>;
export type XAPIObject = z.infer<typeof xAPIObjectSchema>;
export type XAPIResult = z.infer<typeof xAPIResultSchema>;
export type XAPIContext = z.infer<typeof xAPIContextSchema>;
export type XAPIStatement = z.infer<typeof xAPIStatementSchema>;

// Common xAPI Verbs
export const XAPI_VERBS = {
  LAUNCHED: {
    id: "http://adlnet.gov/expapi/verbs/launched",
    display: { "en-US": "launched" },
  },
  INITIALIZED: {
    id: "http://adlnet.gov/expapi/verbs/initialized",
    display: { "en-US": "initialized" },
  },
  COMPLETED: {
    id: "http://adlnet.gov/expapi/verbs/completed",
    display: { "en-US": "completed" },
  },
  PASSED: {
    id: "http://adlnet.gov/expapi/verbs/passed",
    display: { "en-US": "passed" },
  },
  FAILED: {
    id: "http://adlnet.gov/expapi/verbs/failed",
    display: { "en-US": "failed" },
  },
  ANSWERED: {
    id: "http://adlnet.gov/expapi/verbs/answered",
    display: { "en-US": "answered" },
  },
  EXPERIENCED: {
    id: "http://adlnet.gov/expapi/verbs/experienced",
    display: { "en-US": "experienced" },
  },
  PROGRESSED: {
    id: "http://adlnet.gov/expapi/verbs/progressed",
    display: { "en-US": "progressed" },
  },
  SCORED: {
    id: "http://adlnet.gov/expapi/verbs/scored",
    display: { "en-US": "scored" },
  },
  SUSPENDED: {
    id: "http://adlnet.gov/expapi/verbs/suspended",
    display: { "en-US": "suspended" },
  },
  RESUMED: {
    id: "http://adlnet.gov/expapi/verbs/resumed",
    display: { "en-US": "resumed" },
  },
  TERMINATED: {
    id: "http://adlnet.gov/expapi/verbs/terminated",
    display: { "en-US": "terminated" },
  },
} as const;

// =============================================================================
// LTI Types
// =============================================================================

export interface LTILaunchRequest {
  iss: string;
  sub: string;
  aud: string | string[];
  exp: number;
  iat: number;
  nonce: string;
  "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiResourceLinkRequest";
  "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0";
  "https://purl.imsglobal.org/spec/lti/claim/deployment_id": string;
  "https://purl.imsglobal.org/spec/lti/claim/target_link_uri": string;
  "https://purl.imsglobal.org/spec/lti/claim/resource_link": {
    id: string;
    title?: string;
    description?: string;
  };
  "https://purl.imsglobal.org/spec/lti/claim/roles": string[];
  "https://purl.imsglobal.org/spec/lti/claim/context"?: {
    id: string;
    label?: string;
    title?: string;
    type?: string[];
  };
  "https://purl.imsglobal.org/spec/lti/claim/launch_presentation"?: {
    document_target?: "iframe" | "window";
    height?: number;
    width?: number;
    return_url?: string;
    locale?: string;
  };
  "https://purl.imsglobal.org/spec/lti/claim/custom"?: Record<string, string>;
  name?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export interface LTIPlatformConfig {
  issuer: string;
  clientId: string;
  deploymentId: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  jwksUri: string;
  publicKey: string;
  privateKey: string;
}

export interface LTIToolConfig {
  name: string;
  description: string;
  targetLinkUri: string;
  oidcInitiationUrl: string;
  jwksUri: string;
  publicKey: string;
  privateKey: string;
}

// LTI Roles
export const LTI_ROLES = {
  LEARNER: "http://purl.imsglobal.org/vocab/lis/v2/membership#Learner",
  INSTRUCTOR: "http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor",
  ADMIN: "http://purl.imsglobal.org/vocab/lis/v2/institution/person#Administrator",
  CONTENT_DEVELOPER: "http://purl.imsglobal.org/vocab/lis/v2/membership#ContentDeveloper",
} as const;

// =============================================================================
// Integration Configuration Types
// =============================================================================

export interface LMSIntegrationConfig {
  scorm: {
    enabled: boolean;
    version: "1.2" | "2004";
    manifestTemplate: string;
  };
  xapi: {
    enabled: boolean;
    endpoint: string;
    auth: {
      type: "basic" | "oauth";
      username?: string;
      password?: string;
      clientId?: string;
      clientSecret?: string;
    };
    activityIdBase: string;
  };
  lti: {
    enabled: boolean;
    version: "1.3";
    platforms: LTIPlatformConfig[];
    tool: LTIToolConfig;
  };
}

// =============================================================================
// Shopify Integration Types
// =============================================================================

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  variants: ShopifyVariant[];
  metafields: ShopifyMetafield[];
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  sku: string;
  inventoryQuantity: number;
}

export interface ShopifyMetafield {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
  metafields: ShopifyMetafield[];
}

export interface ShopifyOrder {
  id: string;
  name: string;
  email: string;
  customer: ShopifyCustomer;
  lineItems: ShopifyLineItem[];
  fulfillmentStatus: string;
  financialStatus: string;
  createdAt: string;
}

export interface ShopifyLineItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  quantity: number;
  price: string;
}

export interface ShopifyWebhookPayload {
  topic: string;
  shop: string;
  payload: unknown;
}

// Course-Product Mapping
export interface CourseProductMapping {
  id: number;
  moduleId: number;
  shopifyProductId: string;
  shopifyVariantId?: string;
  accessDuration?: number; // days, null = lifetime
  createdAt: Date;
  updatedAt: Date;
}

// Enrollment from Shopify
export interface ShopifyEnrollment {
  id: number;
  userId: number;
  orderId: string;
  productId: string;
  moduleId: number;
  enrolledAt: Date;
  expiresAt?: Date;
  status: "active" | "expired" | "cancelled";
}

// =============================================================================
// Sync Types
// =============================================================================

export interface SyncStatus {
  lastSync: Date;
  status: "success" | "error" | "pending";
  itemsSynced: number;
  errors: string[];
}

export interface CourseExport {
  format: "scorm" | "xapi" | "json";
  moduleId: number;
  includeQuizzes: boolean;
  includeResources: boolean;
  generatedAt: Date;
  downloadUrl: string;
}
