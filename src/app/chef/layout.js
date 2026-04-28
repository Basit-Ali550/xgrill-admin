"use client";
import Link from "next/link";
import { FaFire } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { BannerNotification } from "@/components/ui/notifications/BannerNotification";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChefLayout({ children }) {
  const { isAuthenticated, loading, logout } = useAuth();
  const { isConnected, socket } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const router = useRouter();

  // Auth redirect
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);


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

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-900/95 backdrop-blur border-b border-gray-700/50 sticky top-0 z-50">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/chef/orders" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <FaFire className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white m-0">Grill-X Kitchen</h1>
                <div className="flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                   <span className="text-xs text-gray-400">{isConnected ? "Live" : "Offline"}</span>
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
             <button 
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {alerts.map((alert) => (
            <div className="pointer-events-auto" key={alert.id}>
               <BannerNotification  title={alert.title} message={alert.message} type={alert.type} onClose={() => removeAlert(alert.id)} />
            </div>
          ))}
           </div>
      <main className="flex-1 relative overflow-hidden">
        {children}
      </main>
   
    </div>
  )
}
