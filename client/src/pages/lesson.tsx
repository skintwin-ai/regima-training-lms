import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { VideoPlayer } from "@/components/course/video-player";
import { StepByStepGuide } from "@/components/course/step-by-step-guide";
import { KnowledgeCheck } from "@/components/course/knowledge-check";
import { ResourceSidebar } from "@/components/course/resource-sidebar";
import { Button } from "@/components/ui/button";
import { ModuleHeader } from "@/components/course/module-header";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { type User } from "@/lib/types";

interface LessonProps {
  lessonId: number;
  user: User | null;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
}

export default function Lesson({ lessonId, user, onLogin, onLogout }: LessonProps) {
  const [, setLocation] = useLocation();

  // Fetch lesson data
  const { data: lessonData, isLoading } = useQuery({
    queryKey: [`/api/lessons/${lessonId}`],
    enabled: !!lessonId
  });

  // Fetch module data if lesson is loaded
  const { data: moduleData } = useQuery({
    queryKey: [`/api/modules/${lessonData?.moduleId}`],
    enabled: !!lessonData?.moduleId
  });

  // Navigate back if invalid lesson
  useEffect(() => {
    if (!isLoading && !lessonData) {
      setLocation('/');
    }
  }, [isLoading, lessonData, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Loading lesson content...</span>
      </div>
    );
  }

  if (!lessonData || !moduleData) {
    return null;
  }

  // Find previous and next lessons
  const currentLessonIndex = moduleData.lessons.findIndex((lesson: any) => lesson.id === lessonId);
  const previousLesson = currentLessonIndex > 0 ? moduleData.lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < moduleData.lessons.length - 1 ? moduleData.lessons[currentLessonIndex + 1] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 lg:py-10">
          {/* Module Header */}
          <ModuleHeader 
            module={moduleData} 
            currentLesson={lessonData} 
            userId={user?.id}
          />

          {/* Lesson Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Lesson Column */}
            <div className="lg:col-span-2">
              {/* Video Demonstration */}
              <VideoPlayer 
                title={lessonData.title}
                description={lessonData.description}
                thumbnailUrl={lessonData.videoUrl}
                videoUrl={lessonData.videoUrl}
                duration="12:45"
              />

              {/* Lesson Content */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Technique Overview</h2>
                
                <div className="prose prose-gray dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: lessonData.content }} 
                />
                
                <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">Key Benefits</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-2 mb-4">
                  <li>Reduces facial puffiness and swelling</li>
                  <li>Improves circulation and skin tone</li>
                  <li>Enhances product absorption</li>
                  <li>Promotes detoxification</li>
                  <li>Creates a relaxing experience for clients</li>
                </ul>
                
                <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">Step-by-Step Procedure</h3>
                
                <StepByStepGuide 
                  steps={lessonData.steps}
                  note="Lymphatic massage is contraindicated for clients with active infections, inflammation, or certain medical conditions. Always perform a thorough consultation before proceeding."
                />
              </div>
              
              {/* Practical Application */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Practical Demonstration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80" 
                      alt="Proper hand positioning for lymphatic drainage" 
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" 
                    />
                    <p className="text-sm text-muted-foreground mt-1">Proper hand positioning</p>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80" 
                      alt="Direction of movements for cheek drainage" 
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" 
                    />
                    <p className="text-sm text-muted-foreground mt-1">Directional movement pattern</p>
                  </div>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80" 
                      alt="Activation of key pressure points" 
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition" 
                    />
                    <p className="text-sm text-muted-foreground mt-1">Key pressure points</p>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-3 mt-6">Common Mistakes to Avoid</h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-2 mb-4">
                  <li><span className="font-medium">Excessive pressure</span> - Lymphatic massage should be extremely gentle</li>
                  <li><span className="font-medium">Incorrect direction</span> - Always move toward lymph nodes, not away</li>
                  <li><span className="font-medium">Skipping preparation</span> - Proper oil application prevents friction</li>
                  <li><span className="font-medium">Rushing the process</span> - Technique requires patience and proper timing</li>
                </ul>
              </div>
              
              {/* Knowledge Check Quiz */}
              {lessonData.quiz && (
                <KnowledgeCheck 
                  quiz={lessonData.quiz}
                  lessonId={lessonId}
                  moduleId={moduleData.id}
                  userId={user?.id}
                />
              )}
              
              {/* Next and Previous Buttons */}
              <div className="flex justify-between mt-6">
                {previousLesson ? (
                  <Button variant="outline" asChild>
                    <Link href={`/lesson/${previousLesson.id}`}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <span>Previous Lesson</span>
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    <span>Previous Lesson</span>
                  </Button>
                )}
                
                {nextLesson ? (
                  <Button asChild>
                    <Link href={`/lesson/${nextLesson.id}`}>
                      <span>Next Lesson</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/modules`}>
                      <span>Back to Modules</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
            
            {/* Sidebar Column */}
            <ResourceSidebar 
              lessonId={lessonId}
              resources={lessonData.resources}
              product={lessonData.product}
              userNote={lessonData.userNote?.content}
              userId={user?.id}
            />
          </div>
    </div>
  );
}
