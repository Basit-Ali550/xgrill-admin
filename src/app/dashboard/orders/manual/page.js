"use client";

import { useState, useEffect, useMemo } from "react";
import { getProductsAction } from "@/app/actions/products";
import { getDealsAction } from "@/app/actions/deals";
import { getUsersAction } from "@/app/actions/users";
import { placeOrderAction } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  Utensils,
  Tag,
  Loader2,
  Check,
  Store,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function ManualOrderPage() {
  const { user: currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cart State
  const [cart, setCart] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notes, setNotes] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL"); // ALL, PRODUCT, DEAL

  // User Search State
  const [userSearch, setUserSearch] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Auto-select admin as default customer to prevent "disabled button" confusion
    if (currentUser && !selectedUser) {
      setSelectedUser(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    // Debounce user search
    const timer = setTimeout(() => {
      if (userSearch) fetchUsers(userSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, dealsRes] = await Promise.all([
        getProductsAction(),
        getDealsAction(),
      ]);
      if (productsRes.success) setProducts(productsRes.data);
      if (dealsRes.success) setDeals(dealsRes.data);
    } catch (error) {
      toast.error("Failed to load items");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async (query) => {
    setIsLoadingUsers(true);
    try {
      const res = await getUsersAction(query);
      if (res.success) setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const addToCart = (item, type) => {
    setCart((prev) => {
      const existing = prev.find(
        (i) =>
          (type === "product" && i.productId === item.id) ||
          (type === "deal" && i.dealId === item.id)
      );

      if (existing) {
        return prev.map((i) =>
          (type === "product" && i.productId === item.id) ||
          (type === "deal" && i.dealId === item.id)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          productId: type === "product" ? item.id : undefined,
          dealId: type === "deal" ? item.id : undefined,
          name: item.name,
          price: type === "product" ? item.basePrice || item.price : item.dealPrice,
          image: item.image,
          quantity: 1,
          type,
        },
      ];
    });
    toast.success(`Added ${item.name}`);
  };

  const updateQuantity = (index, delta) => {
    setCart((prev) => {
      const newCart = [...prev];
      const item = newCart[index];
      const newQty = item.quantity + delta;
      
      if (newQty <= 0) {
        newCart.splice(index, 1);
      } else {
        item.quantity = newQty;
      }
      return newCart;
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (!selectedUser) return toast.error("Please select a customer");

    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          dealId: item.dealId,
          quantity: item.quantity,
        })),
        customerId: selectedUser.id,
        notes,
      };

      const result = await placeOrderAction(orderData);

      if (result.success) {
        toast.success("Order placed successfully!");
        setCart([]);
        setSelectedUser(null);
        setNotes("");
        setUserSearch("");
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Filter Logic
  const filteredItems = useMemo(() => {
    let items = [];
    
    if (filterType === "ALL" || filterType === "PRODUCT") {
      items = [...items, ...products.map(p => ({ ...p, type: 'product', price: p.basePrice || p.price }))];
    }
    if (filterType === "ALL" || filterType === "DEAL") {
      items = [...items, ...deals.map(d => ({ ...d, type: 'deal', price: d.dealPrice }))];
    }

    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, deals, searchQuery, activeCategory, filterType]);

  const categories = ["ALL", ...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-4 p-4 max-w-[1600px] mx-auto">
      {/* Left Side: Item Grid */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <Card className="bg-gray-800/50 border-gray-700 p-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search menu..."
                  className="pl-10 bg-gray-900 border-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 bg-gray-900 p-1 rounded-lg border border-gray-700">
                <Button
                  variant={filterType === "ALL" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType("ALL")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "PRODUCT" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType("PRODUCT")}
                >
                  <Utensils size={16} className="mr-2" /> Products
                </Button>
                <Button
                  variant={filterType === "DEAL" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilterType("DEAL")}
                >
                  <Tag size={16} className="mr-2" /> Deals
                </Button>
              </div>
            </div>
            
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    className={activeCategory === cat ? "bg-orange-500 hover:bg-orange-600" : "border-gray-700 hover:bg-gray-800"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </Card>

        <ScrollArea className="flex-1 bg-gray-900/30 rounded-xl border border-gray-800 p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => addToCart(item, item.type)}
                  className="group relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-orange-500/50 transition-all cursor-pointer"
                >
                  <div className="aspect-square relative bg-gray-900">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        {item.type === 'deal' ? <Tag size={40} /> : <Utensils size={40} />}
                      </div>
                    )}
                    {item.type === 'deal' && (
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600">Deal</Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1 h-12">
                      <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-orange-400 font-bold">Rs. {item.price}</span>
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white">
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Side: Cart */}
      <Card className="w-[400px] flex flex-col bg-gray-800 border-gray-700 h-full shadow-2xl">
        <div className="p-4 border-b border-gray-700 space-y-4">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <ShoppingCart className="text-orange-500" />
            Current Order
            {cart.length > 0 && (
              <Badge variant="secondary" className="ml-auto bg-orange-500/20 text-orange-400">
                {cart.reduce((a, b) => a + b.quantity, 0)} Items
              </Badge>
            )}
          </div>

          {/* Customer Selection */}
          <div className="relative">
            <label className="text-xs text-gray-400 mb-1 block">Customer</label>
            {selectedUser ? (
              <div className="flex items-center justify-between bg-gray-900 p-2 rounded-lg border border-green-500/30">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{selectedUser.name}</p>
                    <p className="text-xs text-gray-400">{selectedUser.phone || selectedUser.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                  onClick={() => setSelectedUser(null)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                <Input
                  placeholder="Search Customer (Name/Phone)..."
                  className="pl-9 bg-gray-900 border-gray-700"
                  value={userSearch}
                  onFocus={() => setIsUserDropdownOpen(true)}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                  }}
                />
                
                
                {/* Walk-in Button - More Prominent */}
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-1 top-1 h-8 text-xs border-green-500/30 hover:bg-green-500/10 hover:text-green-400"
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      setSelectedUser(currentUser);
                      toast.success(`Walk-in mode: ${currentUser.name}`);
                    } else {
                      toast.error("User profile loading... please wait");
                    }
                  }}
                >
                  <Store size={14} className="mr-1" /> Walk-in
                </Button>

                {/* Dropdown for users */}
                {isUserDropdownOpen && userSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                     {isLoadingUsers ? (
                        <div className="p-3 text-center text-gray-500 text-sm">Searching...</div>
                     ) : users.length > 0 ? (
                        users.map(user => (
                          <div
                            key={user.id}
                            className="p-3 hover:bg-gray-800 cursor-pointer flex items-center justify-between border-b border-gray-800/50 last:border-0"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUserDropdownOpen(false);
                              setUserSearch("");
                            }}
                          >
                            <div>
                              <p className="text-sm font-medium text-white">{user.name}</p>
                              <p className="text-xs text-gray-400">{user.phone || user.email}</p>
                            </div>
                            {user.role === 'ADMIN' && <Badge variant="outline" className="text-[10px]">Admin</Badge>}
                          </div>
                        ))
                     ) : (
                        <div className="p-3 text-center text-gray-500 text-sm">No users found</div>
                     )}
                  </div>
                )}
                {/* Click outside closer would be nice but for now explicit selection closes it */}
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
              <ShoppingCart size={48} className="mb-2" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div key={`${item.productId}-${item.dealId}-${index}`} className="flex gap-3 bg-gray-900/50 p-2 rounded-lg border border-gray-800 animate-in slide-in-from-right-5 fade-in">
                  <div className="h-16 w-16 bg-gray-800 rounded-md relative overflow-hidden shrink-0">
                    {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-600">
                          {item.type === 'deal' ? <Tag size={16} /> : <Utensils size={16} />}
                        </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                       <h4 className="font-medium text-sm truncate pr-2">{item.name}</h4>
                       <span className="font-bold text-sm">Rs. {item.price * item.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                       <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
                          <button onClick={() => updateQuantity(index, -1)} className="p-1 hover:text-red-400 transition-colors"><Minus size={14} /></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(index, 1)} className="p-1 hover:text-green-400 transition-colors"><Plus size={14} /></button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 bg-gray-800/80 border-t border-gray-700 space-y-4">
           <div>
              <label className="text-xs text-gray-400 mb-1 block">Order Notes</label>
              <Input 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions..."
                className="bg-gray-900 border-gray-700"
              />
           </div>
           
           <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                 <span>Subtotal</span>
                 <span>Rs. {calculateTotal()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-700">
                 <span>Total</span>
                 <span className="text-orange-500">Rs. {calculateTotal()}</span>
              </div>
           </div>

           <div className="space-y-2">
             {!isPlacingOrder && (cart.length === 0 || !selectedUser) && (
               <div className="text-xs text-center text-red-400 font-medium bg-red-500/10 p-2 rounded-md">
                 Required: 
                 {cart.length === 0 && <span className="block">• Add items to cart</span>}
                 {!selectedUser && <span className="block">• Select a customer (or click Walk-in)</span>}
               </div>
             )}
             
             <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePlaceOrder}
              disabled={cart.length === 0 || !selectedUser || isPlacingOrder}
             >
               {isPlacingOrder ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2" />}
               Place Order
             </Button>
           </div>
        </div>
      </Card>
      
      {/* Click outside listener for user dropdown could be added to window but simplified for now */}
      {isUserDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserDropdownOpen(false)}
        />
      )}
    </div>
  );
}
