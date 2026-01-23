"use client";
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  const fetchProducts = useCallback(async () => {
    try {
      const result = await api.get("/api/v1/products");
      if (result.success) {
        setProducts(result.data);
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

    const handleProductAdded = (product) => setProducts((prev) => [product, ...prev]);
    const handleProductUpdated = (product) => setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
    const handleProductDeleted = ({ id }) => setProducts((prev) => prev.filter((p) => p.id !== id));

    socket.on("product_added", handleProductAdded);
    socket.on("product_updated", handleProductUpdated);
    socket.on("product_deleted", handleProductDeleted);

    return () => {
      socket.off("product_added", handleProductAdded);
      socket.off("product_updated", handleProductUpdated);
      socket.off("product_deleted", handleProductDeleted);
    };
  }, [socket]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (productData) => {
    return await api.post("/api/v1/products", productData);
  };

  const updateProduct = async (id, productData) => {
    return await api.put(`/api/v1/products/${id}`, productData);
  };

  const deleteProduct = async (id) => {
    return await api.delete(`/api/v1/products/${id}`);
  };

  return { products, loading, error, fetchProducts, createProduct, updateProduct, deleteProduct };
}
