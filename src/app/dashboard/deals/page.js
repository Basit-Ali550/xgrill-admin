"use client";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDeals } from "@/hooks/useDeals";
import AddDealModal from "@/components/deals/AddDealModal";

export default function DealsPage() {
  const { deals, loading, deleteDeal } = useDeals();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteDeal(id);
      } catch (error) {
        console.error("Failed to delete deal:", error);
      }
    }
  };

  const handleAddDeal = (deal) => {
    console.log("Deal added successfully:", deal.name);
  };

  const calculateSavings = (original, deal) => {
    if (original <= 0) return 0;
    return Math.round(((original - deal) / original) * 100);
  };

  return (
    <>
      <Header title="Deals" />
      
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>🏷️</span> All Deals
                <Badge variant="secondary" className="ml-2 text-sm font-normal">
                  {deals?.length || 0} items
                </Badge>
              </CardTitle>
              
              <Button onClick={() => setIsAddModalOpen(true)} className="bg-orange-500 hover:bg-orange-600">
                + Add Deal
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : deals?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No deals yet</p>
                <Button variant="outline" onClick={() => setIsAddModalOpen(true)}>
                  Create your first deal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-orange-500/50 transition-all flex flex-col group"
                  >
                    <div className="relative h-40 bg-gray-900">
                      {deal.image ? (
                        <img
                          src={deal.image}
                          alt={deal.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                          🏷️
                        </div>
                      )}
                      
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                          {calculateSavings(deal.originalPrice, deal.dealPrice)}% OFF
                        </Badge>
                        <Badge 
                          className={deal.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}
                        >
                          {deal.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-2">
                        <h3 className="font-bold text-white text-lg leading-tight">{deal.name}</h3>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
                        {deal.description || "No description"}
                      </p>

                      {deal.products && deal.products.length > 0 && (
                        <div className="mb-3 text-xs text-gray-400">
                          📦 {deal.products.length} product(s) included
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                        <div>
                          <span className="text-xl font-bold text-white">
                            Rs. {deal.dealPrice}
                          </span>
                          <span className="text-sm text-gray-500 line-through ml-2">
                            Rs. {deal.originalPrice}
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(deal.id, deal.name)}
                          className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddDealModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddDeal}
      />
    </>
  );
}
