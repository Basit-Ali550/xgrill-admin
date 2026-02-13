"use client";
import React, { useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ORDER_STATUSES, ORDER_STATUS_COLORS } from "@/constants";
import { formatDistanceToNow, format } from "date-fns";
import {
  Clock,
  Phone,
  MapPin,
  Package,
  User,
  Receipt,
  Users,
  Plus,
} from "lucide-react";
import { addItemAction } from "@/app/actions/orders"; // Will create this
import toast from "react-hot-toast";

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
  products = [],
  inventoryProducts = [],
  deals = [],
}) {
  const [isSubmittingItem, setIsSubmittingItem] = React.useState(false);

  const customerOrders = useMemo(() => {
    if (!order) return null; // Safety check

    // Safety check: Needs a name to even consider grouping
    const currentName = order.customerName || order.user?.name;
    if (!currentName) return null;

    const related = allOrders.filter((o) => {
      // 1. Same Order is always related
      if (o.id === order.id) return true;

      const isGuestOrder = !!order.customerName;
      if (
        !isGuestOrder &&
        o.user?.id &&
        order.user?.id &&
        o.user.id === order.user.id
      ) {
        return true;
      }
      // 2. Guest Order Grouping Logic
      const oName = o.customerName || o.user?.name;
      const currentName = order.customerName || order.user?.name;

      // Basic check: Names must match
      if (
        !oName ||
        !currentName ||
        oName.toLowerCase() !== currentName.toLowerCase()
      ) {
        return false;
      }

      const oPhone = o.customerPhone || o.user?.phone;
      const currentPhone = order.customerPhone || order.user?.phone;

      const oAddress = o.address;
      const currentAddress = order.address;

      // Match Strategy A: Phone Number (Strongest)
      if (currentPhone && oPhone && currentPhone === oPhone) {
        return true;
      }

      // Match Strategy B: Address (If Phone is missing/different but Address is same)
      // Only if both have addresses and they match
      if (
        currentAddress &&
        oAddress &&
        currentAddress.toLowerCase() === oAddress.toLowerCase()
      ) {
        return true;
      }

      // Match Strategy C: If no phone and no address, but name matches?
      // Risk of false positive for common names like "Ali".
      // But user specifically asked for "bhai jan" to be grouped.
      // If the name is very specific, maybe?
      // Let's stick to Name + Address OR Name + Phone.
      // If user provided no phone AND no address, we probably shouldn't group unless we are sure.
      // However, the user example HAS address: "143 Bowery". So Strategy B should cover it.

      return false;
    });

    if (related.length <= 1) return null; // No grouping needed for single orders

    // Sort by date (newest first)
    related.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const grandTotal = related.reduce(
      (sum, o) => sum + (o.totalAmount || 0),
      0,
    );
    return { orders: related, grandTotal, count: related.length };
  }, [order, allOrders]);

  if (!order) return null;

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    if (newStatus && newStatus !== order.status && onStatusChange) {
      onStatusChange(order.id, newStatus);
    }
  };

  const statusConfig = ORDER_STATUS_COLORS[order.status] || {};

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Order #${order.orderNumber}`}
        className="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2"
              style={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
              }}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-75" />
              {statusConfig.label}
            </div>
            <span className="text-sm text-gray-400 flex items-center gap-1.5 bg-gray-800 px-3 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-4 py-3 bg-gray-800 border-b border-gray-700/50 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Customer Details
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${order.customerName ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-gray-700 text-gray-400 border-gray-600"}`}
                  >
                    {order.customerName
                      ? "DINE-IN CUSTOMER"
                      : "DELIVERY / TAKEOUT"}
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6 text-gray-200" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-base leading-tight">
                        {order.customerName || order.user?.name || "Guest"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Customer ID:{" "}
                        <span className="font-mono text-gray-400">
                          {order.user?.id?.slice(-6) || "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 bg-gray-900/30 p-2 rounded-lg border border-gray-800">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">
                          Phone
                        </p>
                        <p className="text-sm text-gray-300 font-medium">
                          {order.customerPhone ||
                            order.user?.phone ||
                            "No phone"}
                        </p>
                      </div>
                    </div>

                    {/* Placed By (User/Staff) */}
                    <div className="flex items-center gap-3 bg-gray-900/30 p-2 rounded-lg border border-gray-800">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0">
                        <Receipt className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold">
                          Placed By
                        </p>
                        <p className="text-sm text-gray-300 font-medium">
                          {order.user?.name || "Unknown"}
                        </p>
                      </div>
                    </div>

                    {order.address && (
                      <div className="flex items-start gap-3 bg-gray-900/30 p-3 rounded-lg border border-gray-800">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                        <div>
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">
                            Delivery Address
                          </p>
                          <span className="text-sm text-gray-300 leading-relaxed">
                            {order.address}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {customerOrders && (
                    <div className="mt-4 border-t border-gray-800 pt-3">
                      <div className="flex items-center justify-between px-3 mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          Related Orders ({customerOrders.count})
                        </span>
                      </div>
                      <div className="mx-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20 flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-green-400 uppercase">
                          Total Payable (All Orders)
                        </span>
                        <span className="text-xl font-bold text-green-400 drop-shadow-sm font-mono tracking-tight">
                          {formatPrice(customerOrders.grandTotal)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {customerOrders && (
                  <div className="p-3">
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                      {customerOrders.orders.map((cOrder) => {
                        const cStatus =
                          ORDER_STATUS_COLORS[cOrder.status] || {};
                        const isCurrentOrder = cOrder.id === order.id;

                        return (
                          <div
                            key={cOrder.id}
                            onClick={() =>
                              !isCurrentOrder && onOrderSelect?.(cOrder)
                            }
                            className={`flex flex-col gap-2 px-3 py-2.5 rounded-lg text-sm border transition-all ${
                              isCurrentOrder
                                ? "bg-purple-500/20 border-purple-500/50 shadow-sm"
                                : "bg-gray-800/40 border-transparent hover:bg-gray-700/60 cursor-pointer hover:border-gray-700"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-xs font-mono font-bold ${isCurrentOrder ? "text-purple-300" : "text-gray-400"}`}
                                >
                                  #{cOrder.orderNumber}
                                </span>
                                {isCurrentOrder && (
                                  <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                                  style={{
                                    color: cStatus.color,
                                    backgroundColor: `${cStatus.color}20`,
                                  }}
                                >
                                  {cStatus.label || cOrder.status}
                                </span>
                                <span className="text-gray-300 font-bold font-mono text-xs">
                                  {formatPrice(cOrder.totalAmount)}
                                </span>
                              </div>
                            </div>
                            <div className="text-[11px] text-gray-500 truncate w-full pl-1 border-l-2 border-gray-700">
                              {cOrder.items
                                ?.map(
                                  (i) =>
                                    `${i.quantity}x ${i.product?.name || i.deal?.name || "Item"}`,
                                )
                                .join(", ")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Right Column: Order Items & Actions ─── */}
            <div className="space-y-6">
              {/* Order Items & Summary */}
              <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden flex flex-col h-full">
                <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Order Items
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                    {order.items?.length} items
                  </span>
                </div>

                <div className="flex-1 max-h-[350px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg hover:bg-gray-800/60 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center font-bold text-orange-400 border border-gray-600/50">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                            {item.product?.name ||
                              item.deal?.name ||
                              "Unknown Item"}
                          </p>
                          {item.deal && (
                            <span className="text-[9px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded uppercase font-bold border border-orange-500/20">
                              Deal
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-400 font-mono group-hover:text-white">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Total Footer */}
                <div className="px-5 py-4 bg-gray-900/80 border-t border-gray-700/50 flex justify-between items-center mt-auto">
                  <span className="text-sm font-medium text-gray-400">
                    Total Amount
                  </span>
                  <span className="text-2xl font-bold text-orange-500 drop-shadow-sm font-mono tracking-tight">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/20 flex gap-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <p className="text-xs font-bold text-yellow-500 uppercase mb-0.5">
                      Customer Notes
                    </p>
                    <p className="text-sm text-yellow-100/80 italic">
                      &quot;{order.notes}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-2 border-t border-gray-800">
                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">
                    Manual Status Override
                  </label>
                  <Select
                    value={order.status}
                    onChange={handleStatusChange}
                    options={ORDER_STATUSES.filter(
                      (s) => !isChef || s !== "CANCELLED",
                    ).map((s) => ({
                      value: s,
                      label:
                        ORDER_STATUS_COLORS[s]?.label || s.replace(/_/g, " "),
                    }))}
                    className="w-full bg-gray-800 border-gray-700"
                  />
                </div>

                {order.status !== "COMPLETED" &&
                  order.status !== "CANCELLED" && (
                    <div className="flex gap-2">
                      {/* Dynamic Primary Action Button */}
                      {order.status === "PENDING" && (
                        <Button
                          onClick={() => onStatusChange(order.id, "PREPARING")}
                          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold h-11 shadow-lg shadow-purple-900/20"
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === "PREPARING" && (
                        <Button
                          onClick={() => onStatusChange(order.id, "PREPARED")}
                          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold h-11 shadow-lg shadow-blue-900/20"
                        >
                          Mark Prepared
                        </Button>
                      )}
                      {order.status === "PREPARED" && (
                        <Button
                          onClick={() =>
                            onStatusChange(order.id, "OUT_FOR_DELIVERY")
                          }
                          className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold h-11 shadow-lg shadow-orange-900/20"
                        >
                          Send for Delivery
                        </Button>
                      )}
                      {order.status === "OUT_FOR_DELIVERY" && (
                        <Button
                          onClick={() => onStatusChange(order.id, "DELIVERED")}
                          className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold h-11 shadow-lg shadow-green-900/20"
                        >
                          Mark Delivered
                        </Button>
                      )}
                      {order.status === "DELIVERED" && !isChef && (
                        <Button
                          onClick={() => onStatusChange(order.id, "COMPLETED")}
                          className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold h-11 shadow-lg shadow-teal-900/20"
                        >
                          Complete Order
                        </Button>
                      )}

                      {/* Secondary Action: Cancel */}
                      {!isChef && (
                        <Button
                          variant="outline"
                          onClick={() => onStatusChange(order.id, "CANCELLED")}
                          className="border-red-900/30 text-red-400 hover:bg-red-950 hover:text-red-300 hover:border-red-900/50 h-11 px-6"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}

                {/* Add Item Button (Admins Only, Active Orders) */}
                {!isChef &&
                  order.status !== "COMPLETED" &&
                  order.status !== "CANCELLED" && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <Button
                        variant="outline"
                        className="w-full border-dashed border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600 h-10"
                        onClick={() => {
                          const params = new URLSearchParams();
                          if (order.user?.id)
                            params.set("customerId", order.user.id);
                          if (order.customerName)
                            params.set("name", order.customerName);
                          if (order.customerPhone)
                            params.set("phone", order.customerPhone);
                          if (order.address)
                            params.set("address", order.address);

                          // If it's a guest order but has a user object (rare but possible), prioritize the active fields
                          if (!order.user?.id) {
                            // Ensure guest fields are sent if no ID
                            if (order.customerName)
                              params.set("name", order.customerName);
                          }

                          window.location.href = `/dashboard/orders/manual?${params.toString()}`;
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Item (New Order)
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
