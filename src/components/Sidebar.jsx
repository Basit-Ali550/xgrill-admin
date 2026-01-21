"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { useSidebar } from "@/context/SidebarContext";
import { useState } from "react";
import {
  MdDashboard,
  MdReceipt,
  MdInventory2,
  MdFastfood,
  MdLocalOffer,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
} from "react-icons/md";
import { GiGrainBundle } from "react-icons/gi";
import { FaFire } from "react-icons/fa";

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: MdDashboard },
  { href: "/dashboard/orders", label: "Orders", Icon: MdReceipt },
  { href: "/dashboard/ingredients", label: "Ingredients", Icon: GiGrainBundle },
  { href: "/dashboard/inventory", label: "Inventory", Icon: MdInventory2 },
  { href: "/dashboard/products", label: "Products", Icon: MdFastfood },
  { href: "/dashboard/deals", label: "Deals", Icon: MdLocalOffer },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected } = useSocket();
  const { isOpen, isMobile, close } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  // For desktop, use collapsed state; for mobile, always expanded in slide-out
  const showLabels = isMobile ? true : !isCollapsed;
  const sidebarWidth = isMobile ? "280px" : isCollapsed ? "80px" : "256px";

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed lg:static z-50 
          h-screen flex flex-col
          bg-gray-900/95 backdrop-blur-xl
          border-r border-gray-700/50
          transition-all duration-300 ease-in-out
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        `}
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 no-underline"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
              <FaFire className="text-white text-xl" />
            </div>
            {showLabels && (
              <div>
                <h1 className="text-lg font-bold text-white m-0">Grill-X</h1>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                  />
                  <span className="text-xs text-gray-400">
                    {isConnected ? "Live" : "Offline"}
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={close}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <MdClose size={24} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.Icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isMobile ? close : undefined}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl mb-2 no-underline transition-all duration-200
                  ${
                    active
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent"
                  }
                  ${!showLabels ? "justify-center" : ""}
                `}
                title={!showLabels ? item.label : undefined}
              >
                <Icon
                  size={22}
                  className={`flex-shrink-0 ${active ? "text-orange-400" : ""}`}
                />
                {showLabels && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button (Desktop only) */}
        {!isMobile && (
          <div className="p-3 border-t border-gray-700/50">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              {isCollapsed ? (
                <MdChevronRight size={22} />
              ) : (
                <>
                  <MdChevronLeft size={22} />
                  <span className="text-sm">Collapse</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        {showLabels && (
          <div className="p-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              Real-time Order Management
            </p>
          </div>
        )}
      </aside>
    </>
  );
}
