
# Working with UI Components Tutorial

## Introduction

This tutorial explains the UI component architecture in the REGIMA Training Platform, helping developers understand how to use, modify, and create components.

## Component Library Overview

The platform uses a three-tiered component architecture:

1. **Base UI Components**: Foundational components from a design system
2. **Domain-Specific Components**: Components specific to training functionality
3. **Page Components**: Full page assemblies using the component library

## Setting Up Your Development Environment

Before working with components:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the component documentation (if available):
   ```bash
   npm run storybook
   ```

## Base UI Components

Located in `client/src/components/ui/`, these components provide consistent styling and behavior:

### Key Base Components

- **Button**: Standard button with variants
- **Card**: Container for grouped content
- **Input**: Text input field
- **Progress**: Progress indicators and bars
- **Tabs**: Tabbed content containers

### Example: Using the Button Component

```tsx
// Import the button component
import { Button } from "@/components/ui/button";

// Use in your component
function MyComponent() {
  return (
    <div>
      <Button variant="default">Primary Action</Button>
      <Button variant="outline">Secondary Action</Button>
      <Button variant="ghost">Tertiary Action</Button>
    </div>
  );
}
```

### Theming and Variants

The base components support theming:

1. **Colors**: Primary, secondary, accent, and neutral palettes
2. **Variants**: Different visual styles (default, outline, ghost)
3. **Sizes**: Different size options (small, medium, large)

## Course-Specific Components

Located in `client/src/components/course/`, these components are tailored for training content:

### Key Course Components

- **VideoPlayer**: Handles training video playback
- **StepByStepGuide**: Displays numbered procedure steps
- **KnowledgeCheck**: Interactive quiz component
- **ResourceSidebar**: Shows additional learning resources

### Example: Using the VideoPlayer Component

```tsx
// Import the video player component
import { VideoPlayer } from "@/components/course/video-player";

// Use in your component
function LessonMedia() {
  return (
    <VideoPlayer
      title="Facial Massage Technique"
      description="Learn the proper technique for lymphatic drainage massage"
      thumbnailUrl="/images/massage-thumbnail.jpg"
      videoUrl="https://example.com/videos/facial-massage.mp4"
      duration="12:45"
    />
  );
}
```

## Layout Components

Layout components handle the application structure:

### Key Layout Components

- **MainLayout**: The primary layout wrapper
- **Sidebar**: Navigation sidebar with responsive behavior
- **MobileHeader**: Header for mobile viewports

### Example: Using the MainLayout Component

```tsx
// Import the layout components
import { MainLayout } from "@/components/layout/main-layout";

// Use in your page component
function ModulePage() {
  return (
    <MainLayout>
      <h1>Module Title</h1>
      <p>Module content goes here...</p>
    </MainLayout>
  );
}
```

## State Management in Components

Components handle state in different ways:

1. **Local State**: Using React's `useState` for component-specific state
2. **Context**: Using React Context for shared state
3. **Server State**: Using React Query for data fetching and caching

### Example: State Management in a Component

