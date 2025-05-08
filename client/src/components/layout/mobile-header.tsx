import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type User } from "@/lib/types";

interface MobileHeaderProps {
  onMenuClick: () => void;
  user: User | null;
}

export function MobileHeader({ onMenuClick, user }: MobileHeaderProps) {
  return (
    <div className="md:hidden w-full bg-white dark:bg-slate-900 border-b border-border flex items-center justify-between px-4 py-3">
      <div className="flex items-center">
        <img 
          src="https://images.unsplash.com/photo-1556229174-5e42a09e45af?ixlib=rb-1.2.1&auto=format&fit=crop&w=48&h=48&q=80" 
          alt="REGIMA Logo" 
          className="h-10 w-10 rounded-full"
        />
        <h1 className="ml-2 text-xl font-semibold text-primary">REGIMA</h1>
      </div>
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="text-gray-500">
        <Menu className="h-6 w-6" />
      </Button>
    </div>
  );
}

export default MobileHeader;
