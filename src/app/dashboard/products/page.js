"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useProducts } from "@/hooks/useProducts";
import AddProductModal from "@/components/products/AddProductModal";

export default function ProductsPage() {
  const { products, loading, deleteProduct } = useProducts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, name }
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id, name) => {
    setDeleteTarget({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleAddProduct = (product) => {
    console.log("Product added successfully:", product.name);
  };

  // Get display price for a product
  const getDisplayPrice = (product) => {
    if (product.variants && product.variants.length > 0) {
      // Find default variant or use first one
      const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
      return defaultVariant.price;
    }
    return product.basePrice || product.price || 0;
  };

  // Get price range string for products with sizes
  const getPriceRange = (product) => {
    if (product.variants && product.variants.length > 1) {
      const prices = product.variants.map(v => v.price).sort((a, b) => a - b);
      return `Rs. ${prices[0]} - ${prices[prices.length - 1]}`;
    }
    return `Rs. ${getDisplayPrice(product)}`;
  };

  return (
    <>
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
                      
                      <div className="absolute top-2 right-2 flex gap-1">
                        {product.hasSizes && (
                          <Badge className="bg-blue-500/20 text-blue-400">
                            Sizes
                          </Badge>
                        )}
                        <Badge 
                          variant={product.isActive ? "success" : "secondary"} 
                          className={product.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                        >
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
                      
                      {/* Show size variants if available */}
                      {product.hasSizes && product.variants && product.variants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.variants.map((variant) => (
                            <span 
                              key={variant.size}
                              className={`text-xs px-2 py-1 rounded ${
                                variant.isDefault 
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                                  : 'bg-gray-700/50 text-gray-400'
                              }`}
                            >
                              {variant.size}: Rs.{variant.price}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                        <span className="text-xl font-bold text-white">
                          {getPriceRange(product)}
                        </span>
                        
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsAddModalOpen(true);
                            }}
                            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-full"
                          >
                            ✏️
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(product.id, product.name)}
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

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddProduct}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />
    </>
  );
}
