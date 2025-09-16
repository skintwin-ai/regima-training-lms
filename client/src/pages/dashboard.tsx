import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Medal, Book, UserCircle, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type User } from "@/lib/types";

interface DashboardProps {
  user: User | null;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
}

export default function Dashboard({ user, onLogin, onLogout }: DashboardProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { data: modules } = useQuery({
    queryKey: ['/api/modules'],
    enabled: !!user
  });
  
  const { data: progressSummary } = useQuery({
    queryKey: ['/api/progress/summary'],
    enabled: !!user
  });
  
  const { data: certificates } = useQuery({
    queryKey: ['/api/certificates'],
    enabled: !!user
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      await onLogin(username, password);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 lg:py-10">
            {user ? (
              <>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Welcome, {user.name}</h1>
                    <p className="text-muted-foreground">Continue your REGIMA skincare training journey</p>
                  </div>
                  <Button variant="outline" onClick={onLogout} className="mt-4 md:mt-0">
                    Logout
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Book className="mr-2 h-5 w-5 text-primary" />
                        Course Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <Progress value={progressSummary?.percentComplete || 0} className="h-2" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {progressSummary ? 
                          `${progressSummary.completedModules} of ${progressSummary.totalModules} modules completed` : 
                          "Start your training journey"}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href="/modules">
                          Continue Training
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Medal className="mr-2 h-5 w-5 text-primary" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{certificates?.length || 0}</p>
                      <p className="text-sm text-muted-foreground">Certificates earned</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Certificates
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <UserCircle className="mr-2 h-5 w-5 text-primary" />
                        Profile
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.role}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Edit Profile
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <Tabs defaultValue="current">
                  <TabsList className="mb-4">
                    <TabsTrigger value="current">Current Modules</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="current" className="space-y-4">
                    {modules?.slice(0, 3).map((module: any) => (
                      <Card key={module.id}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Module {module.order}</p>
                              <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                              <p className="text-muted-foreground mb-4">{module.description}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <span className="mr-4">⏱️ {module.estimatedTime}</span>
                              </div>
                            </div>
                            <Button asChild>
                              <Link href={`/modules/${module.id}`}>
                                Start Module <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="text-center mt-6">
                      <Button asChild variant="outline">
                        <Link href="/modules">
                          View All Modules
                        </Link>
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="upcoming" className="space-y-4">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                        <p className="text-muted-foreground">Complete your current modules to unlock more content</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="completed" className="space-y-4">
                    {progressSummary?.completedModuleIds?.length ? (
                      modules?.filter((m: any) => progressSummary.completedModuleIds.includes(m.id)).map((module: any) => (
                        <Card key={module.id}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center mb-1">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                  <p className="text-sm text-green-600">Completed</p>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                                <p className="text-muted-foreground">{module.description}</p>
                              </div>
                              <Button variant="outline" asChild>
                                <Link href={`/modules/${module.id}`}>
                                  Review Module
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                          <p className="text-muted-foreground">You haven't completed any modules yet</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex justify-center items-center min-h-[80vh]">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">REGIMA Training Portal</CardTitle>
                    <CardDescription className="text-center">
                      Log in to access your skincare training modules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input 
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input 
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoggingIn}>
                          {isLoggingIn ? "Logging in..." : "Log In"}
                        </Button>
                      </div>
                    </form>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      <p>Use "demo" as username and "password" as password to access the demo account.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
    </div>
  );
}
