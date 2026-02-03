"use client"
import { useState, useEffect, useCallback } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useInventory } from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";
import { useIngredients } from "@/hooks/useIngredients";
import { useSocket } from "@/context/SocketContext";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDashboardStats } from "@/app/actions/dashboard";

export default function DashboardPage() {
  const { orders } = useOrders();
  const { lowStockItems: productLowStock } = useInventory();
  const { ingredients } = useIngredients();
  const { products } = useProducts();
  const { socket } = useSocket();
  
  const [dashboardStats, setDashboardStats] = useState({
      dailyRevenue: 0,
      totalInvestment: 0,
      totalLoss: 0
  });

  const fetchStats = useCallback(async () => {
      const res = await getDashboardStats();
      if (res.success) {
          setDashboardStats(res.data);
      }
  }, []);

  useEffect(() => {
      fetchStats();
  }, [fetchStats]);

  // Real-time listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('new_order', fetchStats);
    socket.on('order_status_update', fetchStats);
    socket.on('inventory_update', fetchStats);

    return () => {
      socket.off('new_order', fetchStats);
      socket.off('order_status_update', fetchStats);
      socket.off('inventory_update', fetchStats);
    };
  }, [socket, fetchStats]);

  // Filter low stock ingredients
  const ingredientLowStock = ingredients?.filter(
    (item) => item.stock <= item.lowStockThreshold
  ) || [];

  // Combine alerts
  const allLowStock = [
    ...productLowStock.map(item => ({ ...item, type: 'Product', name: item.product?.name, category: item.product?.category })),
    ...ingredientLowStock.map(item => ({ ...item, type: 'Ingredient', name: item.name, category: 'Raw Ingredient' }))
  ];

  const stats = [
    { title: "Today's Revenue", value: `Rs. ${dashboardStats.dailyRevenue.toLocaleString()}`, icon: "💰", color: "#10b981", bgColor: "rgba(16, 185, 129, 0.2)" },
    { title: "Total Investment", value: `Rs. ${Math.round(dashboardStats.totalInvestment).toLocaleString()}`, icon: "🏦", color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.2)" },
    { title: "Total Loss (Waste)", value: `Rs. ${Math.round(dashboardStats.totalLoss).toLocaleString()}`, icon: "📉", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.2)" },
    { title: "Total Orders", value: orders?.length || 0, icon: "📋", color: "#60a5fa", bgColor: "rgba(59, 130, 246, 0.2)" },
    { title: "Pending Orders", value: orders?.filter((o) => o.status === "PENDING").length || 0, icon: "⏳", color: "#facc15", bgColor: "rgba(234, 179, 8, 0.2)" },
    { title: "Total Products", value: products?.length || 0, icon: "🍔", color: "#4ade80", bgColor: "rgba(34, 197, 94, 0.2)" },
    { title: "Low Stock Items", value: allLowStock.length, icon: "⚠️", color: "#f87171", bgColor: "rgba(239, 68, 68, 0.2)" },
  ];

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📋</span> Recent Orders
          </h3>
          
          {recentOrders.length === 0 ? (
            <EmptyState icon="📭" message="No orders yet" />
          ) : (
            <div className="flex flex-col gap-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{order.orderNumber}</p>
                    <p className="text-sm text-gray-400">{order.user?.name}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={order.status} />
                    <p className="text-sm text-orange-400 mt-1">Rs. {order.totalAmount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>⚠️</span> Low Stock Alerts
          </h3>
          
          {allLowStock.length === 0 ? (
            <EmptyState icon="✅" message="All items well stocked" />
          ) : (
            <div className="flex flex-col gap-3">
              {allLowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{item.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.type === 'Ingredient' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-400">
                      {item.type === 'Ingredient' ? item.stock : item.quantity}
                      {item.type === 'Ingredient' && <span className="text-sm font-normal text-gray-500 ml-1">{item.unit}</span>}
                    </p>
                    <p className="text-xs text-gray-500">Threshold: {item.lowStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
