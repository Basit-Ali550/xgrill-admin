"use client";
import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const { deals, loading, deleteDeal, refetch } = useDeals();
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
                  <div
                    key={deal.id}
                    className="group bg-gray-800/40 backdrop-blur border border-gray-700/50 rounded-2xl overflow-hidden hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col"
                  >
                    {/* Image Header */}
                    <div className="relative h-48 bg-gray-900 overflow-hidden group-hover:h-40 transition-all duration-300">
                      {deal.image ? (
                        <img
                          src={deal.image}
                          alt={deal.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Tag className="text-gray-700" size={48} />
                        </div>
                      )}
                      
                      {/* Status Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                         <Badge className={`${deal.isActive ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'} border-0 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-opacity-80`}>
                            {deal.isActive ? 'Active' : 'Inactive'}
                         </Badge>
                         <Badge className="bg-red-500/90 text-white border-0 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-opacity-80">
                            {calculateSavings(deal.originalPrice, deal.dealPrice)}% OFF
                         </Badge>
                      </div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-xl text-white leading-tight group-hover:text-orange-400 transition-colors">
                           {deal.name}
                         </h3>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                        {deal.description || "No description provided."}
                      </p>

                      <div className="mt-auto pt-4 border-t border-gray-700/50 flex items-end justify-between">
                         <div>
                            <div className="text-xs text-gray-500 mb-1">Price</div>
                            <div className="flex items-baseline gap-2">
                               <span className="text-2xl font-bold text-white">Rs. {deal.dealPrice}</span>
                               <span className="text-sm text-gray-500 line-through decoration-red-500/50">Rs. {deal.originalPrice}</span>
                            </div>
                         </div>
                         
                         <div className="flex gap-2">
                             {/* New View Items Button */}
                             <Button
                              size="sm"
                              variant="ghost" 
                              onClick={() => setViewingDeal(deal)}
                              className="h-9 w-9 p-0 rounded-full bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                              title="View Included Items"
                            >
                               <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost" 
                              onClick={() => handleEdit(deal)}
                              className="h-9 w-9 p-0 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                              title="Edit Deal"
                            >
                               <Edit size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost" 
                              onClick={() => setDeleteId(deal.id)}
                              className="h-9 w-9 p-0 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                              title="Delete Deal"
                            >
                               <Trash2 size={16} />
                            </Button>
                         </div>
                      </div>
                      
                      {/* Included Items Count */}
                      <button 
                        onClick={() => setViewingDeal(deal)}
                        className="mt-3 text-xs font-medium text-gray-500 flex items-center gap-2 bg-gray-900/50 py-1.5 px-3 rounded-lg w-fit hover:bg-gray-800 hover:text-gray-300 transition-colors cursor-pointer"
                      >
                         <Package size={12} className="text-orange-500" />
                         {deal.products?.length || 0} items included
                      </button>
                    </div>
                  </div>
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
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 pb-4 border-b border-gray-700/50 relative">
              <button 
                onClick={() => setViewingDeal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-gray-700/50 p-1 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-bold text-white mb-1 pr-8">{viewingDeal.name}</h3>
              <p className="text-sm text-gray-400">Included Items</p>
            </div>
            
            {/* Items List */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
               {getDealItems(viewingDeal).length > 0 ? (
                 getDealItems(viewingDeal).map((item, index) => (
                   <div key={`${item.id}-${index}`} className="flex items-center gap-3 bg-gray-800/50 p-3 rounded-xl border border-gray-700/30">
                     <div className="h-10 w-10 rounded-lg bg-gray-700 overflow-hidden relative shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={16} className="text-gray-500" />
                          </div>
                        )}
                     </div>
                     <div className="min-w-0">
                       <p className="font-medium text-white truncate">{item.name}</p>
                       <p className="text-xs text-gray-400">
                         {item.category || "Uncategorized"} • Rs. {item.basePrice || item.price}
                       </p>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center py-8 text-gray-500">
                   <Package className="mx-auto mb-2 opacity-30" size={32} />
                   <p>No item details found</p>
                 </div>
               )}
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end">
              <Button onClick={() => setViewingDeal(null)} variant="secondary" size="sm">
                Close
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
