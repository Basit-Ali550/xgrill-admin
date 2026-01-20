"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInventory } from "@/hooks/useInventory";

export default function InventoryPage() {
  const { inventory, loading, adjustInventory } = useInventory();
  const [adjustments, setAdjustments] = useState({});

  const handleAdjustment = async (productId) => {
    const adjustment = adjustments[productId];
    if (!adjustment || adjustment === 0) return;
    
    try {
      await adjustInventory(productId, adjustment);
      setAdjustments((prev) => ({ ...prev, [productId]: "" }));
    } catch (error) {
      console.error("Failed to adjust inventory:", error);
    }
  };

  return (
    <>
      <Header title="Inventory Management" />
      
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📦</span> Stock Levels
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : inventory?.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No inventory items</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Product</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Stock</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Threshold</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Adjust</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const isLowStock = item.quantity <= item.lowStockThreshold;
                      
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                            isLowStock ? "bg-red-500/5" : ""
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {item.product?.image && (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <span className="text-white font-medium">
                                {item.product?.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.product?.category || "N/A"}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`text-2xl font-bold ${
                                isLowStock ? "text-red-400" : "text-green-400"
                              }`}
                            >
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-gray-500">
                            {item.lowStockThreshold}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant={isLowStock ? "destructive" : "success"}>
                              {isLowStock ? "Low Stock" : "In Stock"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
                              <Input
                                type="number"
                                placeholder="+/-"
                                value={adjustments[item.productId] || ""}
                                onChange={(e) =>
                                  setAdjustments((prev) => ({
                                    ...prev,
                                    [item.productId]: e.target.value,
                                  }))
                                }
                                className="w-20 text-center"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAdjustment(item.productId)}
                                disabled={!adjustments[item.productId]}
                              >
                                Update
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
