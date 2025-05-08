import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Settings,
  HelpCircle,
  Check,
  Play,
  Lock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { type User, type Module } from "@/lib/types";

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const { data: modules, isLoading } = useQuery({
    queryKey: ['/api/modules'],
    enabled: !!user
  });

  const { data: progressSummary } = useQuery({
    queryKey: ['/api/progress/summary'],
    enabled: !!user
  });

  // Close sidebar on navigation on mobile
  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // Get current module from location
  const getCurrentModuleId = () => {
    if (location.startsWith('/lesson/')) {
      // If we're on a lesson page, try to find the module from the API data
      const lessonId = parseInt(location.split('/')[2]);
      if (modules) {
        for (const module of modules) {
          const lesson = module.lessons?.find(l => l.id === lessonId);
          if (lesson) {
            return module.id;
          }
        }
      }
    }
    return null;
  };

  const currentModuleId = getCurrentModuleId();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-border flex-shrink-0 h-full overflow-hidden transition-all duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center p-6 border-b border-border">
          <img 
            src="https://images.unsplash.com/photo-1556229174-5e42a09e45af?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80" 
            alt="REGIMA Logo" 
            className="h-10 w-10 rounded-full"
          />
          <h1 className="ml-3 text-xl font-semibold text-primary">REGIMA TRAINING</h1>
        </div>

        {user ? (
          <>
            <div className="flex items-center p-4 bg-muted/50 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                <span>{user.name.split(' ').map(part => part[0]).join('')}</span>
              </div>
              <div className="ml-3">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.role}</p>
              </div>
            </div>

            <ScrollArea className="flex-grow sidebar-scroll">
              <div className="p-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Course Progress</h2>
                <Progress 
                  value={progressSummary?.percentComplete || 0} 
                  className="h-2 mb-4" 
                />
                <p className="text-sm text-muted-foreground mb-4">
                  {progressSummary ? 
                    `${progressSummary.completedModules} of ${progressSummary.totalModules} modules completed` : 
                    "Loading progress..."}
                </p>

                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Course Modules</h2>
                
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading modules...</p>
                ) : (
                  <ul className="space-y-1">
                    {modules?.map((module: Module) => {
                      const isCompleted = progressSummary?.completedModuleIds?.includes(module.id) || false;
                      const isCurrent = module.id === currentModuleId;
                      // Modules are unlocked if they are the first one, completed, or the previous one is completed
                      const prevModule = modules.find(m => m.order === module.order - 1);
                      const isUnlocked = module.order === 1 || isCompleted || 
                        !prevModule || progressSummary?.completedModuleIds?.includes(prevModule.id) || false;
                      
                      return (
                        <li key={module.id} className="module-item">
                          <Link 
                            href={isUnlocked ? `/modules/${module.id}` : "#"}
                            onClick={isUnlocked ? handleNavigation : undefined}
                            className={cn(
                              "flex items-center px-3 py-2 rounded-lg transition-colors",
                              isCompleted ? "text-gray-600 hover:bg-gray-100" :
                              isCurrent ? "bg-primary-light/10 text-primary border border-primary/20" :
                              isUnlocked ? "text-gray-600 hover:bg-gray-100" :
                              "text-gray-400"
                            )}
                          >
                            <span className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center mr-3",
                              isCompleted ? "bg-green-100 text-green-500" :
                              isCurrent ? "bg-primary/10 text-primary border border-primary/30" :
                              isUnlocked ? "bg-gray-100 text-gray-600" :
                              "bg-gray-100 text-gray-400"
                            )}>
                              {isCompleted ? <Check className="h-3 w-3" /> :
                               isCurrent ? <Play className="h-3 w-3" /> :
                               !isUnlocked ? <Lock className="h-3 w-3" /> : null}
                            </span>
                            <span>{module.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
              <Link href="/settings" className="flex items-center text-muted-foreground hover:text-foreground transition" onClick={handleNavigation}>
                <Settings className="h-4 w-4 mr-3" />
                <span>Settings</span>
              </Link>
              <Link href="/help" className="flex items-center text-muted-foreground hover:text-foreground transition mt-3" onClick={handleNavigation}>
                <HelpCircle className="h-4 w-4 mr-3" />
                <span>Help & Support</span>
              </Link>
            </div>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-6">
            <p className="text-center text-muted-foreground mb-4">
              Please log in to access your REGIMA training modules.
            </p>
          </div>
        )}
      </nav>
    </>
  );
}

export default Sidebar;
