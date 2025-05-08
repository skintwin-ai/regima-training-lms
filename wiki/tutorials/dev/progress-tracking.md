
# Progress Tracking Implementation Tutorial

## Introduction

This tutorial explains how the progress tracking system is implemented in the REGIMA Training Platform, helping developers understand, maintain, and extend this critical feature.

## System Overview

The progress tracking system monitors and records trainee advancement through the curriculum, enabling:
- Individual progress tracking
- Adaptive content unlocking
- Certification management
- Analytics and reporting

## Key Data Structures

### 1. Progress Schema

The core data structure for tracking user progress:

```typescript
// From client/src/lib/types.ts
export interface UserProgress {
  id: number;
  userId: number;
  lessonId: number;
  moduleId: number;
  completed: boolean;
  quizScore?: number;
  lastAccessedAt: Date;
  completedAt?: Date;
}

export interface ProgressSummary {
  completedModules: number;
  totalModules: number;
  percentComplete: number;
  completedModuleIds?: number[];
  lessonProgress?: Record<number, UserProgress>;
}
```

### 2. Frontend State Management

Progress data is managed using React Query for efficient caching and synchronization:

```typescript
// Example from a component
const { data: progressSummary } = useQuery({
  queryKey: ['/api/progress/summary'],
  enabled: !!user
});
```

## Implementation Walkthrough

### 1. Tracking Progress Events

Progress tracking begins when a user interacts with content:

1. **Lesson Viewing**:
   - When a user views a lesson, a progress record is created or updated
   - The `lastAccessedAt` timestamp is updated
   - This tracks which content has been accessed

2. **Knowledge Check Completion**:
   - When a user completes a quiz, their score is recorded
   - If the score meets the passing threshold, the lesson is marked as completed
   - The `quizScore` and `completedAt` fields are updated

### 2. Progress Calculation

Progress summaries are calculated by aggregating individual completion records:

1. **Module Completion Percentage**:
   - Count total lessons in the module
   - Count completed lessons
   - Calculate percentage: `(completed / total) * 100`

2. **Overall Progress**:
   - Count total modules in the curriculum
   - Count completed modules (all lessons finished)
   - Calculate percentage: `(completedModules / totalModules) * 100`

### 3. Progressive Unlocking

Content unlocking is implemented using completion status checks:

```typescript
// Example logic from modules.tsx
const isModuleUnlocked = (module: Module) => {
  if (!progressSummary) return module.order === 1;
  
  if (progressSummary.completedModuleIds?.includes(module.id)) return true;
  
  // First module is always unlocked
  if (module.order === 1) return true;
  
  // Find the previous module
  const prevModule = modules.find((m: Module) => m.order === module.order - 1);
  
  // If previous module doesn't exist or is completed, this one is unlocked
  return !prevModule || progressSummary.completedModuleIds?.includes(prevModule.id);
};
```

### 4. Frontend Progress Indicators

The UI displays progress through visual indicators:

1. **Progress Bars**:
   - Overall completion percentage
   - Module-specific completion

2. **Status Icons**:
   - Completed items show a checkmark
   - In-progress items show a half-filled circle
   - Locked items show a lock icon

3. **Conditional Rendering**:
   - Next buttons are enabled/disabled based on completion status
   - Content access is restricted until prerequisites are met

## Code Examples and Best Practices

### 1. Marking a Lesson as Complete

Here's the implementation of lesson completion:

```typescript
// Example of marking a lesson as complete
const markLessonComplete = async (lessonId, quizScore) => {
  try {
    await axios.post('/api/progress/lesson', {
      lessonId,
      completed: true,
      quizScore
    });
    
    // Invalidate queries to refresh progress data
    queryClient.invalidateQueries(['/api/progress/summary']);
    
    return true;
  } catch (error) {
    console.error('Error marking lesson as complete:', error);
    return false;
  }
};
```

### 2. Checking Module Prerequisites

Implementing prerequisite checking:

```typescript
// Example of checking prerequisites
const hasCompletedPrerequisites = (moduleId) => {
  if (!progressSummary) return false;
  
  const module = modules.find(m => m.id === moduleId);
  
  if (!module?.prerequisites?.length) return true;
  
  return module.prerequisites.every(prerequisiteId => 
    progressSummary.completedModuleIds?.includes(prerequisiteId)
  );
};
```

### 3. Progress Reset Functionality

For testing or administrative purposes:

```typescript
// Example of resetting progress
const resetProgress = async (userId, moduleId) => {
  try {
    await axios.delete(`/api/progress/module/${moduleId}`, {
      data: { userId }
    });
    
    // Invalidate queries to refresh progress data
    queryClient.invalidateQueries(['/api/progress/summary']);
    
    return true;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return false;
  }
};
```

## Testing Progress Tracking

### 1. Unit Testing

Progress calculations should be thoroughly tested:

```typescript
// Example test for progress calculation
test('calculates progress percentage correctly', () => {
  const mockProgress = {
    lessonProgress: {
      1: { completed: true },
      2: { completed: true },
      3: { completed: false },
      4: { completed: false }
    }
  };
  
  const result = calculateLessonProgress(mockProgress, 1); // moduleId = 1
  expect(result).toBe(50); // 50%
});
```

### 2. Integration Testing

Test the full progress flow:

```typescript
// Example integration test
test('marks lesson as complete when quiz passed', async () => {
  // Setup
  await loginTestUser();
  
  // Action
  const response = await axios.post('/api/progress/lesson', {
    lessonId: 1,
    completed: true,
    quizScore: 80
  });
  
  // Verify
  expect(response.status).toBe(200);
  
  // Check progress was updated
  const progress = await axios.get('/api/progress/summary');
  expect(progress.data.lessonProgress[1].completed).toBe(true);
});
```

## Common Issues and Solutions

1. **Progress Not Updating**:
   - Check that events are being correctly triggered
   - Verify API calls are completing successfully
   - Ensure query invalidation is working properly

2. **Incorrect Unlocking Behavior**:
   - Debug prerequisite checking logic
   - Verify the module order values are correct
   - Check for edge cases in sequential unlocking

3. **Performance Issues**:
   - Optimize queries to minimize unnecessary progress calculations
   - Use caching for frequently accessed progress summaries
   - Consider lazy loading progress data for inactive modules

## Next Steps

Now that you understand the progress tracking system, explore the [Working with UI Components](/wiki/tutorials/dev/ui-components.md) tutorial to learn how the user interface is structured.
