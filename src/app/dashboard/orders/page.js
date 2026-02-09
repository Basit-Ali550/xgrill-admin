"use client";
import { useState, useMemo, useEffect } from "react";
import { 
  Clock, 
  User, 
  ShoppingBag, 
  Search,
  GripVertical,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useOrders } from "@/hooks/useOrders";
import { ORDER_STATUSES, ORDER_STATUS_COLORS } from "@/constants";
import { useSocket } from "@/context/SocketContext";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { DatePicker, ConfigProvider, theme } from 'antd';
import dayjs from 'dayjs';
import OrderDetailModal from "@/components/orders/OrderDetailModal";

// Drag and Drop
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

const { RangePicker } = DatePicker;

// All Kanban statuses
const KANBAN_STATUSES = ["PENDING", "PREPARING", "PREPARED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Draggable Order Card
function DraggableOrderCard({ order, onClick, isHighlighted }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { order },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 1000,
  } : undefined;

  // Get first 2 item names
  const itemNames = order.items?.slice(0, 2).map(item => 
    item.product?.name || item.deal?.name || 'Item'
  ) || [];
  const moreItems = (order.items?.length || 0) - 2;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-gray-800 border border-gray-700 rounded-xl shadow-sm transition-all duration-150",
        "hover:border-gray-600 hover:shadow-lg",
        isHighlighted && "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20",
        isDragging && "opacity-40"
      )}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="flex items-center gap-2 px-3 py-2 border-b border-gray-700/50 cursor-grab active:cursor-grabbing bg-gray-750 rounded-t-xl"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
        <span className="font-bold text-white text-sm flex-1">#{order.orderNumber}</span>
        <span className="text-[10px] text-gray-500">
          {formatDistanceToNow(new Date(order.createdAt), { addSuffix: false })}
        </span>
      </div>
      
      {/* Clickable Content */}
      <div 
        onClick={() => onClick(order)}
        className="p-3 cursor-pointer hover:bg-gray-700/20 transition-colors rounded-b-xl"
      >
        {/* Customer Row */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">{order.user?.name || "Guest"}</p>
            <p className="text-[11px] text-gray-500 truncate">{order.phone || order.user?.phone || "No phone"}</p>
            {order.address && (
              <p className="text-[10px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0"></span>
                {order.address}
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-orange-400 text-sm">{formatPrice(order.totalAmount)}</p>
          </div>
        </div>
        
        {/* Items Preview */}
        <div className="bg-gray-900/50 rounded-lg p-2 space-y-1">
          {itemNames.map((name, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="text-orange-400">•</span>
              <span className="text-gray-300 truncate">{name}</span>
            </div>
          ))}
          {moreItems > 0 && (
            <p className="text-[10px] text-gray-500 pl-4">+{moreItems} more item{moreItems > 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Notes Indicator */}
        {order.notes && (
          <div className="mt-2 text-xs text-yellow-500/80 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 truncate">
            📝 {order.notes}
          </div>
        )}
      </div>
    </div>
  );
}

  // Drag Overlay Card - Updated to match new design
  function OrderCardOverlay({ order }) {
    return (
      <div className="bg-gray-800 border-2 border-blue-500 rounded-lg shadow-2xl w-[280px] rotate-3">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700/50 bg-gray-800/50 rounded-t-lg">
          <GripVertical className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-white text-sm">#{order.orderNumber}</span>
        </div>
        <div className="p-3">
          <div className="mb-2">
            <span className="text-sm text-gray-200 truncate font-bold block">{order.user?.name || "Guest"}</span>
            <span className="text-[10px] text-gray-400 block">{order.phone || order.user?.phone || "No phone"}</span>
             {order.address && (
              <p className="text-[10px] text-gray-500 truncate mt-0.5 border-l-2 border-blue-500 pl-1">
                {order.address}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-700/50">
            <span className="text-gray-500">{order.items?.length} items</span>
            <span className="font-bold text-orange-400">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>
    );
  }

// Droppable Kanban Column
function KanbanColumn({ status, orders, onCardClick, highlightedOrderId, isOver }) {
  const statusConfig = ORDER_STATUS_COLORS[status] || {};
  const { setNodeRef } = useDroppable({ id: status });
  
  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[320px] min-w-[320px] max-w-[450px] flex-shrink-0 h-full transition-all duration-200",
        "border-l border-r border-gray-800",
        isOver && "bg-gray-900/50"
      )}
      style={{
        borderLeftColor: isOver ? statusConfig.color : undefined,
        borderRightColor: isOver ? statusConfig.color : undefined,
      }}
    >
      {/* Column Header */}
      <div 
        className="p-4 border-b-2 flex-shrink-0"
        style={{ 
          backgroundColor: statusConfig.bg,
          borderBottomColor: statusConfig.color 
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusConfig.color }}
            />
            <span 
              className="font-bold text-sm uppercase tracking-wide"
              style={{ color: statusConfig.color }}
            >
              {statusConfig.label || status.replace(/_/g, " ")}
            </span>
          </div>
          <span 
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: statusConfig.color, color: '#111' }}
          >
            {orders.length}
          </span>
        </div>
      </div>
      
      {/* Column Body - Scrollable */}
      <div 
        className={cn(
          "flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden",
          "scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent",
          isOver && "ring-2 ring-inset ring-opacity-30"
        )}
        style={{
          ...(isOver && { '--tw-ring-color': statusConfig.color })
        }}
      >
        {orders.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center py-8 text-gray-600">
              <div className="text-2xl mb-2 opacity-50">📋</div>
              <p className="text-xs">Drop orders here</p>
            </div>
          </div>
        ) : (
          orders.map((order) => (
            <DraggableOrderCard
              key={order.id}
              order={order}
              onClick={onCardClick}
              isHighlighted={highlightedOrderId === order.id}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { orders, loading, updateOrderStatus } = useOrders();
  const { socket } = useSocket();
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);
  
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

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

  // Group by status
  const ordersByStatus = useMemo(() => {
    const grouped = {};
    KANBAN_STATUSES.forEach(status => {
      grouped[status] = filteredOrders
        .filter(order => order.status === status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
    return grouped;
  }, [filteredOrders]);

  const activeOrder = activeId ? filteredOrders.find(o => o.id === activeId) : null;

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

  const handleDragStart = (event) => setActiveId(event.active.id);
  const handleDragOver = (event) => setOverColumn(event.over?.id || null);
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over) return;
    const orderId = active.id;
    const newStatus = over.id;
    const order = filteredOrders.find(o => o.id === orderId);

    if (order && order.status !== newStatus && KANBAN_STATUSES.includes(newStatus)) {
      handleStatusChange(orderId, newStatus);
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex overflow-x-auto bg-gray-950">
            {KANBAN_STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                orders={ordersByStatus[status] || []}
                onCardClick={handleCardClick}
                highlightedOrderId={highlightedOrderId}
                isOver={overColumn === status}
              />
            ))}
          </div>

          <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
            {activeOrder ? <OrderCardOverlay order={activeOrder} /> : null}
          </DragOverlay>
        </DndContext>
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
      />
    </div>
  );
}
