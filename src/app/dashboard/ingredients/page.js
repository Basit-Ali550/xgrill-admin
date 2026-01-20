"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, RefreshCw } from "lucide-react";
import { getIngredientsAction, deleteIngredientAction } from "@/app/actions/ingredients";
import AddIngredientModal from "@/components/ingredients/AddIngredientModal";
import AdjustStockModal from "@/components/ingredients/AdjustStockModal";

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [adjustingIngredient, setAdjustingIngredient] = useState(null);


  const fetchIngredients = async () => {
    const res = await getIngredientsAction();
    if (res?.success) {
      setIngredients(res.data);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchIngredients();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this ingredient?")) {
      await deleteIngredientAction(id);
      fetchIngredients();
    }
  };

  const handleEdit = (ingredient) => {
      setEditingIngredient(ingredient);
      setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsAddModalOpen(false);
      setEditingIngredient(null);
      fetchIngredients();
  };

  return (
    <>
      <Header title="Ingredients Management" />
      
      <div className="p-6">
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus size={18} className="mr-2" />
            Add New Ingredient
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🥦</span> Raw Ingredients Stock
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : ingredients.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No ingredients found. Add some to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Unit</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Current Stock</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Cost/Unit</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Threshold</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Status</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((item) => {
                      const isLowStock = item.stock <= item.lowStockThreshold;
                      
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                            isLowStock ? "bg-red-500/5" : ""
                          }`}
                        >
                          <td className="py-4 px-4 font-medium text-white">
                            {item.name}
                          </td>
                          <td className="py-4 px-4 text-center text-gray-400">
                            {item.unit}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`text-lg font-bold ${
                                isLowStock ? "text-red-400" : "text-green-400"
                              }`}
                            >
                              {item.stock}
                            </span>
                          </td>
                           <td className="py-4 px-4 text-center text-gray-400">
                            Rs. {item.costPerUnit}
                          </td>
                          <td className="py-4 px-4 text-center text-gray-500">
                            {item.lowStockThreshold}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge variant={isLowStock ? "destructive" : "success"}>
                              {isLowStock ? "Low Stock" : "In Stock"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAdjustingIngredient(item)}
                                className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10"
                                title="Adjust Stock"
                              >
                                <RefreshCw size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                              >
                                <Trash2 size={16} />
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

      <AddIngredientModal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseModal}
        ingredientToEdit={editingIngredient}
      />
      
      <AdjustStockModal
        isOpen={!!adjustingIngredient}
        onClose={() => setAdjustingIngredient(null)}
        ingredient={adjustingIngredient}
        onSuccess={fetchIngredients}
      />
    </>
  );
}
