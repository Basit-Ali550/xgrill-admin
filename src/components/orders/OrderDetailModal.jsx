"use client";
import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ORDER_STATUSES, ORDER_STATUS_COLORS } from "@/constants";
import { formatDistanceToNow, format } from "date-fns";
import {
  Clock,
  Phone,
  MapPin,
  Flame,
  Package,
  Mail,
  User,
  Receipt,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";

const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  onStatusChange,
  onOrderSelect,
  allOrders = [],
  isChef = false,
}) {
  const [sessionData, setSessionData] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  // Fetch session details when order has a sessionId
  useEffect(() => {
    if (isOpen && order?.sessionId) {
      fetchSessionDetails(order.sessionId);
    } else {
      setSessionData(null);
    }
  }, [isOpen, order?.sessionId]);

  // Keep session order statuses in sync with allOrders (real-time updates)
  useEffect(() => {
    if (!sessionData?.orders || allOrders.length === 0) return;

    const updatedOrders = sessionData.orders.map((sOrder) => {
      const freshOrder = allOrders.find((o) => o.id === sOrder.id);
      if (freshOrder && freshOrder.status !== sOrder.status) {
        return { ...sOrder, status: freshOrder.status };
      }
      return sOrder;
    });

    // Only update if something actually changed
    const hasChanges = updatedOrders.some(
      (o, i) => o.status !== sessionData.orders[i].status,
    );
    if (hasChanges) {
      setSessionData((prev) => ({ ...prev, orders: updatedOrders }));
    }
  }, [allOrders]);

  const fetchSessionDetails = async (sessionId) => {
    setSessionLoading(true);
    try {
      const result = await api.get(`/api/v1/sessions/${sessionId}`);
      if (result.success || result.data) {
        setSessionData(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
    } finally {
      setSessionLoading(false);
    }
  };

  if (!order) return null;

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus && newStatus !== order.status && onStatusChange) {
      onStatusChange(order.id, newStatus);
    }
  };

  const statusConfig = ORDER_STATUS_COLORS[order.status] || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.orderNumber}`}
      className="max-w-lg"
    >
      <div className="space-y-5">
        {/* Status & Time */}
        <div className="flex items-center justify-between">
          <span
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </span>
          <span className="text-sm text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(order.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        {/* Total Amount */}
        <div className="text-center py-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <p className="text-xs text-gray-500 uppercase mb-1">Order Amount</p>
          <p className="text-3xl font-bold text-orange-400">
            {formatPrice(order.totalAmount)}
          </p>
        </div>

        {/* ─── Session Summary Panel ─────────────────────────── */}
        {order.sessionId && (
          <div className="bg-purple-500/5 rounded-xl border border-purple-500/20 overflow-hidden">
            {/* Session Header */}
            <div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/20 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-400">
                🍽️ Dine-In Session
              </span>
            </div>

            <div className="p-4 space-y-3">
              {sessionLoading ? (
                <p className="text-gray-500 text-sm text-center py-2">
                  Loading session...
                </p>
              ) : sessionData ? (
                <>
                  {/* Session Grand Total */}
                  <div className="flex items-center justify-between bg-purple-500/10 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-[10px] text-purple-300/60 uppercase font-bold">
                        Session Grand Total
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sessionData.orderCount} order
                        {sessionData.orderCount > 1 ? "s" : ""} in this session
                      </p>
                    </div>
                    <p className="text-2xl font-extrabold text-purple-400">
                      {formatPrice(sessionData.grandTotal || 0)}
                    </p>
                  </div>

                  {/* All Session Orders List */}
                  {sessionData.orders && sessionData.orders.length > 1 && (
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">
                        All Orders in Session
                      </p>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                        {sessionData.orders.map((sOrder) => {
                          const sStatus =
                            ORDER_STATUS_COLORS[sOrder.status] || {};
                          const isCurrentOrder = sOrder.id === order.id;

                          const handleClick = () => {
                            if (isCurrentOrder) return;
                            // Try to find full order from allOrders first
                            const fullOrder = allOrders.find(
                              (o) => o.id === sOrder.id,
                            );
                            if (fullOrder && onOrderSelect) {
                              onOrderSelect(fullOrder);
                            } else if (onOrderSelect) {
                              // Fallback: use session order data (less complete but works)
                              onOrderSelect(sOrder);
                            }
                          };

                          return (
                            <div
                              key={sOrder.id}
                              onClick={handleClick}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                isCurrentOrder
                                  ? "bg-purple-500/15 border border-purple-500/30"
                                  : "bg-gray-800/30 hover:bg-gray-700/40 cursor-pointer"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs font-bold ${isCurrentOrder ? "text-purple-400" : "text-gray-400"}`}
                                >
                                  #{sOrder.orderNumber}
                                </span>
                                {isCurrentOrder && (
                                  <span className="text-[8px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                                    VIEWING
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                  style={{
                                    color: sStatus.color,
                                    backgroundColor: sStatus.bg,
                                  }}
                                >
                                  {sStatus.label || sOrder.status}
                                </span>
                                <span className="text-gray-300 font-medium text-xs">
                                  {formatPrice(sOrder.totalAmount)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-xs text-center">
                  Session info unavailable
                </p>
              )}
            </div>
          </div>
        )}

        {/* Customer Details */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3">
          <div className="flex items-center gap-3 border-b border-gray-700/50 pb-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                {order.customerName || order.user?.name || "Guest"}
              </p>
              <p className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                {order.customerName ? "DINE-IN" : "CUSTOMER"}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm pt-1">
            <div className="flex items-center gap-3 text-gray-300">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>
                {order.customerPhone ||
                  order.phone ||
                  order.user?.phone ||
                  "No phone"}
              </span>
            </div>

            {order.user?.email && (
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{order.user.email}</span>
              </div>
            )}

            {order.address && (
              <div className="flex items-start gap-3 text-gray-300">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <span className="leading-tight">{order.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2">
            <Package className="w-3 h-3" /> Items ({order.items?.length})
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {order.items?.map((item, idx) => {
              const itemName =
                item.product?.name || item.deal?.name || "Unknown";
              const isDeal = !!item.deal;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-bold text-sm">
                      {item.quantity}x
                    </span>
                    <span className="text-white text-sm">{itemName}</span>
                    {isDeal && (
                      <span className="bg-orange-500/20 text-orange-400 text-[9px] px-1 py-0.5 rounded font-bold flex items-center gap-0.5">
                        <Flame className="w-2 h-2" /> DEAL
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-sm text-yellow-400">
            📝 {order.notes}
          </div>
        )}

        {/* Update Status */}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
            Update Status
          </label>
          <Select
            value={order.status}
            onChange={handleStatusChange}
            options={ORDER_STATUSES.filter(
              (s) => !isChef || s !== "CANCELLED",
            ).map((s) => ({
              value: s,
              label: ORDER_STATUS_COLORS[s]?.label || s.replace(/_/g, " "),
            }))}
            className="w-full"
          />
        </div>

        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
          <div className="flex gap-2 pt-2">
            {order.status === "PENDING" && (
              <Button
                onClick={() => onStatusChange(order.id, "PREPARING")}
                className="flex-1 bg-purple-600 hover:bg-purple-500"
              >
                Start Preparing
              </Button>
            )}
            {order.status === "PREPARING" && (
              <Button
                onClick={() => onStatusChange(order.id, "PREPARED")}
                className="flex-1 bg-blue-600 hover:bg-blue-500"
              >
                Mark Prepared
              </Button>
            )}
            {order.status === "PREPARED" && (
              <Button
                onClick={() => onStatusChange(order.id, "OUT_FOR_DELIVERY")}
                className="flex-1 bg-orange-600 hover:bg-orange-500"
              >
                Send for Delivery
              </Button>
            )}
            {order.status === "OUT_FOR_DELIVERY" && (
              <Button
                onClick={() => onStatusChange(order.id, "DELIVERED")}
                className="flex-1 bg-green-600 hover:bg-green-500"
              >
                Mark Delivered
              </Button>
            )}
            {order.status === "DELIVERED" && !isChef && (
              <Button
                onClick={() => onStatusChange(order.id, "COMPLETED")}
                className="flex-1 bg-teal-600 hover:bg-teal-500"
              >
                ✅ Complete — Payment Done
              </Button>
            )}
            {!isChef && (
              <Button
                variant="ghost"
                onClick={() => onStatusChange(order.id, "CANCELLED")}
                className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
