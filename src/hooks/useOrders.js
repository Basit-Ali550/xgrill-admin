"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket, playNotificationSound } = useSocket();
  const { token } = useAuth();

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/v1/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Listen for new orders via socket
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order) => {
      console.log("🆕 New order received:", order);
      setOrders((prev) => [order, ...prev]);
      playNotificationSound();
    };

    const handleOrderStatusUpdate = (data) => {
      console.log("📋 Order status updated:", data);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === data.orderId ? { ...order, status: data.status } : order
        )
      );
    };

    socket.on("new_order", handleNewOrder);
    socket.on("order_status_update", handleOrderStatusUpdate);

    return () => {
      socket.off("new_order", handleNewOrder);
      socket.off("order_status_update", handleOrderStatusUpdate);
    };
  }, [socket, playNotificationSound]);

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? data.data : order
          )
        );
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  return { orders, loading, error, fetchOrders, updateOrderStatus };
}
