
# UI Components Library

This guide documents the UI component library used in the REGIMA Training Platform for developers who need to maintain or extend the user interface.

## Component Architecture

The REGIMA platform uses a component-based architecture built on:
- React with TypeScript for type safety
- Shadcn UI as the foundation for accessible components
- Tailwind CSS for styling
- Lucide React for consistent iconography

## Component Organization

UI components are organized in three main categories:

```
components/
├── ui/               # Base UI components (shadcn/ui)
├── layout/           # Layout components (sidebar, headers)
└── course/           # Domain-specific components for training
```

## Base UI Components

These components are based on shadcn/ui and provide the foundation for the interface:

### Core Components
- `Button`: Primary call-to-action component
- `Card`: Container for grouped content
- `Dialog`: Modal dialogs for focused interactions
- `Input`: Text input fields
- `Progress`: Visual progress indicators

### Usage Example

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

function ModuleCard({ title, description, onStart }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{description}</p>
        <Button onClick={onStart}>Start Module</Button>
      </CardContent>
    </Card>
  );
}
```

## Layout Components

Layout components handle the application structure:

### Key Layout Components
- `MainLayout`: The primary layout wrapper
- `Sidebar`: Navigation sidebar with responsive behavior
- `MobileHeader`: Header for mobile viewports

### Responsive Behavior

The layout system adapts to different screen sizes:

```tsx
// From components/layout/main-layout.tsx
function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <MobileHeader 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main className="flex-1">
          <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

## Course-Specific Components

These components are domain-specific for the training platform:

### Learning Components
- `VideoPlayer`: Handles playback of training videos
- `StepByStepGuide`: Displays numbered procedure steps
- `KnowledgeCheck`: Interactive quiz component
- `ResourceSidebar`: Shows additional learning materials

### Example: Step-by-Step Guide Component

```tsx
// From components/course/step-by-step-guide.tsx
interface StepByStepGuideProps {
  steps: Step[];
  note?: string;
}

export function StepByStepGuide({ steps, note }: StepByStepGuideProps) {
  return (
    <div className="space-y-4 mb-6">
      {steps.map((step) => (
        <div key={step.id} className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex-shrink-0 flex items-center justify-center font-semibold">
            {step.order}
          </div>
          <div className="ml-4">
            <h4 className="font-medium text-foreground">{step.title}</h4>
            <p className="text-muted-foreground mt-1">{step.description}</p>
          </div>
        </div>
      ))}
      
      {note && (
        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 text-yellow-800 dark:text-yellow-200 mt-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Important Note</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            {note}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## Theme Support

The platform supports light and dark themes:

```tsx
// From components/ui/theme-provider.tsx
const ThemeProvider = ({ children, defaultTheme = "light", storageKey = "theme" }) => {
  const [theme, setTheme] = useState(defaultTheme);
  
  // Load theme from storage
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme) setTheme(savedTheme);
  }, [storageKey]);
  
  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Common UI Patterns

### Progress Indicators

Progress is visualized consistently:

```tsx
function ModuleProgress({ completedLessons, totalLessons }) {
  const percentComplete = (completedLessons / totalLessons) * 100;
  
  return (
    <div>
      <Progress value={percentComplete} className="h-2 mb-2" />
      <p className="text-xs text-muted-foreground">
        {completedLessons} of {totalLessons} lessons completed
      </p>
    </div>
  );
}
```

### Status Badges

Status indicators use consistent styling:

```tsx
function StatusBadge({ status }) {
  const variant = {
    [MODULE_STATUS.COMPLETED]: "success",
    [MODULE_STATUS.IN_PROGRESS]: "warning",
    [MODULE_STATUS.LOCKED]: "secondary"
  }[status];
  
  return <Badge variant={variant}>{status}</Badge>;
}
```

## Component Documentation

Each component should include:

1. TypeScript interfaces for props
2. Default values for optional props
3. JSDoc comments explaining usage

Example:

```tsx
/**
 * VideoPlayer - Displays training video with title and controls
 * @param {string} url - URL to the video (YouTube or Vimeo)
 * @param {string} title - Video title displayed above player
 * @param {string} [description] - Optional description text
 */
interface VideoPlayerProps {
  url: string;
  title: string;
  description?: string;
}

export function VideoPlayer({ url, title, description }: VideoPlayerProps) {
  // Component implementation
}
```

## Testing Components

UI components should have tests for:
1. Rendering correctly with default props
2. Handling user interactions
3. Responding to prop changes

Example test:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button component', () => {
  test('renders with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Adding New Components

When adding new components:

1. Follow the existing naming and folder conventions
2. Use TypeScript for type safety
3. Implement responsive behavior by default
4. Support light and dark themes
5. Ensure accessibility compliance
6. Add appropriate tests

## Component Guidelines

- Prefer composition over inheritance
- Keep components focused on a single responsibility
- Use React Hooks for state and effects
- Follow the design system for consistent styling
- Ensure keyboard navigation works properly
- Include appropriate ARIA attributes for accessibility
