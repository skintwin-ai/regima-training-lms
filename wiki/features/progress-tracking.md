
# Progress Tracking System

The progress tracking system monitors user advancement through the REGIMA training curriculum and provides visual feedback on completion status.

## Core Functionality

- **Module Completion Tracking**: Records which modules have been completed
- **Lesson Progress**: Tracks individual lesson completion within modules
- **Quiz Results**: Records performance on knowledge check assessments
- **Overall Progress Calculation**: Computes percentage of curriculum completed

## API Endpoints

- **/api/progress**: Update user progress for lessons and modules
- **/api/progress/summary**: Get overview of user's training progress
- **/api/notes**: Store user notes for specific lessons
- **/api/feedback**: Record user feedback on lesson content
- **/api/certificates**: Manage earned certificates

## Visual Indicators

- **Progress Bars**: Show completion percentage for curriculum
- **Status Badges**: Indicate completed, in-progress, or locked content
- **Color-Coding**: Visual differentiation of completion states
- **Module Counters**: "X of Y modules completed" displays

## Progressive Unlocking

- Automatic unlocking of new modules based on completion of prerequisites
- Clear visual indicators for locked vs. available content
- Logical progression through the curriculum
