"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProducts } from "@/hooks/useProducts";
import AddProductModal from "@/components/products/AddProductModal";

export default function ProductsPage() {
  const { products, loading, deleteProduct, updateProduct } = useProducts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive;
      const result = await updateProduct(product.id, { isActive: newStatus });
      if (result.success) {
        // toast.success(`Product ${newStatus ? 'activated' : 'deactivated'}`);
        // No toast needed if real-time update reflects it, but user verification is good.
      } 
    } catch (error) {
      console.error("Toggle error:", error);
    }
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

  const getDisplayPrice = (product) => {
    if (product.variants?.length > 0) {
      const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
      return defaultVariant.price;
    }
    return product.basePrice || product.price || 0;
  };

  const getPriceRange = (product) => {
    if (product.variants?.length > 1) {
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
            <LoadingSpinner />
          ) : products?.length === 0 ? (
            <EmptyState icon="🍔" message="No products yet" actionLabel="Add your first item" onAction={() => setIsAddModalOpen(true)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all flex flex-col">
                  <div className="relative h-40 bg-gray-900">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-800">🍔</div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {product.hasSizes && <Badge className="bg-blue-500/20 text-blue-400">Sizes</Badge>}
                       <Badge className={`${product.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-2">
                      <h3 className="font-bold text-white text-lg leading-tight">{product.name}</h3>
                      <p className="text-xs text-orange-400 uppercase font-semibold tracking-wider">{product.category}</p>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                      {product.description || "No description"}
                    </p>
                    
                    {product.hasSizes && product.variants?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.variants.map((variant) => (
                          <span key={variant.size} className={`text-xs px-2 py-1 rounded ${variant.isDefault ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-700/50 text-gray-400'}`}>
                            {variant.size}: Rs.{variant.price}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                      <span className="text-xl font-bold text-white">{getPriceRange(product)}</span>
                      <div className="flex gap-2 items-center">
                         {/* Status Switch */}
                         <div className="flex items-center">
                            <Switch 
                              checked={product.isActive}
                              onCheckedChange={() => handleToggleStatus(product)}
                              className="h-5 w-9 data-[state=checked]:bg-green-500" 
                            />
                         </div>

                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => { setEditingProduct(product); setIsAddModalOpen(true); }} 
                          className="h-9 w-9 p-0 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => setDeleteTarget({ id: product.id, name: product.name })} 
                          className="h-9 w-9 p-0 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={16} />
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
        onClose={() => { 
          setIsAddModalOpen(false); 
          setEditingProduct(null); 
        }} 
        onAdd={() => {}} 
        product={editingProduct}
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
