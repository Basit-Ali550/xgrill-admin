"use client";
import { useState, useMemo, useEffect } from "react";
import { 
  ShoppingBag, 
  Search,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useOrders } from "@/hooks/useOrders";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import OrderDetailModal from "@/components/orders/OrderDetailModal";
import KanbanBoard from "@/components/orders/KanbanBoard";

export default function ChefOrdersPage() {
  const { orders, loading, updateOrderStatus } = useOrders();
  const { socket } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
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

    return result;
  }, [orders, searchQuery]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Header Controls */}
      <div className="shrink-0 flex justify-between items-center bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Active Orders
            <span className="text-sm font-normal text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
              {filteredOrders.length}
            </span>
          </h2>
        </div>
        
        <div className="w-72 relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by Order # or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-2 focus:ring-orange-500/50 placeholder:text-gray-500"
            />
        </div>
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900/30"> 
            <KanbanBoard 
            orders={filteredOrders}
            onOrderClick={handleCardClick}
            onStatusChange={handleStatusChange}
            highlightedOrderId={highlightedOrderId}
            isChef={true}
            />
        </div>
      )}

      {filteredOrders.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <EmptyState icon="🍳" message="No active orders" description="Kitchen is clear!" />
        </div>
      )}

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onOrderSelect={(order) => setSelectedOrder(order)}
        allOrders={orders}
        isChef={true}
      />
    </div>
  );
}
