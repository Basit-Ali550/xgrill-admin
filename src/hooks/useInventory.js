"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  const fetchInventory = useCallback(async () => {
    try {
      const result = await api.get("/api/v1/inventory");
      if (result.success) {
        setInventory(result.data);
        const lowStock = result.data.filter((item) => item.quantity <= item.lowStockThreshold);
        setLowStockItems(lowStock);
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

    const handleInventoryUpdate = (data) => {
      setInventory((prev) => prev.map((item) => (item.productId === data.productId ? data : item)));
      
      if (data.quantity <= data.lowStockThreshold) {
        setLowStockItems((prev) => {
          const exists = prev.find((i) => i.productId === data.productId);
          return exists ? prev.map((i) => (i.productId === data.productId ? data : i)) : [data, ...prev];
        });
      } else {
        setLowStockItems((prev) => prev.filter((i) => i.productId !== data.productId));
      }
    };

    socket.on("inventory_update", handleInventoryUpdate);
    socket.on("inventory_deleted", (data) => {
      setInventory((prev) => prev.filter((item) => item.id !== data.id));
      setLowStockItems((prev) => prev.filter((item) => item.id !== data.id));
    });
    socket.on("inventory_added", fetchInventory);

    return () => {
      socket.off("inventory_update", handleInventoryUpdate);
      socket.off("inventory_deleted");
      socket.off("inventory_added");
    };
  }, [socket, fetchInventory]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const updateInventory = async (id, quantity) => {
    return await api.put(`/api/v1/inventory/${id}`, { quantity: parseInt(quantity) });
  };

  const adjustInventory = async (productId, adjustment, reason) => {
    return await api.patch(`/api/v1/inventory/adjust/${productId}`, { adjustment: parseInt(adjustment), reason });
  };

  const deleteInventoryItem = async (id) => {
    const result = await api.delete(`/api/v1/inventory/${id}`);
    if (result.success) {
      setInventory((prev) => prev.filter((item) => item.id !== id));
      setLowStockItems((prev) => prev.filter((item) => item.id !== id));
    }
    return result;
  };

  return { inventory, lowStockItems, loading, error, fetchInventory, updateInventory, adjustInventory, deleteInventoryItem };
}
