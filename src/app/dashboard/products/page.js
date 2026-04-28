"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Edit, Trash2, Search, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProducts } from "@/hooks/useProducts";
import AddProductModal from "@/components/products/AddProductModal";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { useAuth } from "@/context/AuthContext";
import { PRODUCT_CATEGORIES, DATE_FILTER_OPTIONS } from "@/constants";

const PRODUCT_SORT_OPTIONS = [
  { label: "Newest", value: "createdAt:desc" },
  { label: "Oldest", value: "createdAt:asc" },
  { label: "A-Z", value: "name:asc" },
  { label: "Z-A", value: "name:desc" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Price: High to Low", value: "price:desc" },
];

const SIZES_FILTER_OPTIONS = [
  { label: "All Variants", value: "all" },
  { label: "With Sizes", value: "with" },
  { label: "Single Price", value: "without" },
];

export default function ProductsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const { products, loading, deleteProduct, updateProduct } = useProducts();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | inactive
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSizes, setFilterSizes] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState("createdAt:desc");

  const categoryOptions = useMemo(
    () => [{ label: "All Categories", value: "all" }, ...PRODUCT_CATEGORIES],
    []
  );

  const getDisplayPrice = (product) => {
    if (product.variants?.length > 0) {
      const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
      return defaultVariant.price;
    }
    return product.basePrice || product.price || 0;
  };

  const getPriceRange = (product) => {
    if (product.variants?.length > 1) {
      const prices = product.variants.map((v) => v.price).sort((a, b) => a - b);
      return `Rs. ${prices[0].toFixed(3)} - ${prices[prices.length - 1].toFixed(3)}`;
    }
    return `Rs. ${getDisplayPrice(product).toFixed(3)}`;
  };

  const filteredProducts = useMemo(() => {
    let items = [...(products || [])];

    if (filterStatus === "active") items = items.filter((p) => p.isActive);
    else if (filterStatus === "inactive") items = items.filter((p) => !p.isActive);

    if (filterCategory !== "all") {
      items = items.filter((p) => p.category === filterCategory);
    }

    if (filterSizes === "with") items = items.filter((p) => p.hasSizes && p.variants?.length > 0);
    else if (filterSizes === "without") items = items.filter((p) => !p.hasSizes || !p.variants?.length);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((p) =>
        [p.name, p.description, p.category]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q))
      );
    }

    if (dateFilter !== "all") {
      const now = new Date();
      items = items.filter((p) => {
        const d = new Date(p.createdAt);
        if (dateFilter === "today") return d.toDateString() === now.toDateString();
        if (dateFilter === "yesterday") {
          const y = new Date(now);
          y.setDate(y.getDate() - 1);
          return d.toDateString() === y.toDateString();
        }
        if (dateFilter === "week") {
          const w = new Date(now);
          w.setDate(w.getDate() - 7);
          return d >= w;
        }
        if (dateFilter === "month") {
          const m = new Date(now);
          m.setMonth(m.getMonth() - 1);
          return d >= m;
        }
        if (dateFilter === "year") {
          const y = new Date(now);
          y.setFullYear(y.getFullYear() - 1);
          return d >= y;
        }
        return true;
      });
    }

    const [field, order] = sortConfig.split(":");
    items.sort((a, b) => {
      let va, vb;
      if (field === "name") {
        va = a.name || "";
        vb = b.name || "";
      } else if (field === "price") {
        va = getDisplayPrice(a);
        vb = getDisplayPrice(b);
      } else {
        va = new Date(a.createdAt);
        vb = new Date(b.createdAt);
      }
      const cmp = va > vb ? 1 : va < vb ? -1 : 0;
      return order === "asc" ? cmp : -cmp;
    });

    return items;
  }, [products, searchQuery, filterStatus, filterCategory, filterSizes, dateFilter, sortConfig]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("all");
    setFilterCategory("all");
    setFilterSizes("all");
    setDateFilter("all");
    setSortConfig("createdAt:desc");
  };

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

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, description, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-900 border-gray-700 h-10"
          />
        </div>

        <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
              filterStatus === "all" ? "bg-orange-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 cursor-pointer ${
              filterStatus === "active" ? "bg-green-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            <CheckCircle2 size={14} /> Active
          </button>
          <button
            onClick={() => setFilterStatus("inactive")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 cursor-pointer ${
              filterStatus === "inactive" ? "bg-gray-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            <XCircle size={14} /> Inactive
          </button>
        </div>

        {isAdmin && (
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 whitespace-nowrap">
            + Add Item
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 space-y-0 pb-6 border-b border-gray-800">
          <CardTitle className="flex items-center gap-2">
            <span>🍔</span> All Products
            <Badge variant="secondary" className="ml-2 bg-orange-500/10 text-orange-400 border-orange-500/20">
              {filteredProducts.length}
            </Badge>
          </CardTitle>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="w-40">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                options={categoryOptions}
                placeholder="Category"
                className="bg-gray-900 border-gray-700 text-white h-9"
              />
            </div>

            <div className="w-36">
              <Select
                value={filterSizes}
                onChange={(e) => setFilterSizes(e.target.value)}
                options={SIZES_FILTER_OPTIONS}
                className="bg-gray-900 border-gray-700 text-white h-9"
              />
            </div>

            <div className="w-40">
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                options={DATE_FILTER_OPTIONS}
                placeholder="Date"
                className="bg-gray-900 border-gray-700 text-white h-9"
              />
            </div>

            <div className="w-44">
              <Select
                value={sortConfig}
                onChange={(e) => setSortConfig(e.target.value)}
                options={PRODUCT_SORT_OPTIONS}
                className="bg-gray-900 border-gray-700 text-white h-9"
              />
            </div>

            <Button
              variant="outline"
              onClick={resetFilters}
              title="Reset All Filters"
              className="h-9 w-9 p-0 border-gray-700 hover:bg-gray-800 hover:text-orange-400 transition-colors"
            >
              <RefreshCw size={14} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {loading ? (
            <LoadingSpinner />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon="🍔"
              message={products?.length === 0 ? "No products yet" : "No products match the current filters"}
              actionLabel={isAdmin && products?.length === 0 ? "Add your first item" : undefined}
              onAction={isAdmin && products?.length === 0 ? () => setIsAddModalOpen(true) : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
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
