"use client";
import { useAuth } from "@/context/AuthContext";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ title, toggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex-shrink-0 h-16 border-b border-gray-700/50 bg-gray-900/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors lg:hidden"
        >
          <Menu size={24} />
        </button>

        <h1 className="text-lg md:text-xl font-semibold text-white m-0">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="group flex items-center gap-2 outline-none border border-gray-600 rounded-full p-1 pl-1 pr-3 hover:bg-gray-800 transition-colors">
            <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500">
              <User size={18} />
            </div>
            <div className="hidden sm:block text-left mr-1">
              <p className="text-sm font-medium text-white leading-none">
                {user?.name || "Admin"}
              </p>
            </div>
            <ChevronDown
              size={14}
              className="text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <div className="px-2 pb-1 text-xs text-gray-400 break-all">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

// Page wrapper component that handles scroll
export function PageContent({ children }) {
  return <div className="flex-1 overflow-y-auto p-6">{children}</div>;
}
