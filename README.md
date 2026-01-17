# RegimA Training System

A professional skincare training platform with integrated Learning Management System (LMS) capabilities and Shopify e-commerce integration. Built for RegimA's worldwide distribution network to deliver comprehensive skincare education and certification.

## Features

### Training Platform
- **Module-based Learning**: Structured courses covering skincare fundamentals, product knowledge, and professional techniques
- **Interactive Quizzes**: Knowledge assessments with immediate feedback
- **Progress Tracking**: Monitor learner progress across modules and lessons
- **Certificate Generation**: Automated certification upon course completion
- **Resource Library**: Downloadable materials, videos, and reference guides

### LMS Integration
- **xAPI (Experience API)**: Track learning activities to a Learning Record Store (LRS)
- **SCORM 1.2 & 2004**: Export courses as SCORM packages for external LMS import
- **LTI 1.3**: Embed training content in external LMS platforms (Canvas, Moodle, Blackboard)

### Shopify Integration
- **Course Sales**: Sell training modules through Shopify stores
- **Auto-Enrollment**: Automatic course access upon purchase
- **Access Control**: Time-limited or lifetime access options
- **Webhook Processing**: Real-time order and customer synchronization

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    RegimA Training System                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                                   │
│  ├── Training Interface                                          │
│  ├── Quiz System                                                 │
│  ├── Progress Dashboard                                          │
│  └── Admin Panel                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Express.js + TypeScript)                               │
│  ├── REST API                                                    │
│  ├── Authentication                                              │
│  └── Integration Layer                                           │
│      ├── xAPI Service                                            │
│      ├── SCORM Service                                           │
│      ├── LTI 1.3 Service                                         │
│      └── Shopify Service                                         │
├─────────────────────────────────────────────────────────────────┤
│  Database (SQLite/PostgreSQL via Drizzle ORM)                    │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/skintwin-ai/regima-training-lms.git
cd regima-training-lms

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/regima_training

# Session
SESSION_SECRET=your-session-secret

# xAPI (optional)
XAPI_ENABLED=true
XAPI_ENDPOINT=https://your-lrs.com/xapi
XAPI_USERNAME=admin
XAPI_PASSWORD=password

# Shopify (optional)
SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxx
```

## API Endpoints

### Training API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/modules` | List all modules |
| GET | `/api/modules/:id` | Get module details |
| GET | `/api/lessons/:id` | Get lesson content |
| POST | `/api/progress` | Update user progress |
| POST | `/api/quiz/:id/submit` | Submit quiz answers |

### LMS Integration API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lms/xapi/statements` | Send xAPI statements |
| POST | `/api/lms/scorm/export-module` | Export module as SCORM |
| GET | `/api/lms/lti/jwks` | LTI JWKS endpoint |
| POST | `/api/lms/lti/launch` | LTI launch handler |

### Shopify Integration API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shopify/products` | Create course product |
| GET | `/api/shopify/enrollments` | Get user enrollments |
| POST | `/api/shopify/webhook` | Webhook handler |
| POST | `/api/shopify/sync/modules` | Sync modules to Shopify |

## Documentation

- [Integration Guide](docs/INTEGRATIONS.md) - Detailed LMS and Shopify integration documentation
- [API Reference](docs/API.md) - Complete API documentation
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions

## Project Structure

```
regima-training-lms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   │   ├── xapi-service.ts
│   │   ├── scorm-service.ts
│   │   ├── lti-service.ts
│   │   └── shopify-service.ts
│   ├── integrations/       # Integration manager
│   └── storage.ts          # Database operations
├── shared/                 # Shared types
│   ├── schema.ts           # Database schema
│   └── lms-types.ts        # LMS integration types
├── docs/                   # Documentation
└── wiki/                   # Training content wiki
```

## Integration Examples

### xAPI Statement Tracking

```typescript
import { useLMS } from './hooks/use-lms';

function LessonPage({ lesson }) {
  const { trackLessonLaunched, trackLessonCompleted } = useLMS();
  
  useEffect(() => {
    trackLessonLaunched(lesson.id, lesson.title, lesson.moduleId);
  }, []);
  
  const handleComplete = () => {
    trackLessonCompleted(lesson.id, lesson.title, lesson.moduleId);
  };
}
```

### Shopify Enrollment Check

```typescript
import { useShopify } from './hooks/use-shopify';

function ModulePage({ moduleId }) {
  const { checkModuleAccess } = useShopify();
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    checkModuleAccess(moduleId).then(setHasAccess);
  }, [moduleId]);
  
  if (!hasAccess) {
    return <PurchasePrompt moduleId={moduleId} />;
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## About RegimA

RegimA is a professional skincare brand committed to education and excellence in skin treatment. This training system supports RegimA's worldwide distribution network in delivering consistent, high-quality skincare education.

**RegimA Zone UK** owns and operates the e-commerce platforms supporting RegimA's global distribution.

---

Built with ❤️ for the SkinTwin Cognitive Alchemist Workbench
