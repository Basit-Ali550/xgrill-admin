"use client";
import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { useDeals } from "@/hooks/useDeals";
import AddDealModal from "@/components/deals/AddDealModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { getProductsAction } from "@/app/actions/products";
import { 
  Plus, 
  Search, 
  Tag, 
  Edit, 
  Trash2, 
  Filter, 
  Check, 
  ChevronDown, 
  AlertCircle,
  Eye,
  Package,
  X
} from "lucide-react";
import toast from "react-hot-toast";

export default function DealsPage() {
  const { deals, loading, deleteDeal, updateDeal, refetch } = useDeals();
  const [products, setProducts] = useState([]); // Store all products for lookup
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [viewingDeal, setViewingDeal] = useState(null); // For viewing deal contents
  
  // Delete State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, ACTIVE, INACTIVE
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch products for lookup
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await getProductsAction({ includeInventory: "true" });
      if (res?.success) {
        setProducts(res.data || []);
      }
    };
    fetchProducts();
  }, []);

  // Handlers
  const handleEdit = (deal) => {
    setEditingDeal(deal);
    setIsAddModalOpen(true);
  };

  const handleCreate = () => {
    setEditingDeal(null);
    setIsAddModalOpen(true);
  };

  const handleToggleStatus = async (deal) => {
    console.log("Toggling deal:", deal.id, "to", !deal.isActive);
    try {
      const newStatus = !deal.isActive;
      const result = await updateDeal(deal.id, { isActive: newStatus });
      if (result.success) {
        toast.success(`Deal ${newStatus ? 'activated' : 'deactivated'}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("Error updating status");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const result = await deleteDeal(deleteId);
      if (result.success) {
        toast.success("Deal deleted successfully");
        setDeleteId(null);
      } else {
        toast.error("Failed to delete deal");
      }
    } catch (error) {
       toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const onSuccess = () => {
    refetch(); // Refresh list
    toast.success(editingDeal ? "Deal updated!" : "Deal created!");
  };

  // Helper to get product details
  const getDealItems = (deal) => {
    if (!deal.products || !products.length) return [];
    return deal.products.map(id => products.find(p => p.id === id)).filter(Boolean);
  };

  // derived state
  const filteredDeals = useMemo(() => {
    if (!deals) return [];
    
    return deals.filter(deal => {
      // Search filter
      const matchesSearch = deal.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      let matchesStatus = true;
      if (statusFilter === "ACTIVE") matchesStatus = deal.isActive;
      if (statusFilter === "INACTIVE") matchesStatus = !deal.isActive;
      
      return matchesSearch && matchesStatus;
    });
  }, [deals, searchQuery, statusFilter]);

  const calculateSavings = (original, deal) => {
    if (original <= 0) return 0;
    return Math.round(((original - deal) / original) * 100);
  };

  return (
    <>
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                 <Tag className="text-orange-500" /> Exclusive Bundles
              </h1>
              <p className="text-sm text-gray-400">Manage promotional offers and combos</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                 <Input 
                    placeholder="Search deals..." 
                    className="pl-9 bg-gray-900 border-gray-700 hover:border-gray-600 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
               </div>
               
               {/* Custom Filter Dropdown */}
               <div className="relative">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="h-10 px-4 bg-gray-900 border border-gray-700 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Filter size={16} className={statusFilter !== 'ALL' ? "text-orange-500" : "text-gray-400"} />
                    <span>{statusFilter === 'ALL' ? 'All Status' : statusFilter === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                  
                  {isFilterOpen && (
                    <>
                       <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                       <div className="absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                          {['ALL', 'ACTIVE', 'INACTIVE'].map(status => (
                             <button
                                key={status}
                                onClick={() => { setStatusFilter(status); setIsFilterOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700/50 flex justify-between items-center ${statusFilter === status ? 'text-white bg-gray-700/50' : 'text-gray-300'}`}
                             >
                               {status.charAt(0) + status.slice(1).toLowerCase()}
                               {statusFilter === status && <Check size={14} className="text-orange-500" />}
                             </button>
                          ))}
                       </div>
                    </>
                  )}
               </div>

               <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20">
                 <Plus size={18} className="mr-2" /> Add Deal
               </Button>
            </div>
        </div>

        {/* Content */}
        {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500">Loading deals...</p>
             </div>
        ) : filteredDeals.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center bg-gray-900/30 border-2 border-dashed border-gray-800 rounded-xl">
                <Tag size={48} className="text-gray-700 mb-4" />
                <h3 className="text-xl font-bold text-gray-400">No deals found</h3>
                <p className="text-gray-500 mb-6">
                   {searchQuery || statusFilter !== 'ALL' 
                     ? "Try adjusting your filters" 
                     : "Create your first promotional bundle"}
                </p>
                <Button variant="outline" onClick={handleCreate}>Create Deal</Button>
             </div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-6 pr-2 custom-scrollbar">
              {filteredDeals.map((deal) => (
                <ItemCard
                   key={deal.id}
                   title={deal.name}
                   image={deal.image}
                   isActive={deal.isActive}
                   description={deal.description}
                   
                   onToggleStatus={() => handleToggleStatus(deal)}
                   onEdit={() => handleEdit(deal)}
                   onDelete={() => setDeleteId(deal.id)}
                   onView={() => setViewingDeal(deal)}
                   
                   priceDisplay={
                     <div>
                       <div className="flex items-baseline gap-2">
                         <span className="text-xl font-bold text-white">Rs. {deal.dealPrice.toFixed(3)}</span>
                         <span className="text-sm text-gray-500 line-through decoration-red-500/50">Rs. {deal.originalPrice.toFixed(3)}</span>
                       </div>
                       <span className="text-xs text-green-400 font-medium">Save {calculateSavings(deal.originalPrice, deal.dealPrice)}%</span>
                     </div>
                   }
                   
                   bottomContent={
                     <button 
                       onClick={() => setViewingDeal(deal)}
                       className="text-xs font-medium text-gray-500 flex items-center gap-2 bg-gray-900/50 py-1.5 px-3 rounded-lg w-fit hover:bg-gray-800 hover:text-gray-300 transition-colors cursor-pointer"
                     >
                       <Package size={12} />
                       {deal.products?.length || 0} items included
                     </button>
                   }
                />
              ))}
           </div>
        )}
      </div>

      <AddDealModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={onSuccess}
        deal={editingDeal} // Pass editing deal
      />
      
      {/* View Deal Details Modal */}
      {viewingDeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header with Image Background if available */}
            <div className={`relative ${viewingDeal.image ? 'h-48' : 'p-6 pb-4 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700/50'}`}>
              {viewingDeal.image && (
                <>
                  <img src={viewingDeal.image} alt={viewingDeal.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-linear-to-t from-gray-900 via-transparent to-transparent" />
                </>
              )}
              
              <button 
                onClick={() => setViewingDeal(null)}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all backdrop-blur z-10"
              >
                <X size={20} />
              </button>

              <div className={`absolute bottom-0 left-0 right-0 p-6 ${!viewingDeal.image && 'static p-0'}`}>
                 <div className="flex justify-between items-end">
                    <div>
                      <Badge className={`mb-2 ${viewingDeal.isActive ? 'bg-green-500' : 'bg-gray-500'} border-0`}>
                        {viewingDeal.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <h3 className="text-2xl font-bold text-white leading-tight shadow-black drop-shadow-md">{viewingDeal.name}</h3>
                    </div>
                    <div className="text-right">
                       <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg mb-1 inline-block shadow-lg">
                         {calculateSavings(viewingDeal.originalPrice, viewingDeal.dealPrice)}% OFF
                       </div>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-6">
               
               {/* Pricing Card */}
               <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Total Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">Rs. {viewingDeal.dealPrice.toFixed(3)}</span>
                      <span className="text-sm text-gray-500 line-through">Rs. {viewingDeal.originalPrice.toFixed(3)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">You Save</p>
                    <p className="text-green-400 font-bold text-lg">Rs. {(viewingDeal.originalPrice - viewingDeal.dealPrice).toFixed(3)}</p>
                  </div>
               </div>

               {/* Description */}
               {viewingDeal.description && (
                 <div>
                   <h4 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">Description</h4>
                   <p className="text-gray-400 leading-relaxed bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                     {viewingDeal.description}
                   </p>
                 </div>
               )}

               {/* Validity */}
               {(viewingDeal.validFrom || viewingDeal.validUntil) && (
                 <div className="grid grid-cols-2 gap-4">
                    {viewingDeal.validFrom && (
                      <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                        <p className="text-xs text-gray-500 mb-1">Valid From</p>
                        <p className="text-sm text-white font-medium">
                          {new Date(viewingDeal.validFrom).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {viewingDeal.validUntil && (
                      <div className="bg-gray-800/30 p-3 rounded-lg border border-gray-700/30">
                        <p className="text-xs text-gray-500 mb-1">Valid Until</p>
                        <p className="text-sm text-white font-medium">
                          {new Date(viewingDeal.validUntil).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                 </div>
               )}

               {/* Included Items */}
               <div>
                 <h4 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider flex items-center gap-2">
                   <Package size={16} className="text-orange-500" />
                   What&apos;s Included ({getDealItems(viewingDeal).length} Items)
                 </h4>
                 <div className="space-y-2">
                   {getDealItems(viewingDeal).length > 0 ? (
                     getDealItems(viewingDeal).map((item, index) => (
                       <div key={`${item.id}-${index}`} className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700/30 hover:bg-gray-800 transition-colors">
                         <div className="h-12 w-12 rounded-lg bg-gray-700 overflow-hidden relative shrink-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={16} className="text-gray-500" />
                              </div>
                            )}
                         </div>
                         <div className="min-w-0 flex-1">
                           <div className="flex justify-between items-start">
                             <p className="font-medium text-white truncate pr-2">{item.name}</p>
                             <p className="text-sm font-bold text-orange-400 whitespace-nowrap">Rs. {(item.basePrice || item.price || 0).toFixed(3)}</p>
                           </div>
                           <p className="text-xs text-gray-400">
                             {item.category || "Uncategorized"}
                           </p>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-6 text-gray-500 bg-gray-800/20 rounded-xl border border-gray-700/30 dashed">
                       <Package className="mx-auto mb-2 opacity-30" size={24} />
                       <p className="text-sm">No items configured for this deal</p>
                     </div>
                   )}
                 </div>
               </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-3 z-10">
              <Button onClick={() => setViewingDeal(null)} variant="secondary">
                Close
              </Button>
              <Button onClick={() => { setViewingDeal(null); handleEdit(viewingDeal); }} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Edit size={16} className="mr-2" /> Edit Deal
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmDialog 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Bundle"
        description="Are you sure you want to delete this deal? This action cannot be undone."
        isLoading={isDeleting}
      />
    </>
  );
}
