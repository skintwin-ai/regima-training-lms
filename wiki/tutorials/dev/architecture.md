
# Understanding the Architecture Tutorial

## Introduction

This tutorial provides a comprehensive overview of the REGIMA Training Platform's architecture for developers who need to maintain or extend the system.

## System Overview

The REGIMA platform is built as a modern web application with distinct client and server components:

- **Client**: React-based frontend with TypeScript
- **Server**: Node.js API with data persistence
- **Database**: SQL database with structured schema

## Directory Structure

Understanding the codebase organization is essential for efficient development:

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

## Step 1: Explore Key Files

Let's start by examining the most important files in the system:

1. **Entry Points**:
   - `client/src/main.tsx`: Client-side entry point
   - `server/index.ts`: Server-side entry point

2. **Core Components**:
   - `client/src/App.tsx`: Main application component and routing
   - `client/src/pages/`: Individual page components
   - `server/routes.ts`: API endpoint definitions

## Step 2: Understanding Data Flow

The data flow in the application follows a standard pattern:

1. **User Authentication**:
   - Client sends credentials to the authentication endpoint
   - Server validates and returns a session token
   - Client stores token and includes it in subsequent requests

2. **Content Retrieval**:
   - Client requests data from API endpoints
   - Server validates the session
   - Database queries return relevant data
   - Server transforms data as needed
   - Client receives and renders the data

3. **Progress Tracking**:
   - Client sends completion events to the server
   - Server updates user progress records
   - Updated progress is reflected in the UI

## Step 3: Examining Component Architecture

The React component architecture follows these principles:

1. **Container/Presentation Pattern**:
   - Container components manage data and state
   - Presentation components handle rendering
   - This separation improves reusability and testability

2. **Component Composition**:
   - Smaller, specialized components are composed into larger features
   - Common UI elements are abstracted into reusable components

3. **Custom Hooks**:
   - Business logic is extracted into custom hooks
   - This improves code organization and testability

## Step 4: Understanding API Design

The server API is organized around these principles:

1. **RESTful Endpoints**:
   - Resources are accessed via standard HTTP methods
   - Endpoints follow consistent naming conventions
   - Authentication is handled via bearer tokens

2. **Data Validation**:
   - Input validation is performed on all endpoints
   - Schema validation ensures data integrity
   - Error messages are standardized for client handling

## Step 5: Database Schema

The database schema includes these key models:

1. **User**: Stores authentication and profile information
2. **Module**: Represents training modules
3. **Lesson**: Contains lesson content and structure
4. **Progress**: Tracks user advancement through content
5. **Resource**: Manages downloadable materials
6. **Product**: Stores product information
7. **Ingredient**: Contains ingredient data and properties

## Development Workflow

To effectively develop for the REGIMA platform:

1. **Local Setup**:
   - Clone the repository
   - Install dependencies with `npm install`
   - Start the development server with `npm run dev`

2. **Making Changes**:
   - Create a feature branch
   - Implement and test your changes
   - Submit a pull request for review

3. **Testing**:
   - Run automated tests with `npm test`
   - Perform manual testing of features
   - Verify changes across supported browsers

## Best Practices

Follow these guidelines when working on the codebase:

1. **Code Style**:
   - Follow existing patterns and conventions
   - Use TypeScript for type safety
   - Document complex functions and components

2. **Performance**:
   - Optimize component rendering
   - Minimize API requests
   - Use proper memoization techniques

3. **Accessibility**:
   - Ensure all UI elements are keyboard accessible
   - Implement proper ARIA attributes
   - Test with screen readers

## Next Steps

Now that you understand the architecture, explore the [Progress Tracking Implementation](/wiki/tutorials/dev/progress-tracking.md) tutorial to learn about a key system feature in detail.
