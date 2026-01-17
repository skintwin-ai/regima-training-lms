# RegimA Training System - Integration Guide

This document provides comprehensive documentation for integrating the RegimA Training System with external Learning Management Systems (LMS) and Shopify e-commerce platforms.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [xAPI Integration](#xapi-integration)
4. [SCORM Integration](#scorm-integration)
5. [LTI 1.3 Integration](#lti-13-integration)
6. [Shopify Integration](#shopify-integration)
7. [API Reference](#api-reference)
8. [Configuration](#configuration)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The RegimA Training System supports multiple integration standards to enable seamless connectivity with enterprise learning platforms and e-commerce systems. These integrations allow organizations to:

- **Track learning activities** using xAPI statements sent to a Learning Record Store (LRS)
- **Export content** as SCORM 1.2 or 2004 packages for import into external LMS platforms
- **Embed training content** in external LMS platforms using LTI 1.3
- **Sell courses** through Shopify with automatic enrollment on purchase

---

## Architecture

The integration layer is built as a modular system with the following components:

```
┌─────────────────────────────────────────────────────────────────┐
│                    RegimA Training System                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   xAPI       │  │   SCORM      │  │   LTI 1.3    │           │
│  │   Service    │  │   Service    │  │   Service    │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                 │                    │
│  ┌──────┴─────────────────┴─────────────────┴───────┐           │
│  │              Integration Manager                  │           │
│  └──────────────────────┬───────────────────────────┘           │
│                         │                                        │
│  ┌──────────────────────┴───────────────────────────┐           │
│  │              Shopify Service                      │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │   LRS   │         │ External│         │ Shopify │
    │         │         │   LMS   │         │  Store  │
    └─────────┘         └─────────┘         └─────────┘
```

---

## xAPI Integration

### Overview

The Experience API (xAPI) integration enables tracking of learning activities across the RegimA Training System. All learning events are captured as xAPI statements and can be sent to a Learning Record Store (LRS).

### Supported Verbs

| Verb | Description | When Triggered |
|------|-------------|----------------|
| `launched` | Learner started a lesson | Lesson page opened |
| `completed` | Learner finished a lesson | Lesson marked complete |
| `progressed` | Learner made progress | Scroll progress tracked |
| `passed` | Learner passed a quiz | Quiz score ≥ 70% |
| `failed` | Learner failed a quiz | Quiz score < 70% |
| `answered` | Learner answered a question | Quiz question submitted |

### Configuration

```bash
# Enable xAPI tracking
XAPI_ENABLED=true

# LRS endpoint
XAPI_ENDPOINT=https://your-lrs.com/xapi

# Authentication
XAPI_AUTH_TYPE=basic
XAPI_USERNAME=your-username
XAPI_PASSWORD=your-password

# Activity ID base URL
XAPI_ACTIVITY_BASE=https://regima.training/activities
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lms/xapi/statements` | Send xAPI statements |
| POST | `/api/lms/xapi/lesson-launched` | Record lesson launch |
| POST | `/api/lms/xapi/lesson-completed` | Record lesson completion |
| POST | `/api/lms/xapi/quiz-result` | Record quiz result |
| GET | `/api/lms/xapi/local-statements` | Get locally stored statements |

### Example Statement

```json
{
  "actor": {
    "objectType": "Agent",
    "name": "John Doe",
    "mbox": "mailto:john@example.com"
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/completed",
    "display": { "en-US": "completed" }
  },
  "object": {
    "objectType": "Activity",
    "id": "https://regima.training/activities/lesson/1",
    "definition": {
      "type": "http://adlnet.gov/expapi/activities/lesson",
      "name": { "en-US": "Introduction to Skincare" }
    }
  },
  "result": {
    "completion": true,
    "duration": "PT30M"
  }
}
```

---

## SCORM Integration

### Overview

The SCORM integration allows exporting training modules and lessons as SCORM-compliant packages that can be imported into any SCORM-compatible LMS.

### Supported Versions

- **SCORM 1.2**: Widely supported, simpler implementation
- **SCORM 2004 (4th Edition)**: Advanced sequencing, better tracking

### Package Contents

Each SCORM package includes:

- `imsmanifest.xml` - Package manifest
- `scorm-api.js` - SCORM API wrapper
- `index.html` or `lesson-*.html` - Content pages
- Quiz functionality with score reporting

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lms/scorm/export-lesson` | Export single lesson |
| POST | `/api/lms/scorm/export-module` | Export entire module |
| GET | `/api/lms/scorm/download/:packageId` | Download package ZIP |

### Export Example

```bash
# Export a lesson as SCORM 2004
curl -X POST http://localhost:5000/api/lms/scorm/export-lesson \
  -H "Content-Type: application/json" \
  -d '{"lessonId": 1, "version": "2004"}'

# Response
{
  "success": true,
  "packageDir": "/tmp/scorm-packages/regima-lesson-1",
  "message": "SCORM 2004 package generated for lesson: Introduction to Skincare"
}
```

---

## LTI 1.3 Integration

### Overview

Learning Tools Interoperability (LTI) 1.3 enables external LMS platforms to embed RegimA Training content directly within their interface. This provides a seamless learning experience while maintaining centralized content management.

### Features

- **Single Sign-On**: Users authenticate through their LMS
- **Deep Linking**: Direct access to specific modules or lessons
- **Grade Passback**: Quiz scores can be reported back to the LMS
- **Role Mapping**: Instructor/Learner roles are preserved

### Platform Registration

To integrate with an external LMS, register the platform:

```bash
curl -X POST http://localhost:5000/api/lms/lti/register-platform \
  -H "Content-Type: application/json" \
  -d '{
    "issuer": "https://canvas.instructure.com",
    "clientId": "your-client-id",
    "deploymentId": "your-deployment-id",
    "authorizationEndpoint": "https://canvas.instructure.com/api/lti/authorize_redirect",
    "tokenEndpoint": "https://canvas.instructure.com/login/oauth2/token",
    "jwksUri": "https://canvas.instructure.com/api/lti/security/jwks",
    "publicKey": "-----BEGIN PUBLIC KEY-----..."
  }'
```

### Tool Configuration

Provide this configuration to the LMS administrator:

```json
{
  "title": "RegimA Training System",
  "description": "Professional skincare training platform",
  "oidc_initiation_url": "https://your-domain.com/api/lms/lti/oidc",
  "target_link_uri": "https://your-domain.com/api/lms/lti/launch",
  "public_jwk_url": "https://your-domain.com/api/lms/lti/jwks"
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lms/lti/jwks` | JSON Web Key Set |
| GET | `/api/lms/lti/config` | Tool configuration |
| POST | `/api/lms/lti/register-platform` | Register LMS platform |
| GET | `/api/lms/lti/platforms` | List registered platforms |
| POST/GET | `/api/lms/lti/oidc` | OIDC initiation |
| POST | `/api/lms/lti/launch` | LTI launch callback |

---

## Shopify Integration

### Overview

The Shopify integration enables selling training courses through a Shopify store with automatic enrollment upon purchase. This is particularly relevant for RegimA Zone UK's e-commerce operations.

### Features

- **Product Sync**: Create Shopify products from training modules
- **Auto-Enrollment**: Automatically enroll customers on purchase
- **Access Control**: Time-limited or lifetime access options
- **Webhook Processing**: Real-time order and customer updates

### Configuration

```bash
# Shopify store domain
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com

# Admin API access token
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx

# API version
SHOPIFY_API_VERSION=2024-01

# Webhook secret for verification
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret
```

### Product-Course Mapping

Map Shopify products to training modules:

```bash
curl -X POST http://localhost:5000/api/shopify/mappings \
  -H "Content-Type: application/json" \
  -d '{
    "shopifyProductId": "123456789",
    "moduleId": 1,
    "accessDuration": 365
  }'
```

### Webhook Events

The system handles these Shopify webhooks:

| Event | Action |
|-------|--------|
| `orders/paid` | Create enrollment for purchased courses |
| `orders/cancelled` | Cancel associated enrollments |
| `customers/create` | Log new customer |
| `customers/update` | Update customer data |
| `products/update` | Sync product changes |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shopify/products` | Create course product |
| PUT | `/api/shopify/products/:id` | Update product |
| GET | `/api/shopify/products` | List course products |
| POST | `/api/shopify/mappings` | Create product mapping |
| GET | `/api/shopify/mappings` | List mappings |
| GET | `/api/shopify/enrollments` | Get user enrollments |
| GET | `/api/shopify/access/:moduleId` | Check module access |
| POST | `/api/shopify/webhook` | Webhook handler |
| POST | `/api/shopify/sync/modules` | Sync all modules |
| GET | `/api/shopify/status` | Integration status |

---

## API Reference

### Integration Status

Check the status of all integrations:

```bash
GET /api/integrations/status
```

Response:

```json
{
  "status": {
    "xapi": { "enabled": true, "configured": true },
    "scorm": { "enabled": true, "configured": true },
    "lti": { "enabled": false, "configured": false },
    "shopify": { "enabled": true, "configured": true }
  },
  "config": {
    "xapi": { "endpoint": "https://lrs.example.com/xapi" },
    "scorm": { "version": "2004" },
    "shopify": { "shopDomain": "regima.myshopify.com" }
  }
}
```

### Health Check

```bash
GET /api/integrations/health
```

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Integration Manager

Initialize integrations in your server:

```typescript
import { getIntegrationManager, createIntegrationRouter } from './integrations';

// Initialize
const manager = getIntegrationManager();
await manager.initialize();

// Mount routes
app.use('/api', createIntegrationRouter(manager));
```

---

## Troubleshooting

### xAPI Issues

**Statements not reaching LRS:**
1. Check `XAPI_ENABLED=true`
2. Verify LRS endpoint is accessible
3. Check authentication credentials
4. Review local statements: `GET /api/lms/xapi/local-statements`

### SCORM Issues

**Package not importing:**
1. Verify manifest XML is valid
2. Check SCORM version compatibility
3. Ensure all files are included in ZIP

### LTI Issues

**Launch failing:**
1. Verify platform is registered
2. Check JWT signature verification
3. Ensure JWKS endpoint is accessible
4. Validate nonce hasn't been reused

### Shopify Issues

**Webhooks not received:**
1. Verify webhook URL is publicly accessible
2. Check webhook secret is correct
3. Review Shopify webhook logs
4. Ensure HTTPS is configured

**Enrollment not created:**
1. Verify product-course mapping exists
2. Check order contains mapped products
3. Review webhook processing logs

---

## Support

For integration support, contact the RegimA Training System team or refer to the project repository.

**Repository**: https://github.com/skintwin-ai/regima-training-lms
