import React from "react";
import { Link, useLocation } from "wouter";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/components/ui/theme-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Menu,
  Home,
  Book,
  Beaker,
  ShoppingBag,
  Info,
  HelpCircle,
  UserIcon,
  LogOut,
  Sun,
  Moon,
  Shield
} from "lucide-react";
import { DEFAULT_USER_AVATAR } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TopNavigationProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => Promise<void>;
}

// Centralized navigation items
const navItems = [
  { 
    label: "Dashboard", 
    href: "/", 
    icon: Home, 
    testId: "link-dashboard",
    category: "training" 
  },
  { 
    label: "Modules", 
    href: "/modules", 
    icon: Book, 
    testId: "link-modules",
    category: "training" 
  },
  { 
    label: "Ingredients", 
    href: "/ingredients", 
    icon: Beaker, 
    testId: "link-ingredients",
    category: "training" 
  },
  { 
    label: "Products", 
    href: "/products", 
    icon: ShoppingBag, 
    testId: "link-products",
    category: "training" 
  },
  { 
    label: "About REGIMA", 
    href: "/about", 
    icon: Info, 
    testId: "link-about",
    category: "info" 
  },
  { 
    label: "Help Center", 
    href: "/help", 
    icon: HelpCircle, 
    testId: "link-help",
    category: "info" 
  },
];

export function TopNavigation({ user, onLogin, onLogout }: TopNavigationProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const trainingItems = navItems.filter(item => item.category === "training");
  const infoItems = navItems.filter(item => item.category === "info");

  return (
    <header className="bg-secondary border-b-2 border-primary/20 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center space-x-3">
            {isMobile && (
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden text-secondary-foreground hover:bg-primary/10"
                    data-testid="button-mobile-menu"
                  >
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0 bg-background">
                  <div className="px-6 pt-6 pb-4 bg-secondary text-secondary-foreground">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-8 w-8 text-primary" />
                      <h2 className="text-xl font-bold">REGIMA</h2>
                    </div>
                  </div>
                  
                  <nav className="px-2 py-4">
                    {/* Training Portal Section */}
                    <div className="mb-4">
                      <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Training Portal
                      </h3>
                      <ul className="space-y-1">
                        {trainingItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location === item.href;
                          return (
                            <li key={item.href}>
                              <Link 
                                href={item.href}
                                className={cn(
                                  "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                                  isActive 
                                    ? "bg-primary text-primary-foreground" 
                                    : "hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => setIsSheetOpen(false)}
                                data-testid={item.testId}
                              >
                                <Icon size={16} className="mr-2" />
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Information Section */}
                    <div className="mb-4">
                      <h3 className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Information
                      </h3>
                      <ul className="space-y-1">
                        {infoItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = location === item.href;
                          return (
                            <li key={item.href}>
                              <Link 
                                href={item.href}
                                className={cn(
                                  "flex items-center px-4 py-2 text-sm rounded-md transition-colors",
                                  isActive 
                                    ? "bg-primary text-primary-foreground" 
                                    : "hover:bg-accent hover:text-accent-foreground"
                                )}
                                onClick={() => setIsSheetOpen(false)}
                                data-testid={item.testId}
                              >
                                <Icon size={16} className="mr-2" />
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Theme Toggle in Mobile Menu */}
                    <div className="px-4 py-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                        className="w-full justify-start"
                        data-testid="toggle-dark-mode-mobile"
                      >
                        {theme === "dark" ? (
                          <>
                            <Sun className="mr-2 h-4 w-4" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <Moon className="mr-2 h-4 w-4" />
                            Dark Mode
                          </>
                        )}
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            )}
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group" data-testid="link-home">
              <Shield className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-bold text-xl text-secondary-foreground">REGIMA</span>
                <span className="hidden sm:inline-block ml-2 text-sm text-primary">Training Portal</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Training Portal Links */}
            <div className="flex items-center space-x-1 mr-4">
              {trainingItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "text-sm",
                      !isActive && "text-secondary-foreground hover:text-primary hover:bg-primary/10"
                    )}
                    data-testid={item.testId}
                    asChild
                  >
                    <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border mx-2" />

            {/* Info Links */}
            <div className="flex items-center space-x-1">
              {infoItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "text-sm",
                      !isActive && "text-secondary-foreground hover:text-primary hover:bg-primary/10"
                    )}
                    data-testid={item.testId}
                    asChild
                  >
                    <Link href={item.href} aria-current={isActive ? "page" : undefined}>
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </nav>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-secondary-foreground hover:bg-primary/10"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              data-testid="toggle-dark-mode"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* User Menu / Login */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full border-2 border-primary/20 hover:border-primary"
                    data-testid="button-user-menu"
                  >
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
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer w-full" data-testid="link-profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onLogout()} 
                    className="cursor-pointer"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                size="sm" 
                onClick={onLogin}
                className="bg-primary hover:bg-primary/90"
                data-testid="button-login"
              >
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}