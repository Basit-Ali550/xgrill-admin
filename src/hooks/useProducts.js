"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();
  const { token } = useAuth();

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/products`);
      const data = await res.json();
      
      if (data.success) {
        setProducts(data.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for product updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleProductAdded = (product) => {
      setProducts((prev) => [product, ...prev]);
    };

    const handleProductUpdated = (product) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );
    };

    const handleProductDeleted = ({ id }) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    socket.on("product_added", handleProductAdded);
    socket.on("product_updated", handleProductUpdated);
    socket.on("product_deleted", handleProductDeleted);

    return () => {
      socket.off("product_added", handleProductAdded);
      socket.off("product_updated", handleProductUpdated);
      socket.off("product_deleted", handleProductDeleted);
    };
  }, [socket]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Create product
  const createProduct = async (productData) => {
    const res = await fetch(`${API_URL}/api/v1/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    return data;
  };

  // Update product
  const updateProduct = async (id, productData) => {
    const res = await fetch(`${API_URL}/api/v1/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    return data;
  };

  // Delete product
  const deleteProduct = async (id) => {
    const res = await fetch(`${API_URL}/api/v1/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data;
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
