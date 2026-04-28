"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { BannerNotification } from "@/components/ui/notifications/BannerNotification";
import {
  MdDashboard,
  MdReceipt,
  MdInventory2,
  MdFastfood,
  MdLocalOffer,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdAddShoppingCart,
  MdPeople,
  MdHistory,
} from "react-icons/md";
import { GiGrainBundle } from "react-icons/gi";
import { FaFire } from "react-icons/fa";
import { Header } from "@/components/Header";

// Page Title Context
const PageTitleContext = createContext({ title: "Dashboard", setTitle: () => {} });
export const usePageTitle = () => useContext(PageTitleContext);

// Navigation items
const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: MdDashboard },
  { href: "/dashboard/orders", label: "Orders", Icon: MdReceipt },
  { href: "/dashboard/orders/manual", label: "POS", Icon: MdAddShoppingCart },
  { href: "/dashboard/ingredients", label: "Ingredients", Icon: GiGrainBundle },
  { href: "/dashboard/inventory", label: "Inventory", Icon: MdInventory2 },
  { href: "/dashboard/products", label: "Products", Icon: MdFastfood },
  { href: "/dashboard/deals", label: "Deals", Icon: MdLocalOffer },
  { href: "/dashboard/staff", label: "Staff", Icon: MdPeople, adminOnly: true },
  { href: "/dashboard/activity-log", label: "Activity Log", Icon: MdHistory, adminOnly: true },
];

// Admin-only route prefixes — Receptionist cannot access these even via URL
const ADMIN_ONLY_ROUTES = [
  "/dashboard/staff",
  "/dashboard/activity-log",
  "/dashboard/inventory/add",
  "/dashboard/inventory/edit",
];

export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { socket, isConnected } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auth redirect
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Role based redirect
  useEffect(() => {
    if (!loading && isAuthenticated && user?.role === "CHEF") {
      router.push("/chef/orders");
    }
    // Block non-admin from admin-only routes
    if (!loading && isAuthenticated && user?.role !== "ADMIN") {
      const isAdminRoute = ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));
      if (isAdminRoute) {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, loading, user, router, pathname]);

  // Get page title based on route (computed, not state)
  const pageTitle = (() => {
    const currentNav = navItems.find(item => 
      item.href === pathname || (item.href !== "/dashboard" && pathname.startsWith(item.href))
    );
    return currentNav?.label || "Dashboard";
  })();

  // Socket alerts
  useEffect(() => {
    if (socket && isConnected) {
      const handleAlert = (data) => {
        setAlerts((prev) => [...prev, { 
          id: Date.now(), 
          title: "Low Ingredient Stock!", 
          message: `${data.name} is running low (${data.stock} ${data.unit} remaining).`,
          type: "warning" 
        }]);
      };
      socket.on("low_stock_ingredient_alert", handleAlert);
      return () => socket.off("low_stock_ingredient_alert", handleAlert);
    }
  }, [socket, isConnected]);

  const removeAlert = (id) => setAlerts((prev) => prev.filter(alert => alert.id !== id));
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const showLabels = isMobile ? true : !isCollapsed;
  const sidebarWidth = isMobile ? 280 : isCollapsed ? 80 : 256;

  return (
    <PageTitleContext.Provider value={{ title: pageTitle, setTitle: () => {} }}>
      <div className="h-screen flex overflow-hidden bg-gray-900">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closeSidebar} />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static z-50 h-screen flex flex-col
            bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50
            transition-all duration-300 ease-in-out
            ${isMobile ? (sidebarOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          `}
          style={{ width: sidebarWidth, minWidth: sidebarWidth }}
        >
          {/* Logo */}
          <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                <FaFire className="text-white text-xl" />
              </div>
              {showLabels && (
                <div>
                  <h1 className="text-lg font-bold text-white m-0">Grill-X</h1>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    <span className="text-xs text-gray-400">{isConnected ? "Live" : "Offline"}</span>
                  </div>
                </div>
              )}
            </Link>
            {isMobile && (
              <button onClick={closeSidebar} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                <MdClose size={24} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 overflow-y-auto">
            {navItems
              .filter((item) => !item.adminOnly || user?.role === "ADMIN")
              .map((item) => {
              const active = isActive(item.href);
              const Icon = item.Icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? closeSidebar : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md mb-2 no-underline transition-all duration-200
                    ${active ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent"}
                    ${!showLabels ? "justify-center" : ""}
                  `}
                  title={!showLabels ? item.label : undefined}
                >
                  <Icon size={22} className={`shrink-0 ${active ? "text-orange-400" : ""}`} />
                  {showLabels && <span className="font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Collapse Button (Desktop) */}
          {!isMobile && (
            <div className="p-3 border-t border-gray-700/50">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              >
                {isCollapsed ? <MdChevronRight size={22} /> : <><MdChevronLeft size={22} /><span className="text-sm">Collapse</span></>}
              </button>
            </div>
          )}

          {/* Footer */}
          {showLabels && (
            <div className="p-4 border-t border-gray-700/50">
              <p className="text-xs text-gray-500 text-center">Real-time Order Management</p>
            </div>
          )}
        </aside>

        {/* Main Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header - Fixed at top */}
          <Header title={pageTitle} toggleSidebar={toggleSidebar} />

          {/* Page Content - Scrollable */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>

        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {alerts.map((alert) => (
            <BannerNotification key={alert.id} title={alert.title} message={alert.message} type={alert.type} onClose={() => removeAlert(alert.id)} />
          ))}
        </div>
      </div>
    </PageTitleContext.Provider>
  );
}
