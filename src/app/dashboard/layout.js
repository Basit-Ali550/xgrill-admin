"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sidebar } from "@/components/Sidebar";
import { useSocket } from "@/context/SocketContext";
import { BannerNotification } from "@/components/ui/notifications/BannerNotification";

export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (socket && isConnected) {
      const handleAlert = (data) => {
        setAlerts((prev) => [
          ...prev, 
          { 
            id: Date.now(), 
            title: "Low Ingredient Stock!", 
            message: `${data.name} is running low (${data.stock} ${data.unit} remaining).`,
            type: "warning" 
          }
        ]);
      };

      socket.on("low_stock_ingredient_alert", handleAlert);

      return () => {
        socket.off("low_stock_ingredient_alert", handleAlert);
      };
    }
  }, [socket, isConnected]);

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter(alert => alert.id !== id));
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #f97316', 
          borderTopColor: 'transparent', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        {children}
        
        {/* Notifications Container */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {alerts.map((alert) => (
            <BannerNotification
              key={alert.id}
              title={alert.title}
              message={alert.message}
              type={alert.type}
              onClose={() => removeAlert(alert.id)}
            />
          ))}
        </div>
      </main>
      
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
