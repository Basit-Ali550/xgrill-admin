"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useIngredients() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIngredients = useCallback(async () => {
    try {
      const result = await api.get("/api/v1/ingredients");
      if (result.success) {
        setIngredients(result.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  return { ingredients, loading, error, fetchIngredients };
}
