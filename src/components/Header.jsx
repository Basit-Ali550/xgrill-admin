"use client";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { MdMenu, MdLogout } from "react-icons/md";

export function Header({ title }) {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="flex-shrink-0 h-16 border-b border-gray-700/50 bg-gray-900/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors lg:hidden"
        >
          <MdMenu size={24} />
        </button>

        <h1 className="text-lg md:text-xl font-semibold text-white m-0">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-white m-0 truncate max-w-[150px]">
            {user?.name}
          </p>
          <p className="text-xs text-gray-400 m-0 truncate max-w-[150px]">
            {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 bg-transparent border border-gray-600 rounded-lg text-gray-300 text-sm cursor-pointer hover:bg-gray-800 hover:border-gray-500 transition-all"
        >
          <MdLogout size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

// Page wrapper component that handles scroll
export function PageContent({ children }) {
  return <div className="flex-1 overflow-y-auto p-6">{children}</div>;
}
