"use client";
import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ORDER_STATUSES, ORDER_STATUS_COLORS } from "@/constants";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, Phone, MapPin, Flame, Package, Mail, User } from "lucide-react";

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
  isChef = false,
}) {
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
          <p className="text-xs text-gray-500 uppercase mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-orange-400">
            {formatPrice(order.totalAmount)}
          </p>
        </div>

        {/* Customer Details */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3">
          <div className="flex items-center gap-3 border-b border-gray-700/50 pb-3">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                {order.user?.name || "Guest"}
              </p>
              <p className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                CUSTOMER
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm pt-1">
            <div className="flex items-center gap-3 text-gray-300">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{order.phone || order.user?.phone || "No phone"}</span>
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

        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
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
