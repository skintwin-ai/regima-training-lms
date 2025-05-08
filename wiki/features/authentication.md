
# Authentication System

The REGIMA training platform implements a session-based authentication system to secure user data and track progress.

## User Login

- **Login Form**: Username and password input fields
- **Form Validation**: Required field validation
- **Error Handling**: Clear error messages for invalid credentials
- **Loading States**: Visual feedback during authentication process

## Session Management

- **Express Session**: Server-side session storage using MemoryStore
- **Session Cookies**: 24-hour expiration for persistent login
- **Secure Practices**: CSRF protection and secure cookie handling

## Authentication API Endpoints

- **/api/auth/login**: Authenticate user credentials and establish session
- **/api/auth/logout**: Terminate user session
- **/api/auth/me**: Verify current authentication status and retrieve user info

## Protected Routes

- Automatic redirection to login page for unauthenticated users
- API endpoints secured against unauthorized access
- Conditional rendering of UI elements based on authentication status

## User Experience

- Persistent sessions across page navigation
- Clear login/logout workflow
- User profile information display in navigation
