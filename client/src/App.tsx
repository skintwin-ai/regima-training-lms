import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Lesson from "@/pages/lesson";
import Modules from "@/pages/modules";
import Ingredients from "@/pages/ingredients";
import Products from "@/pages/products";
import About from "@/pages/about";
import Help from "@/pages/help";
import { useState, useEffect } from "react";
import { apiRequest } from "./lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

function Router() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      const userData = await res.json();
      setUser(userData);
      setLocation('/');
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
      return true;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
      setLocation('/');
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Loading REGIMA Training...</p>
      </div>
    );
  }

  return (
    <AppLayout user={user} onLogin={handleLogin} onLogout={handleLogout}>
      <Switch>
        <Route path="/">
          <Dashboard user={user} onLogin={handleLogin} onLogout={handleLogout} />
        </Route>
        <Route path="/modules">
          <Modules user={user} onLogin={handleLogin} onLogout={handleLogout} />
        </Route>
        <Route path="/lesson/:id">
          {(params) => <Lesson lessonId={parseInt(params.id)} user={user} onLogin={handleLogin} onLogout={handleLogout} />}
        </Route>
        <Route path="/ingredients">
          <Ingredients user={user} onLogin={handleLogin} onLogout={handleLogout} />
        </Route>
        <Route path="/products">
          <Products user={user} onLogin={handleLogin} onLogout={handleLogout} />
        </Route>
        <Route path="/about">
          <About />
        </Route>
        <Route path="/help">
          <Help />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
