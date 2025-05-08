
# System Architecture

This guide provides an overview of the REGIMA Training Platform's technical architecture for developers and technical team members.

## Technology Stack

The REGIMA Training Platform is built with the following technologies:

### Frontend
- **Framework**: React with TypeScript
- **State Management**: React Context API with React Query for data fetching
- **UI Components**: Custom component library built with Shadcn UI
- **Styling**: Tailwind CSS for responsive design
- **Build Tool**: Vite for fast development and optimized production builds

### Backend
- **Server**: Express.js running on Node.js
- **API Design**: RESTful API endpoints
- **Authentication**: Session-based authentication with JWT tokens
- **Database**: PostgreSQL with Drizzle ORM

## System Architecture Diagram

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│                 │      │                  │      │                 │
│   React Client  │◄────►│   Express API    │◄────►│   PostgreSQL    │
│                 │      │                  │      │                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
        │                         │                         ▲
        │                         │                         │
        ▼                         ▼                         │
┌─────────────────┐      ┌──────────────────┐              │
│  Static Assets  │      │ External Services │─────────────┘
│  (Media, PDFs)  │      │   (Auth, etc.)    │
└─────────────────┘      └──────────────────┘
```

## Directory Structure

The codebase follows this organization:

### Client-Side Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── course/     # Course-specific components
│   │   ├── layout/     # Layout components
│   │   └── ui/         # Base UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions and constants
│   ├── pages/          # Page components
│   └── App.tsx         # Main application component
```

### Server-Side Structure
```
server/
├── data/              # Static data and seed files
├── routes.ts          # API route definitions
├── storage.ts         # Database connection and models
└── index.ts           # Server entry point
```

## Data Flow

1. **User Authentication**
   - Client sends credentials to the authentication endpoint
   - Server validates and returns a session token
   - Client stores token and includes it in subsequent requests

2. **Content Retrieval**
   - Client requests data from API endpoints
   - Server validates the session
   - Database queries return relevant data
   - Server transforms data as needed
   - Client receives and renders the data

3. **Progress Tracking**
   - Client sends completed lesson/quiz data to API
   - Server validates and stores in database
   - Progress calculations update user's status
   - Updated progress is returned to client

## Key Subsystems

### Authentication System
- Session-based authentication
- Role-based access control (User, Admin, Developer)
- Secure password handling

### Content Management
- Structured data model for training content
- Media management for videos and images
- Version control for lesson content

### Progress Tracking
- User activity monitoring
- Completion status calculation
- Certificate generation and verification

## Integration Points

- **Media Storage**: Videos hosted via third-party services, referenced by URL
- **PDF Generation**: Certificates and resources generated on-demand
- **Email Notifications**: Integration with email service for notifications

## Development Environment

The development environment uses:
- Replit for collaborative development
- Vite development server with hot module replacement
- PostgreSQL database (both local and cloud options)
- ESLint and Prettier for code quality

## Deployment Architecture

The production deployment uses:
- Replit Deployments for the web application
- Cloud-hosted PostgreSQL database
- CDN for static assets
- Automated build and deployment pipeline

## Best Practices for Development

- Use TypeScript interfaces for all data structures
- Follow the component design patterns established in the codebase
- Write unit tests for utility functions and components
- Use React Query for all data fetching operations
- Maintain backward compatibility with API endpoints
