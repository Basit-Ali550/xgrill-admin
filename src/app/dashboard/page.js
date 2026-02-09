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
import LossReportTable from "@/components/dashboard/LossReportTable";
import { DatePicker, ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';
import { 
  DollarSign, 
  Factory, 
  TrendingUp, 
  Wallet, 
  TrendingDown, 
  ArrowDownToLine, 
  Warehouse, 
  Tag, 
  Users, 
  Ticket, 
  ClipboardList, 
  Package, 
  AlertTriangle 
} from "lucide-react";

const { RangePicker } = DatePicker;

export default function DashboardPage() {
  const { orders } = useOrders();
  const { lowStockItems: productLowStock } = useInventory();
  const { ingredients } = useIngredients();
  const { products } = useProducts();
  const { socket } = useSocket();
  
  // Date range filter - default to today
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [dashboardStats, setDashboardStats] = useState({
      revenue: 0,
      cogs: 0,
      grossProfit: 0,
      netProfit: 0,
      investmentAdded: 0,
      currentInvestment: 0,
      totalLoss: 0,
      totalCustomers: 0,
      activeDeals: 0,
      totalDiscountGiven: 0
  });

  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStats = useCallback(async () => {
      const res = await getDashboardStats(startDate, endDate);
      if (res.success) {
          setDashboardStats(res.data);
          setLastUpdated(new Date());
      }
  }, [startDate, endDate]);

  // Initial fetch and Real-time listeners
  useEffect(() => {
    fetchStats(); // eslint-disable-line

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
    // Financials
    { 
      title: startDate === endDate && startDate === today ? "Today's Revenue" : "Revenue", 
      value: `Rs. ${(dashboardStats?.revenue || 0).toLocaleString()}`, 
      icon: DollarSign, 
      color: "#10b981", 
      bgColor: "rgba(16, 185, 129, 0.2)" 
    },
    { title: "COGS (Product Cost)", value: `Rs. ${Math.round(dashboardStats?.cogs || 0).toLocaleString()}`, icon: Factory, color: "#6366f1", bgColor: "rgba(99, 102, 241, 0.2)" },
    { title: "Total Profit", value: `Rs. ${Math.round(dashboardStats?.netProfit || 0).toLocaleString()}`, icon: Wallet, color: "#06b6d4", bgColor: "rgba(6, 182, 212, 0.2)" },
    
    // Inventory & Stock
    { title: "Investment Added", value: `Rs. ${Math.round(dashboardStats?.investmentAdded || 0).toLocaleString()}`, icon: ArrowDownToLine, color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.2)" },
    { title: "Current Stock Value", value: `Rs. ${Math.round(dashboardStats?.currentInvestment || 0).toLocaleString()}`, icon: Warehouse, color: "#ec4899", bgColor: "rgba(236, 72, 153, 0.2)" },
    { title: "Loss (Waste)", value: `Rs. ${Math.round(dashboardStats?.totalLoss || 0).toLocaleString()}`, icon: TrendingDown, color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.2)" },
    { title: "Discount Given", value: `Rs. ${Math.round(dashboardStats?.totalDiscountGiven || 0).toLocaleString()}`, icon: Tag, color: "#f97316", bgColor: "rgba(249, 115, 22, 0.2)" },
    
    // Operations
    { title: "Total Customers", value: (dashboardStats?.totalCustomers || 0).toLocaleString(), icon: Users, color: "#14b8a6", bgColor: "rgba(20, 184, 166, 0.2)" },
    { title: "Active Deals", value: (dashboardStats?.activeDeals || 0).toLocaleString(), icon: Ticket, color: "#d946ef", bgColor: "rgba(217, 70, 239, 0.2)" },
    { title: "Total Orders", value: orders?.length || 0, icon: ClipboardList, color: "#60a5fa", bgColor: "rgba(59, 130, 246, 0.2)" },
    { title: "Total Products", value: products?.length || 0, icon: Package, color: "#4ade80", bgColor: "rgba(34, 197, 94, 0.2)" },
    { title: "Low Stock Items", value: allLowStock.length, icon: AlertTriangle, color: "#f87171", bgColor: "rgba(239, 68, 68, 0.2)" },
  ];

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <>
      {/* Date Filter & Actions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        
        {/* Left Side: Status & Last Updated */}
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <div className={`w-2 h-2 rounded-full ${socket?.connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
              <span className="text-sm text-gray-400 font-medium">
                {socket?.connected ? 'Live' : 'Disconnected'}
              </span>
           </div>
           
           {lastUpdated && (
             <p className="text-xs text-gray-500">
               Updated: {lastUpdated.toLocaleTimeString()}
             </p>
           )}
        </div>

        {/* Right Side: Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchStats}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg border border-gray-700 transition-colors"
            title="Refresh Data"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
          </button>

          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorPrimary: '#3b82f6',
                colorBgContainer: '#1f2937',
                colorBorder: '#374151',
                colorText: '#fff',
                colorTextPlaceholder: '#9ca3af',
              },
            }}
          >
            <RangePicker
              value={[
                startDate ? dayjs(startDate) : null,
                endDate ? dayjs(endDate) : null
              ]}
              onChange={(dates) => {
                if (dates) {
                  setStartDate(dates[0]?.format('YYYY-MM-DD') || '');
                  setEndDate(dates[1]?.format('YYYY-MM-DD') || '');
                } else {
                  setStartDate('');
                  setEndDate('');
                }
              }}
              allowClear
              format="YYYY-MM-DD"
              placeholder={['Start Date', 'End Date']}
              style={{ 
                background: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              }}
              className="rounded-lg! flex-1 sm:flex-none"
            />
          </ConfigProvider>
        </div>
      </div>

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

      {/* Loss Report */}
      <div className="mt-6">
        <LossReportTable startDate={startDate} endDate={endDate} />
      </div>
    </>
  );
}
