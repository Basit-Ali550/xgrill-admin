"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useOrders } from "@/hooks/useOrders";
import { ORDER_STATUSES } from "@/constants";

export default function OrdersPage() {
  const { orders, loading, updateOrderStatus } = useOrders();

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>📋</span> All Orders
          </span>
          <Badge variant="default">{orders?.length || 0} orders</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <LoadingSpinner />
        ) : orders?.length === 0 ? (
          <EmptyState icon="📋" message="No orders yet" />
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className={`p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 ${index === 0 ? "animate-fade-in" : ""}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-orange-400">{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="text-white">{order.user?.name || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="text-white">{order.user?.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Items</p>
                        <p className="text-white">{order.items?.length || 0} items</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total</p>
                        <p className="text-orange-400 font-bold">Rs. {order.totalAmount}</p>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items?.map((item) => (
                          <span key={item.id} className="px-2 py-1 bg-gray-700 rounded text-xs text-white">
                            {item.product?.name} × {item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)} className="w-40">
                      {ORDER_STATUSES.map((status) => (
                        <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center text-xs text-gray-500">
                  <span>Created: {new Date(order.createdAt).toLocaleString()}</span>
                  {order.notes && <span className="text-yellow-400">📝 {order.notes}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
