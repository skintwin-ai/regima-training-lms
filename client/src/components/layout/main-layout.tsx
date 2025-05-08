import React from "react";
import { Link } from "wouter";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  ChevronDown, 
  User as UserIcon, 
  LogOut, 
  Menu,
  Home,
  Book,
  Beaker,
  FileText,
  ShoppingBag
} from "lucide-react";
import { DEFAULT_USER_AVATAR } from "@/lib/constants";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  user: User | null;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onLogout: () => Promise<void>;
  title?: string;
  children: React.ReactNode;
}

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export function MainLayout({ user, onLogin, onLogout, title, children }: MainLayoutProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    const success = await onLogin(values.username, values.password);
    setIsSubmitting(false);
    if (success) {
      setIsLoginOpen(false);
      form.reset();
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] p-0">
                  <div className="px-6 pt-6 pb-4 border-b">
                    <h2 className="text-lg font-semibold">REGIMA Training</h2>
                  </div>
                  <nav className="px-2 py-4">
                    <ul className="space-y-1">
                      <li>
                        <Link href="/">
                          <a className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent">
                            <Home size={16} className="mr-2" />
                            Dashboard
                          </a>
                        </Link>
                      </li>
                      <li>
                        <Link href="/modules">
                          <a className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent">
                            <Book size={16} className="mr-2" />
                            Modules
                          </a>
                        </Link>
                      </li>
                      <li>
                        <Link href="/ingredients">
                          <a className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent">
                            <Beaker size={16} className="mr-2" />
                            Ingredients Guide
                          </a>
                        </Link>
                      </li>
                      <li>
                        <Link href="/products">
                          <a className="flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent">
                            <ShoppingBag size={16} className="mr-2" />
                            Products Catalog
                          </a>
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
            
            <Link href="/">
              <a className="font-bold text-lg">
                REGIMA Training
              </a>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-2">
                <li>
                  <Link href="/">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                </li>
                <li>
                  <Link href="/modules">
                    <Button variant="ghost">Modules</Button>
                  </Link>
                </li>
                <li>
                  <Link href="/ingredients">
                    <Button variant="ghost">Ingredients Guide</Button>
                  </Link>
                </li>
                <li>
                  <Link href="/products">
                    <Button variant="ghost">Products Catalog</Button>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <img
                      src={DEFAULT_USER_AVATAR}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <p>{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <a className="flex items-center cursor-pointer w-full">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Profile
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onLogout()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => setIsLoginOpen(true)}>
                Log In
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        {title && (
          <div className="bg-muted py-6">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          </div>
        )}
        
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-muted py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} REGIMA SKIN TREATMENTS. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log In to REGIMA Training</DialogTitle>
            <DialogDescription>
              Enter your credentials to access training content.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging In..." : "Log In"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}