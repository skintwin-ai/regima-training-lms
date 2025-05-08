
# Progress Tracking Implementation

This technical guide explains how the progress tracking system is implemented in the REGIMA Training Platform.

## Data Model

The progress tracking system relies on the following database entities:

```typescript
// User progress types
interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  completedAt: Date;
  quizScore: number | null;
}

interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  lastAccessedAt: Date;
  completedAt: Date | null;
  timeSpentSeconds: number;
}

interface QuizAttempt {
  id: string;
  userId: string;
  lessonId: string;
  score: number;
  completedAt: Date;
  passed: boolean;
}

interface Certificate {
  id: string;
  userId: string;
  type: string;
  issuedAt: Date;
  expiresAt: Date | null;
  verificationCode: string;
}
```

## API Endpoints

### Progress Update Endpoints

```typescript
// Update lesson progress
POST /api/progress/lesson
Body: {
  lessonId: string;
  status: 'in_progress' | 'completed';
  timeSpentSeconds?: number;
}

// Submit quiz attempt
POST /api/progress/quiz
Body: {
  lessonId: string;
  answers: { questionId: string, answerId: string }[];
}

// Get progress summary
GET /api/progress/summary
Response: {
  percentComplete: number;
  completedModules: number;
  totalModules: number;
  completedModuleIds: string[];
}
```

## Progress Calculation Logic

### Module Completion

A module is considered complete when:

1. All lessons within the module are marked as completed
2. All required quizzes have been passed

Implementation:

```typescript
function isModuleComplete(userId: string, moduleId: string): boolean {
  const lessons = getLessonsForModule(moduleId);
  const lessonProgress = getLessonProgressForUser(userId, lessons.map(l => l.id));
  
  // Check if all lessons are completed
  const allLessonsCompleted = lessons.every(lesson => {
    const progress = lessonProgress.find(p => p.lessonId === lesson.id);
    return progress && progress.status === 'completed';
  });
  
  // Check if all quizzes are passed
  const quizzes = getQuizzesForModule(moduleId);
  const quizAttempts = getQuizAttemptsForUser(userId, quizzes.map(q => q.lessonId));
  
  const allQuizzesPassed = quizzes.every(quiz => {
    const attempts = quizAttempts.filter(a => a.lessonId === quiz.lessonId);
    return attempts.some(a => a.passed);
  });
  
  return allLessonsCompleted && allQuizzesPassed;
}
```

### Overall Progress Calculation

The overall progress percentage is calculated as:

```typescript
function calculateOverallProgress(userId: string): number {
  const modules = getAllModules();
  const completedModuleCount = modules.filter(module => 
    isModuleComplete(userId, module.id)
  ).length;
  
  return (completedModuleCount / modules.length) * 100;
}
```

## Progressive Unlocking System

The system enforces a sequential progression through modules:

```typescript
function isModuleUnlocked(userId: string, moduleId: string): boolean {
  const module = getModule(moduleId);
  
  // First module is always unlocked
  if (module.order === 1) return true;
  
  // Get the previous module
  const previousModule = getModuleByOrder(module.order - 1);
  
  // Check if previous module is completed
  return isModuleComplete(userId, previousModule.id);
}
```

## Client-Side Implementation

The client uses React Query to fetch and cache progress data:

```typescript
// Custom hook for user progress
function useUserProgress() {
  return useQuery('progressSummary', async () => {
    const response = await fetch('/api/progress/summary');
    if (!response.ok) throw new Error('Failed to fetch progress');
    return response.json();
  });
}

// Example usage in a component
function ProgressIndicator() {
  const { data: progressSummary, isLoading } = useUserProgress();
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      <Progress value={progressSummary.percentComplete} className="h-2" />
      <p>
        {progressSummary.completedModules} of {progressSummary.totalModules} modules completed
      </p>
    </div>
  );
}
```

## Status Indicators

Visual indicators use constants to maintain consistency:

```typescript
// From lib/constants.ts
export const MODULE_STATUS = {
  COMPLETED: "completed",
  IN_PROGRESS: "in-progress",
  LOCKED: "locked"
};

// Usage in components
function ModuleCard({ module, status }) {
  return (
    <Card>
      <CardContent>
        <h3>{module.title}</h3>
        <Badge variant={
          status === MODULE_STATUS.COMPLETED ? "success" :
          status === MODULE_STATUS.IN_PROGRESS ? "warning" :
          "secondary"
        }>
          {status}
        </Badge>
      </CardContent>
    </Card>
  );
}
```

## Certificate Generation

When a user completes all modules, a certificate is generated:

```typescript
async function generateCertificate(userId: string) {
  // Check if all modules are complete
  const modules = getAllModules();
  const allComplete = modules.every(module => isModuleComplete(userId, module.id));
  
  if (!allComplete) {
    throw new Error('Cannot generate certificate: not all modules are complete');
  }
  
  // Generate a unique verification code
  const verificationCode = generateUniqueCode();
  
  // Calculate expiration (1 year from now)
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  
  // Create certificate record
  const certificate = await createCertificate({
    userId,
    type: 'REGIMA_SPECIALIST',
    issuedAt: new Date(),
    expiresAt,
    verificationCode
  });
  
  return certificate;
}
```

## Testing the Progress System

The progress tracking system includes automated tests:

```typescript
describe('Progress Tracking', () => {
  test('Module is marked complete when all lessons are done', async () => {
    // Setup test user and progress data
    const userId = 'test-user';
    const moduleId = 'module-1';
    
    // Complete all lessons
    const lessons = await getLessonsForModule(moduleId);
    for (const lesson of lessons) {
      await updateLessonProgress(userId, lesson.id, 'completed');
    }
    
    // Pass all quizzes
    const quizzes = await getQuizzesForModule(moduleId);
    for (const quiz of quizzes) {
      await submitPassingQuizAttempt(userId, quiz.lessonId);
    }
    
    // Check if module is complete
    const isComplete = await isModuleComplete(userId, moduleId);
    expect(isComplete).toBe(true);
  });
});
```

## Performance Considerations

The progress system is optimized for:

1. Minimizing database queries through caching
2. Batch updates for multiple lesson completions
3. Efficient progress calculation for dashboard display

## Integration Points

The progress tracking system integrates with:
- Authentication system to identify users
- Content system to know what modules/lessons exist
- Certification system to issue certificates upon completion

## Future Enhancements

Planned improvements for the progress tracking system:
- Analytics for learning patterns
- Team progress tracking for organizations
- Adaptive learning paths based on progress
- Refresher recommendations for completed modules