```tsx
// Import hooks
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Component with state management
function LessonContent({ lessonId }) {
  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  
  // Server state
  const { data: lessonData, isLoading } = useQuery({
    queryKey: [`/api/lessons/${lessonId}`],
    enabled: !!lessonId
  });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Step-by-Step</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <h2>{lessonData.title}</h2>
          <p>{lessonData.description}</p>
        </TabsContent>
        <TabsContent value="steps">
          <StepByStepGuide steps={lessonData.steps} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Creating New Components

To create a new component:

1. **Determine Component Type**:
   - Is it a general UI component or domain-specific?
   - Choose the appropriate directory

2. **Create the Component File**:
   ```tsx
   // Example: client/src/components/course/feedback-form.tsx
   import { useState } from 'react';
   import { Button } from '@/components/ui/button';
   import { Textarea } from '@/components/ui/textarea';
   
   interface FeedbackFormProps {
     lessonId: number;
     onSubmit: (feedback: string) => Promise<void>;
   }
   
   export function FeedbackForm({ lessonId, onSubmit }: FeedbackFormProps) {
     const [feedback, setFeedback] = useState('');
     const [isSubmitting, setIsSubmitting] = useState(false);
     
     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       setIsSubmitting(true);
       
       try {
         await onSubmit(feedback);
         setFeedback('');
       } catch (error) {
         console.error('Error submitting feedback:', error);
       } finally {
         setIsSubmitting(false);
       }
     };
     
     return (
       <form onSubmit={handleSubmit}>
         <Textarea
           value={feedback}
           onChange={(e) => setFeedback(e.target.value)}
           placeholder="Share your thoughts on this lesson..."
           className="min-h-32 mb-4"
         />
         <Button type="submit" disabled={isSubmitting || !feedback.trim()}>
           {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
         </Button>
       </form>
     );
   }
   ```

3. **Use the Component**:
   ```tsx
   import { FeedbackForm } from '@/components/course/feedback-form';
   
   function LessonPage({ lessonId }) {
     const handleFeedbackSubmit = async (feedback) => {
       await fetch('/api/feedback', {
         method: 'POST',
         body: JSON.stringify({ lessonId, feedback }),
         headers: { 'Content-Type': 'application/json' }
       });
     };
     
     return (
       <div>
         {/* Other lesson content */}
         <h2>Feedback</h2>
         <FeedbackForm lessonId={lessonId} onSubmit={handleFeedbackSubmit} />
       </div>
     );
   }
   ```

## Testing Components

Components should be tested to ensure proper functionality:

1. **Unit Testing**:
   ```tsx
   // Example test file
   import { render, screen, fireEvent } from '@testing-library/react';
   import { FeedbackForm } from './feedback-form';
   
   test('renders feedback form', () => {
     const mockSubmit = jest.fn();
     render(<FeedbackForm lessonId={1} onSubmit={mockSubmit} />);
     
     expect(screen.getByPlaceholderText('Share your thoughts')).toBeInTheDocument();
   });
   
   test('submits feedback when form is filled and submitted', async () => {
     const mockSubmit = jest.fn().mockResolvedValue(undefined);
     render(<FeedbackForm lessonId={1} onSubmit={mockSubmit} />);
     
     fireEvent.change(screen.getByPlaceholderText('Share your thoughts'), {
       target: { value: 'This was a great lesson!' }
     });
     
     fireEvent.click(screen.getByText('Submit Feedback'));
     
     expect(mockSubmit).toHaveBeenCalledWith('This was a great lesson!');
   });
   ```

2. **Visual Testing**:
   - Use Storybook to visually test components in isolation
   - Create stories for different component states and variants

## Component Best Practices

1. **Composition Over Inheritance**:
   - Build complex components by composing smaller ones
   - Favor functional composition patterns

2. **Props Interface**:
   - Define clear TypeScript interfaces for component props
   - Document props with JSDoc comments

3. **Responsive Design**:
   - Ensure components work on all screen sizes
   - Use responsive utility classes from the CSS framework

4. **Accessibility**:
   - Include proper ARIA attributes
   - Ensure keyboard navigation works
   - Test with screen readers

5. **Performance**:
   - Memoize expensive components with `React.memo`
   - Use callback memoization with `useCallback`
   - Optimize re-renders by managing state efficiently

## Component Documentation

When creating new components, include documentation:

```tsx
/**
 * FeedbackForm - Collects user feedback for a specific lesson
 * 
 * @param {number} lessonId - The ID of the lesson being rated
 * @param {function} onSubmit - Callback function when feedback is submitted
 * 
 * @example
 * <FeedbackForm 
 *   lessonId={123}
 *   onSubmit={(feedback) => saveFeedback(123, feedback)}
 * />
 */
export function FeedbackForm({ lessonId, onSubmit }: FeedbackFormProps) {
  // Component implementation
}
```

## Next Steps

Now that you understand the UI component architecture, you are ready to maintain and extend the REGIMA platform interface. Refer to the [Architecture Tutorial](/wiki/tutorials/dev/architecture.md) for insights into how these components fit into the overall system.
