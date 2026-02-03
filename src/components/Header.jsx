"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { Menu, User, LogOut, ChevronDown, Bell, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function Header({ title, toggleSidebar }) {
  const { user, logout } = useAuth();
  const { socket, playNotificationSound } = useSocket();
  const [notifications, setNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("adminNotifications");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse notifications", e);
        }
      }
    }
    return [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Save to local storage whenever notifications change
  useEffect(() => {
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
  }, [notifications]);

  // Listen for new orders
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (data) => {
      const newNotification = {
        id: Date.now(),
        type: "new_order",
        title: `New Order #${data.orderNumber || "Received"}`,
        message: `Order received from ${data.user?.name || "Customer"}`,
        time: new Date().toISOString(),
        read: false,
        link: "/dashboard/orders",
      };

      setNotifications((prev) => [newNotification, ...prev]);
      playNotificationSound();
    };

    socket.on("new_order", handleNewOrder);

    return () => {
      socket.off("new_order", handleNewOrder);
    };
  }, [socket, playNotificationSound]);

  // Close notifications on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <header className="shrink-0 h-16 border-b border-gray-700/50 bg-gray-900/95 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 z-40 relative">
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
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAsRead();
            }}
            className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors relative outline-none"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-gray-900 animate-pulse" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center gap-2">
                    <Bell size={32} className="opacity-20" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {notifications.map((notification) => (
                      <Link
                        href={notification.link}
                        key={notification.id}
                        onClick={() => setShowNotifications(false)}
                        className={`block p-4 hover:bg-gray-800/50 transition-colors ${!notification.read ? "bg-gray-800/30" : ""}`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notification.read ? "bg-blue-500" : "bg-transparent"}`}
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-2">
                              {formatDistanceToNow(
                                new Date(notification.time),
                                { addSuffix: true },
                              )}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
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
          <DropdownMenuContent
            align="end"
            className="w-56 bg-gray-900 border-gray-700 text-gray-100"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <div className="px-2 pb-1 text-xs text-gray-400 break-all">
              {user?.email}
            </div>
            <DropdownMenuSeparator className="bg-gray-700" />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
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
