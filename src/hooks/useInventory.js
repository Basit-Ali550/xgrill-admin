"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();
  const { token } = useAuth();

  // Fetch inventory from API
  const fetchInventory = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/v1/inventory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.success) {
        setInventory(data.data);
        // Filter low stock items
        const lowStock = data.data.filter(
          (item) => item.quantity <= item.lowStockThreshold
        );
        setLowStockItems(lowStock);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Listen for inventory updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleInventoryUpdate = (data) => {
      console.log("📦 Inventory updated:", data);
      setInventory((prev) =>
        prev.map((item) =>
          item.productId === data.productId ? data : item
        )
      );
      
      // Update low stock list
      if (data.quantity <= data.lowStockThreshold) {
        setLowStockItems((prev) => {
          const exists = prev.find((i) => i.productId === data.productId);
          if (exists) {
            return prev.map((i) => (i.productId === data.productId ? data : i));
          }
          return [data, ...prev];
        });
      } else {
        setLowStockItems((prev) =>
          prev.filter((i) => i.productId !== data.productId)
        );
      }
    };

    const handleLowStockAlert = (data) => {
      console.log("⚠️ Low stock alert:", data);
    };

    socket.on("inventory_update", handleInventoryUpdate);
    socket.on("low_stock_alert", handleLowStockAlert);
    socket.on("inventory_deleted", (data) => {
      setInventory((prev) => prev.filter((item) => item.id !== data.id));
      setLowStockItems((prev) => prev.filter((item) => item.id !== data.id));
    });
    socket.on("inventory_added", () => {
      fetchInventory();
    });

    return () => {
      socket.off("inventory_update", handleInventoryUpdate);
      socket.off("low_stock_alert", handleLowStockAlert);
      socket.off("inventory_deleted");
      socket.off("inventory_added");
    };
  }, [socket, fetchInventory]);

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Update inventory quantity
  const updateInventory = async (id, quantity) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/inventory/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: parseInt(quantity) }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Adjust inventory by amount
  const adjustInventory = async (productId, adjustment) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/inventory/adjust/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adjustment: parseInt(adjustment) }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Delete inventory item
  const deleteInventoryItem = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/inventory/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setInventory((prev) => prev.filter((item) => item.id !== id));
        setLowStockItems((prev) => prev.filter((item) => item.id !== id));
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    inventory,
    lowStockItems,
    loading,
    error,
    fetchInventory,
    updateInventory,
    adjustInventory,
    deleteInventoryItem,
  };
}
