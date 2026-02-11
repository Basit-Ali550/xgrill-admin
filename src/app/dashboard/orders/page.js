"use client";
import React, { useState, useMemo, useEffect } from "react";
import { 
  ShoppingBag, 
  Search,
  Plus
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useOrders } from "@/hooks/useOrders";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import { DatePicker, ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';
import OrderDetailModal from "@/components/orders/OrderDetailModal";
import KanbanBoard from "@/components/orders/KanbanBoard";

const { RangePicker } = DatePicker;


export default function OrdersPage() {
  const { orders, loading, updateOrderStatus } = useOrders();
  const { socket } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  // Socket notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewOrderNotification = (data) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("New Order Received");
        window.speechSynthesis.speak(utterance);
      }

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-700`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">New Order #{data.orderNumber}</p>
                <p className="mt-1 text-sm text-gray-400">Rs. {data.totalAmount}</p>
              </div>
            </div>
          </div>
          <button onClick={() => toast.dismiss(t.id)} className="border-l border-gray-700 p-4 text-blue-400 hover:text-blue-300">
            Close
          </button>
        </div>
      ), { duration: 5000 });
      
      setHighlightedOrderId(data.id);
      setTimeout(() => setHighlightedOrderId(null), 10000); 
    };

    socket.on("new_order", handleNewOrderNotification);
    return () => socket.off("new_order", handleNewOrderNotification);
  }, [socket]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = orders || [];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.orderNumber?.toString().includes(q) ||
        order.user?.name?.toLowerCase().includes(q) ||
        order.user?.phone?.includes(q)
      );
    }

    if (startDate || endDate) {
      result = result.filter(order => {
        const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
        if (startDate && endDate) return orderDateStr >= startDate && orderDateStr <= endDate;
        if (startDate) return orderDateStr >= startDate;
        if (endDate) return orderDateStr <= endDate;
        return true;
      });
    }

    return result;
  }, [orders, searchQuery, startDate, endDate]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Moved to ${newStatus.replace(/_/g, " ")}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const handleCardClick = (order) => setSelectedOrder(order);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-900/80 p-4 border-b border-gray-800 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            🎯 Order Board
            <span className="text-xs font-normal text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">
              {filteredOrders.length} orders
            </span>
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Drag cards between columns</p>
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
           <Link href="/dashboard/orders/manual">
             <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20">
               <Plus size={18} className="mr-2" /> Manual Order
             </Button>
           </Link>
          <div className="relative flex-1 lg:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-500"
            />
          </div>

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
              value={[startDate ? dayjs(startDate) : null, endDate ? dayjs(endDate) : null]}
              onChange={(dates) => {
                setStartDate(dates?.[0]?.format('YYYY-MM-DD') || '');
                setEndDate(dates?.[1]?.format('YYYY-MM-DD') || '');
              }}
              allowClear
              format="MMM D"
              placeholder={['Start', 'End']}
              className="!rounded-lg"
              size="middle"
            />
          </ConfigProvider>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <KanbanBoard
          orders={filteredOrders}
          onOrderClick={handleCardClick}
          onStatusChange={handleStatusChange}
          highlightedOrderId={highlightedOrderId}
          isChef={false}
        />
      )}

      {filteredOrders.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon="📋" message="No orders" description="Adjust filters" />
        </div>
      )}

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onOrderSelect={(order) => setSelectedOrder(order)}
        allOrders={orders}
        isChef={false}
      />
    </div>
  );
}
