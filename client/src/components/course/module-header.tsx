import { Bookmark, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type Module, type Lesson } from "@/lib/types";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ModuleHeaderProps {
  module: Module;
  currentLesson: Lesson;
  userId?: number;
}

export function ModuleHeader({ module, currentLesson, userId }: ModuleHeaderProps) {
  const { toast } = useToast();

  const { data: progressData } = useQuery({
    queryKey: ['/api/progress/summary'],
    enabled: !!userId
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/progress', {
        moduleId: module.id,
        lessonId: currentLesson.id,
        completed: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress/summary'] });
      toast({
        title: "Progress saved",
        description: "Your progress has been saved successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Calculate lesson progress within module
  const getLessonProgress = () => {
    if (!module.lessons || module.lessons.length === 0) return { percent: 0, completed: 0, total: 0 };
    
    const totalLessons = module.lessons.length;
    let completedLessons = 0;
    
    if (progressData?.lessonProgress) {
      module.lessons.forEach(lesson => {
        if (progressData.lessonProgress[lesson.id]?.completed) {
          completedLessons++;
        }
      });
    }
    
    const percent = Math.round((completedLessons / totalLessons) * 100);
    
    return {
      percent,
      completed: completedLessons,
      total: totalLessons
    };
  };

  const progress = getLessonProgress();

  const handleSaveProgress = () => {
    if (userId) {
      saveProgressMutation.mutate();
    } else {
      toast({
        title: "Not logged in",
        description: "Please log in to save your progress.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              Module {module.order} of {progressData?.totalModules || 12}
            </span>
            <span className="ml-3 text-xs text-muted-foreground">
              Estimated time: {module.estimatedTime}
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-2 text-foreground">{module.title}</h1>
          <p className="text-muted-foreground mt-1">{module.description}</p>
        </div>
        <div className="flex mt-4 md:mt-0">
          <Button variant="outline" className="mr-2">
            <Download className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Resources</span>
          </Button>
          <Button
            onClick={handleSaveProgress}
            disabled={saveProgressMutation.isPending}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Save Progress</span>
          </Button>
        </div>
      </div>
      
      <div className="mt-6">
        <Progress value={progress.percent} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Progress: {progress.percent}%</span>
          <span>{progress.completed} of {progress.total} lessons completed</span>
        </div>
      </div>
    </div>
  );
}

export default ModuleHeader;
