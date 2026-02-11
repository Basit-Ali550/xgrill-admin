"use client";
import React, { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_COLORS } from "@/constants";

// All Kanban statuses
const KANBAN_STATUSES = [
  "PENDING",
  "PREPARING",
  "PREPARED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Draggable Order Card
export function DraggableOrderCard({ order, onClick, isHighlighted }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: order.id,
      data: { order },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
      }
    : undefined;

  // Get first 2 item names
  const itemNames =
    order.items
      ?.slice(0, 2)
      .map((item) => item.product?.name || item.deal?.name || "Item") || [];
  const moreItems = (order.items?.length || 0) - 2;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-gray-800 border border-gray-700 rounded-xl shadow-sm transition-all duration-150",
        "hover:border-gray-600 hover:shadow-lg",
        isHighlighted && "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20",
        isDragging && "opacity-40",
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 px-3 py-2 border-b border-gray-700/50 cursor-grab active:cursor-grabbing bg-gray-750 rounded-t-xl"
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
        <span className="font-bold text-white text-sm flex-1">
          #{order.orderNumber}
        </span>
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
            <p className="text-sm text-white font-medium truncate">
              {order.customerName || order.user?.name || "Guest"}
            </p>
            <p className="text-[11px] text-gray-500 truncate">
              {order.customerPhone ||
                order.phone ||
                order.user?.phone ||
                "No phone"}
            </p>
            {order.address && (
              <p className="text-[10px] text-gray-400 truncate flex items-center gap-1 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0"></span>
                {order.address}
              </p>
            )}
            {order.sessionId && (
              <p className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 border border-purple-500/20">
                🍽️ DINE-IN
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-orange-400 text-sm">
              {formatPrice(order.totalAmount)}
            </p>
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
            <p className="text-[10px] text-gray-500 pl-4">
              +{moreItems} more item{moreItems > 1 ? "s" : ""}
            </p>
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

// Drag Overlay Card
export function OrderCardOverlay({ order }) {
  return (
    <div className="bg-gray-800 border-2 border-blue-500 rounded-lg shadow-2xl w-[280px] rotate-3">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700/50 bg-gray-800/50 rounded-t-lg">
        <GripVertical className="w-4 h-4 text-blue-400" />
        <span className="font-bold text-white text-sm">
          #{order.orderNumber}
        </span>
      </div>
      <div className="p-3">
        <div className="mb-2">
          <span className="text-sm text-gray-200 truncate font-bold block">
            {order.customerName || order.user?.name || "Guest"}
          </span>
          <span className="text-[10px] text-gray-400 block">
            {order.customerPhone ||
              order.phone ||
              order.user?.phone ||
              "No phone"}
          </span>
          {order.address && (
            <p className="text-[10px] text-gray-500 truncate mt-0.5 border-l-2 border-blue-500 pl-1">
              {order.address}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-700/50">
          <span className="text-gray-500">{order.items?.length} items</span>
          <span className="font-bold text-orange-400">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Droppable Kanban Column
function KanbanColumn({
  status,
  orders,
  onCardClick,
  highlightedOrderId,
  isOver,
}) {
  const statusConfig = ORDER_STATUS_COLORS[status] || {};
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col w-[320px] min-w-[320px] max-w-[450px] flex-shrink-0 h-full transition-all duration-200",
        "border-l border-r border-gray-800",
        isOver && "bg-gray-900/50",
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
          borderBottomColor: statusConfig.color,
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
            style={{ backgroundColor: statusConfig.color, color: "#111" }}
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
          isOver && "ring-2 ring-inset ring-opacity-30",
        )}
        style={{
          ...(isOver && { "--tw-ring-color": statusConfig.color }),
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

export default function KanbanBoard({
  orders,
  onOrderClick,
  onStatusChange,
  highlightedOrderId,
  isChef = false,
}) {
  const [activeId, setActiveId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  // Group by status
  const ordersByStatus = useMemo(() => {
    const grouped = {};
    KANBAN_STATUSES.forEach((status) => {
      grouped[status] = orders
        .filter((order) => order.status === status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });
    return grouped;
  }, [orders]);

  const activeOrder = activeId ? orders.find((o) => o.id === activeId) : null;

  const handleDragStart = (event) => setActiveId(event.active.id);
  const handleDragOver = (event) => setOverColumn(event.over?.id || null);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over) return;
    const orderId = active.id;
    const newStatus = over.id;
    const order = orders.find((o) => o.id === orderId);

    // Chef restrictions on Drag & Drop
    if (isChef) {
      if (newStatus === "CANCELLED") {
        return;
      }
    }

    if (
      order &&
      order.status !== newStatus &&
      KANBAN_STATUSES.includes(newStatus)
    ) {
      onStatusChange(orderId, newStatus);
    }
  };

  return (
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
            onCardClick={onOrderClick}
            highlightedOrderId={highlightedOrderId}
            isOver={overColumn === status}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeOrder ? <OrderCardOverlay order={activeOrder} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
