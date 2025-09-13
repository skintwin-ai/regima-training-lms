# Overview

The REGIMA Training Platform is a comprehensive web application designed for professional skincare education and certification. The platform provides structured training modules for skincare specialists to learn about REGIMA products, ingredients, and professional techniques. Built as a full-stack application with React frontend and Express backend, it features user authentication, progress tracking, and comprehensive content management for skincare education.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**React with TypeScript**: The client application uses React 18 with TypeScript for type safety and modern development practices. The frontend is organized with a component-based architecture using shadcn/ui components for consistent design.

**Routing**: Uses Wouter for lightweight client-side routing, handling navigation between dashboard, modules, lessons, ingredients reference, and products catalog.

**State Management**: Leverages React Query (@tanstack/react-query) for server state management, caching, and API data fetching. Local state is managed with React hooks.

**Styling**: Implements Tailwind CSS for utility-first styling with a custom design system. Uses CSS variables for theming and responsive design patterns.

**UI Components**: Built on shadcn/ui component library providing accessible, customizable components like accordions, cards, tabs, and form elements.

## Backend Architecture

**Express.js Server**: Node.js backend using Express with TypeScript, providing REST API endpoints for authentication, content delivery, and progress tracking.

**Session-Based Authentication**: Uses express-session with MemoryStore for user authentication and session management. Sessions persist for 24 hours with automatic cleanup.

**Modular Route Structure**: API routes are organized by feature (auth, modules, lessons, progress, ingredients, products) with centralized error handling and logging.

**Content Management**: Server-side data structures for managing training modules, lessons, steps, resources, quizzes, and user progress tracking.

## Data Storage Solutions

**Drizzle ORM**: Uses Drizzle as the database ORM with PostgreSQL dialect, providing type-safe database operations and schema management.

**PostgreSQL Integration**: Configured for PostgreSQL database with Neon serverless database connectivity (@neondatabase/serverless).

**Schema Design**: Comprehensive schema covering users, modules, lessons, steps, resources, products, quizzes, user progress, notes, feedback, and certificates.

**Migration System**: Drizzle Kit configured for database migrations with schema files in the shared directory for type sharing between client and server.

## Authentication and Authorization

**Session Management**: Express session middleware with memory store for development, supporting persistent login sessions across requests.

**Route Protection**: API endpoints protected with authentication middleware, redirecting unauthorized users to login.

**User Roles**: Role-based system supporting different user types (admin, instructor, student) with appropriate access controls.

## External Dependencies

**Neon Database**: Serverless PostgreSQL database hosting for production data storage with connection pooling and automatic scaling.

**Radix UI**: Comprehensive set of unstyled, accessible UI primitives including dialog, dropdown, accordion, and form components.

**React Hook Form**: Form state management with @hookform/resolvers for validation integration using Zod schemas.

**Zod Validation**: Type-safe schema validation for both client and server-side data validation, integrated with Drizzle for database schema generation.

**Vite Build System**: Modern build tool for the frontend with React plugin, development server, and production optimization.

**Image Management**: Custom image management system for storing and serving ingredient and product images, with download utilities for external asset importing.