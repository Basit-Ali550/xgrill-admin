"use client";
import { useOrders } from "@/hooks/useOrders";
import { useInventory } from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const { orders } = useOrders();
  const { lowStockItems } = useInventory();
  const { products } = useProducts();

  const stats = [
    { title: "Total Orders", value: orders?.length || 0, icon: "📋", color: "#60a5fa", bgColor: "rgba(59, 130, 246, 0.2)" },
    { title: "Pending Orders", value: orders?.filter((o) => o.status === "PENDING").length || 0, icon: "⏳", color: "#facc15", bgColor: "rgba(234, 179, 8, 0.2)" },
    { title: "Total Products", value: products?.length || 0, icon: "🍔", color: "#4ade80", bgColor: "rgba(34, 197, 94, 0.2)" },
    { title: "Low Stock Items", value: lowStockItems?.length || 0, icon: "⚠️", color: "#f87171", bgColor: "rgba(239, 68, 68, 0.2)" },
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
          
          {lowStockItems.length === 0 ? (
            <EmptyState icon="✅" message="All items well stocked" />
          ) : (
            <div className="flex flex-col gap-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{item.product?.name}</p>
                    <p className="text-sm text-gray-400">{item.product?.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-400">{item.quantity}</p>
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
