import { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Clock, CheckCircle, Lock, PlayCircle, Loader2 } from "lucide-react";
import { type User, type Module } from "@/lib/types";

interface ModulesProps {
  user: User | null;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
}

export default function Modules({ user, onLogin, onLogout }: ModulesProps) {
  const params = useParams();
  const [, setLocation] = useLocation();
  
  const { data: modules, isLoading: isLoadingModules } = useQuery({
    queryKey: ['/api/modules'],
    enabled: !!user
  });
  
  const { data: progressSummary } = useQuery({
    queryKey: ['/api/progress/summary'],
    enabled: !!user
  });
  
  // If a specific module ID is provided in the URL, fetch that module
  const moduleId = params.id ? parseInt(params.id) : null;
  
  const { data: moduleDetail, isLoading: isLoadingModuleDetail } = useQuery({
    queryKey: [`/api/modules/${moduleId}`],
    enabled: !!moduleId && !!user
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoadingModules) {
      setLocation('/');
    }
  }, [user, isLoadingModules, setLocation]);
  
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2">Redirecting to login...</span>
      </div>
    );
  }
  
  // Determine if a module is unlocked (first module, or previous module is completed)
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 lg:py-10">
          {moduleId && moduleDetail ? (
            // Single module view with lessons
            <>
              <div className="mb-6">
                <Link href="/modules" className="text-primary hover:underline mb-4 inline-block">
                  ← Back to all modules
                </Link>
                <h1 className="text-3xl font-bold text-foreground">{moduleDetail.title}</h1>
                <p className="text-muted-foreground mt-2">{moduleDetail.description}</p>
                
                <div className="flex items-center mt-4">
                  <Clock className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm text-muted-foreground">{moduleDetail.estimatedTime}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {moduleDetail.lessons && moduleDetail.lessons.map((lesson: any, index: number) => {
                  // Determine if this lesson is unlocked based on previous lesson completion
                  const isFirstLesson = index === 0;
                  const prevLessonCompleted = index > 0 
                    ? progressSummary?.lessonProgress?.[moduleDetail.lessons[index-1].id]?.completed
                    : true;
                  const isCompleted = progressSummary?.lessonProgress?.[lesson.id]?.completed;
                  const isUnlocked = isFirstLesson || prevLessonCompleted || isCompleted;
                  
                  return (
                    <Card key={lesson.id} className={`border ${isUnlocked ? 'border-border' : 'border-muted'}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            {isCompleted ? (
                              <div className="flex items-center text-green-600 mb-2">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">Completed</span>
                              </div>
                            ) : isUnlocked ? (
                              <div className="flex items-center text-primary mb-2">
                                <PlayCircle className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">Ready to start</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-muted-foreground mb-2">
                                <Lock className="h-4 w-4 mr-2" />
                                <span className="text-sm font-medium">Locked</span>
                              </div>
                            )}
                            <h3 className="text-lg font-semibold">{lesson.title}</h3>
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{lesson.description}</p>
                          </div>
                          
                          {isUnlocked ? (
                            <Button asChild size="sm" variant={isCompleted ? "outline" : "default"}>
                              <Link href={`/lesson/${lesson.id}`}>
                                {isCompleted ? "Review" : "Start"}
                              </Link>
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              Locked
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            // All modules view
            <>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">REGIMA Training Modules</h1>
                  <p className="text-muted-foreground">Complete all modules to become a certified REGIMA specialist</p>
                </div>
                
                {progressSummary && (
                  <div className="mt-4 md:mt-0 bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                    <Progress value={progressSummary.percentComplete} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      {progressSummary.completedModules} of {progressSummary.totalModules} modules completed
                    </p>
                  </div>
                )}
              </div>
              
              {isLoadingModules ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading modules...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {modules?.map((module: Module) => {
                    const isCompleted = progressSummary?.completedModuleIds?.includes(module.id);
                    const unlocked = isModuleUnlocked(module);
                    
                    return (
                      <Card 
                        key={module.id} 
                        className={`border ${unlocked ? 'border-border' : 'border-muted'} ${isCompleted ? 'bg-green-50/50 dark:bg-green-950/10' : ''}`}
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                {isCompleted ? (
                                  <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full">
                                    Completed
                                  </span>
                                ) : unlocked ? (
                                  <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                                    Module {module.order} of {modules.length}
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold bg-muted text-muted-foreground px-3 py-1 rounded-full">
                                    Locked
                                  </span>
                                )}
                                <span className="ml-3 text-xs text-muted-foreground">
                                  Estimated time: {module.estimatedTime}
                                </span>
                              </div>
                              
                              <h2 className="text-xl font-semibold text-foreground">{module.title}</h2>
                              <p className="text-muted-foreground mt-1">{module.description}</p>
                            </div>
                            
                            <div className="mt-4 md:mt-0 md:ml-6">
                              <Button 
                                asChild={unlocked} 
                                disabled={!unlocked}
                                size="lg"
                                variant={isCompleted ? "outline" : "default"}
                              >
                                {unlocked ? (
                                  <Link href={`/modules/${module.id}`}>
                                    {isCompleted ? "Review Module" : "Start Module"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                  </Link>
                                ) : (
                                  <span>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Complete Previous Module
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
    </div>
  );
}
