"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import AddProductModal from "@/components/products/AddProductModal";

export default function ProductsPage() {
  const { products, loading, deleteProduct, createProduct } = useProducts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const result = await createProduct(productData);
      if (result.success) {
        // Success notification could be added here
        console.log("Product added successfully");
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to create product. Please try again.");
    }
  };

  return (
    <>
      <Header title="Products" />
      
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>🍔</span> All Products
                <Badge variant="secondary" className="ml-2 text-sm font-normal">
                  {products?.length || 0} items
                </Badge>
              </CardTitle>
              
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                + Add Item
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No products yet</p>
                <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
                  Add your first item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all flex flex-col"
                  >
                    <div className="relative h-40 bg-gray-900">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-800">
                          🍔
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2">
                         <Badge variant={product.isActive ? "success" : "secondary"} className={product.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-2">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-white text-lg leading-tight">{product.name}</h3>
                        </div>
                        <p className="text-xs text-orange-400 uppercase font-semibold tracking-wider">{product.category}</p>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                        {product.description || "No description"}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                        <span className="text-xl font-bold text-white">
                          Rs. {product.price}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-2">
                            <p className="text-xs text-gray-500">Stock</p>
                            <p className={`text-sm font-semibold ${
                              (product.inventory?.quantity || 0) <= (product.inventory?.lowStockThreshold || 10) 
                                ? 'text-red-400' 
                                : 'text-gray-300'
                            }`}>
                              {product.inventory?.quantity || 0}
                            </p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddProduct}
      />
    </>
  );
}
