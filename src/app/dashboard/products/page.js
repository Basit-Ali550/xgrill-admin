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
import { ItemCard } from "@/components/dashboard/ItemCard";
import { useAuth } from "@/context/AuthContext";

export default function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
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
      return `Rs. ${prices[0].toFixed(3)} - ${prices[prices.length - 1].toFixed(3)}`;
    }
    return `Rs. ${getDisplayPrice(product).toFixed(3)}`;
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
            {isAdmin && (
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                + Add Item
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <LoadingSpinner />
          ) : products?.length === 0 ? (
            <EmptyState icon="🍔" message="No products yet" actionLabel={isAdmin ? "Add your first item" : undefined} onAction={isAdmin ? () => setIsAddModalOpen(true) : undefined} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ItemCard
                  key={product.id}
                  title={product.name}
                  subtitle={product.category}
                  image={product.image}
                  isActive={product.isActive}
                  description={product.description}

                  onToggleStatus={isAdmin ? () => handleToggleStatus(product) : undefined}
                  onEdit={isAdmin ? () => { setEditingProduct(product); setIsAddModalOpen(true); } : undefined}
                  onDelete={isAdmin ? () => setDeleteTarget({ id: product.id, name: product.name }) : undefined}
                  
                  topBadges={product.hasSizes && <Badge className="bg-blue-500/20 text-blue-400">Sizes</Badge>}
                  
                  priceDisplay={
                    <span className="text-xl font-bold text-white">{getPriceRange(product)}</span>
                  }
                  
                  bottomContent={
                    product.hasSizes && product.variants?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.variants.map((variant) => (
                          <span key={variant.size} className={`text-xs px-2 py-1 rounded ${variant.isDefault ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-gray-700/50 text-gray-400'}`}>
                            {variant.size}: Rs.{variant.price.toFixed(3)}
                          </span>
                        ))}
                      </div>
                    )
                  }
                />
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
