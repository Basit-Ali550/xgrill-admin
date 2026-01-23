"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, playNotificationSound } = useSocket();

  const fetchOrders = useCallback(async () => {
    try {
      const result = await api.get("/api/v1/orders");
      if (result.success) {
        setOrders(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      setOrders((prev) => [order, ...prev]);
      playNotificationSound();
    };

    const handleOrderStatusUpdate = (data) => {
      setOrders((prev) => prev.map((order) => (order.id === data.orderId ? { ...order, status: data.status } : order)));
    };

    socket.on("new_order", handleNewOrder);
    socket.on("order_status_update", handleOrderStatusUpdate);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_status_update", handleOrderStatusUpdate);
    };
  }, [socket, playNotificationSound]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId, status) => {
    const result = await api.patch(`/api/v1/orders/${orderId}/status`, { status });
    if (result.success) {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? result.data : order)));
    }
    return result;
  };

  return { orders, loading, error, fetchOrders, updateOrderStatus };
}
