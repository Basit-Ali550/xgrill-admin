"use client";
import { useState, useMemo, useEffect } from "react";
import { 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ChefHat, 
  Package,
  Search,
  MoreVertical,
  Printer,
  Ban,
  Check,
  Filter
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useOrders } from "@/hooks/useOrders";
import { ORDER_STATUSES, ORDER_STATUS_COLORS } from "@/constants";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OrdersPage() {
  const { orders, loading, updateOrderStatus } = useOrders();
  const { socket } = useSocket();
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);

  // Voice Notification Logic
  useEffect(() => {
    if (!socket) return;

    const handleNewOrderNotification = (data) => {
      // Play Voice Notification
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("New Order Received");
        utterance.rate = 1.0; 
        window.speechSynthesis.speak(utterance);
      }

      // Show Toast
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-gray-700`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                   <ShoppingBag className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">New Order #{data.orderNumber}</p>
                <p className="mt-1 text-sm text-gray-400">Rs. {data.totalAmount} • {data.items?.length} items</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-400 hover:text-blue-300 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000 });
      
      // Auto-switch to Pending if watching specific filtered list
       if (activeStatus !== "ALL" && activeStatus !== "PENDING") {
         setActiveStatus("PENDING");
      }
      
      setHighlightedOrderId(data.id);
      setTimeout(() => setHighlightedOrderId(null), 10000); 
    };

    socket.on("new_order", handleNewOrderNotification);
    return () => socket.off("new_order", handleNewOrderNotification);
  }, [socket, activeStatus]);

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    let result = orders || [];

    // Filter by Status
    if (activeStatus !== "ALL") {
      result = result.filter((order) => order.status === activeStatus);
    }

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.orderNumber?.toString().includes(q) ||
        order.user?.name?.toLowerCase().includes(q) ||
        order.user?.phone?.includes(q)
      );
    }

    // Sort by Date (Newest First)
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, activeStatus, searchQuery]);

  // Status Change Handler
  const handleStatusChange = async (orderId, newStatus) => {
    // Handle both direct value and event object from native/custom select
    const status = newStatus?.target?.value || newStatus;
    if (!status) return;

    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status.replace(/_/g, " ")}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Status Options for Dropdown
  const filterOptions = [
    { value: "ALL", label: "All Orders" },
    ...ORDER_STATUSES.map(status => ({
      value: status,
      label: status.replace(/_/g, " ")
    }))
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 backdrop-blur-sm sticky top-0 z-30 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Orders
            <span className="text-sm font-normal text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md border border-gray-700">
              {filteredOrders?.length}
            </span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">Real-time order management</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-500"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="w-full sm:w-48">
            <Select
              value={activeStatus}
              options={filterOptions}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="w-full"
              placeholder="Filter by Status"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-500">
          <LoadingSpinner size="lg" />
          <p>Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center">
            <EmptyState 
              icon="📋" 
              message={`No ${activeStatus === "ALL" ? "" : activeStatus.toLowerCase()} orders found`}
              description={searchQuery ? "Try adjusting your search terms" : "Orders will appear here automatically"}
            />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={cn(
                "group relative bg-gray-900/40 border border-gray-800 rounded-xl transition-all duration-300 hover:border-gray-700 hover:bg-gray-900/60",
                highlightedOrderId === order.id && "ring-2 ring-blue-500 shadow-lg shadow-blue-500/10"
              )}
            >
              {/* Order Header */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 font-bold border border-gray-700">
                    <span className="text-xl">#{order.orderNumber?.toString().slice(-2)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-white text-lg">Order #{order.orderNumber}</span>
                       {highlightedOrderId === order.id && (
                          <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide animate-pulse">
                            New
                          </span>
                       )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <StatusBadge status={order.status} />
                   <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors outline-none shrink-0 border border-transparent hover:border-gray-700">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-gray-900 border-gray-800">
                        <DropdownMenuItem className="text-gray-300 focus:bg-gray-800 focus:text-white cursor-pointer hover:bg-gray-800">
                           <Printer className="w-4 h-4 mr-2" /> Print Receipt
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                          onClick={() => handleStatusChange(order.id, "CANCELLED")}
                        >
                           <Ban className="w-4 h-4 mr-2" /> Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                   </DropdownMenu>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Items */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <ShoppingBag className="w-3 h-3" /> Order Items ({order.items?.length})
                  </div>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-sm group/item p-2 rounded hover:bg-gray-800/50 transition-colors">
                        <div className="flex gap-3">
                          <span className="font-bold text-blue-400 whitespace-nowrap">{item.quantity}x</span>
                          <div>
                            <span className="text-gray-200 block font-medium">{item.product?.name}</span>
                          </div>
                        </div>
                        <span className="text-gray-500 font-medium whitespace-nowrap">
                            {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.notes && (
                    <div className="mt-3 text-xs bg-yellow-500/10 text-yellow-500 p-3 rounded-lg border border-yellow-500/20 flex gap-2">
                      <div className="mt-0.5 min-w-[16px]">📝</div>
                      <p>{order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Right: Customer & Actions */}
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        <User className="w-3 h-3" /> Customer Details
                    </div>
                    <div className="bg-gray-800/30 rounded-xl p-3 space-y-3 border border-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-white truncate">{order.user?.name || "Guest"}</p>
                          <p className="text-xs text-gray-500 truncate">{order.user?.phone || order.phone || "N/A"}</p>
                        </div>
                      </div>
                      {order.address && (
                        <div className="flex items-start gap-3 border-t border-gray-700/50 pt-3">
                          <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed font-medium">{order.address}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-auto">
                     <div className="flex justify-between items-end mb-4 px-1">
                        <span className="text-gray-400 text-sm font-medium">Total Amount</span>
                        <span className="text-xl font-bold text-orange-400">{formatPrice(order.totalAmount)}</span>
                     </div>
                     
                     {/* Update Status Dropdown for EVERY card */}
                     <div className="space-y-2">
                        <div className="w-full">
                          <Select
                            value={order.status}
                            options={ORDER_STATUSES.map(s => ({ value: s, label: `Status: ${s.replace(/_/g, " ")}` }))}
                            onChange={(e) => handleStatusChange(order.id, e)}
                            className="w-full bg-gray-800 border-gray-700"
                          />
                        </div>
                        
                        {/* Quick Action Button (Secondary helper) */}
                        {order.status === "PENDING" && (
                            <button 
                               onClick={() => handleStatusChange(order.id, "ACCEPTED")}
                               className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-900/20"
                             >
                                Accept Order
                             </button>
                        )}
                         {order.status === "ACCEPTED" && (
                            <button 
                               onClick={() => handleStatusChange(order.id, "PREPARING")}
                               className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-purple-900/20"
                             >
                                Start Preparing
                             </button>
                        )}
                        {order.status === "PREPARING" && (
                            <button 
                               onClick={() => handleStatusChange(order.id, "OUT_FOR_DELIVERY")}
                               className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-orange-900/20"
                             >
                                Send for Delivery
                             </button>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
