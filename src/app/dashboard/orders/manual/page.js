"use client";

import { useState, useEffect, useMemo } from "react";
import { getProductsAction } from "@/app/actions/products";
import { getDealsAction } from "@/app/actions/deals";
import { getUsersAction } from "@/app/actions/users";
import { placeOrderAction } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from "react-hot-toast";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Utensils,
  Tag,
  Loader2,
  Check,
  Store,
  X,
  Package,
  ChevronDown,
  Filter,
  Layers,
  Phone,
  MapPin,
  ShoppingBag,
  NotebookPen,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function ManualOrderPage() {
  const { user: currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [notes, setNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // User Search State
  const [userSearch, setUserSearch] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser && !selectedUser) {
      setSelectedUser(currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser) {
      setContactPhone(selectedUser.phone || "");
      setDeliveryAddress(selectedUser.address || "");
    } else {
      setContactPhone("");
      setDeliveryAddress("");
    }
  }, [selectedUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearch) fetchUsers(userSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, inventoryRes, dealsRes] = await Promise.all([
        getProductsAction(),
        getProductsAction({ includeInventory: "true" }),
        getDealsAction(),
      ]);
      
      if (productsRes.success) {
        setProducts(productsRes.data.filter(p => !p.isInventoryOnly));
      }
      
      if (inventoryRes.success) {
        setInventoryProducts(
          inventoryRes.data.filter(
            p => p.isInventoryOnly && !p.isServiceSupply && p.isActive
          )
        );
      }
      
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
          (type === "inventory" && i.productId === item.id) ||
          (type === "deal" && i.dealId === item.id)
      );

      if (existing) {
        return prev.map((i) =>
          (type === "product" && i.productId === item.id) ||
          (type === "inventory" && i.productId === item.id) ||
          (type === "deal" && i.dealId === item.id)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          productId: type === "product" || type === "inventory" ? item.id : undefined,
          dealId: type === "deal" ? item.id : undefined,
          name: item.name,
          price: type === "deal" ? item.dealPrice : item.basePrice || item.price,
          image: item.image,
          quantity: 1,
          type,
        },
      ];
    });
    toast.success(`Added ${item.name}`, { duration: 1500 });
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
        phone: contactPhone,
        address: deliveryAddress,
      };

      const result = await placeOrderAction(orderData);

      if (result.success) {
        toast.success("Order placed successfully!");
        setCart([]);
        setNotes("");
        setDeliveryAddress(selectedUser.address || "");
        setContactPhone(selectedUser.phone || "");
      } else {
        toast.error(result.error || "Failed to place order");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Type filter options
  const typeOptions = [
    { key: "ALL", label: "All Types", icon: Layers },
    { key: "PRODUCT", label: "Menu Items", icon: Utensils },
    { key: "INVENTORY", label: "Direct Sale", icon: Package },
    { key: "DEAL", label: "Deals", icon: Tag },
  ];

  const currentType = typeOptions.find(f => f.key === filterType);

  // Categories
  const categories = useMemo(() => {
    const allCategories = [
      ...products.filter((p) => p.isActive).map((p) => p.category),
      ...inventoryProducts.map((p) => p.category),
    ].filter(Boolean);
    return ["ALL", ...new Set(allCategories)];
  }, [products, inventoryProducts]);

  // Filter Logic
  const filteredItems = useMemo(() => {
    let items = [];

    if (filterType === "ALL" || filterType === "PRODUCT") {
      items = [
        ...items,
        ...products
          .filter((p) => p.isActive)
          .map((p) => ({
            ...p,
            type: "product",
            price: p.basePrice || p.price,
          })),
      ];
    }
    
    if (filterType === "ALL" || filterType === "INVENTORY") {
      items = [
        ...items,
        ...inventoryProducts.map((p) => ({
          ...p,
          type: "inventory",
          price: p.basePrice || p.price,
        })),
      ];
    }
    
    if (filterType === "ALL" || filterType === "DEAL") {
      items = [
        ...items,
        ...deals
          .filter((d) => d.isActive)
          .map((d) => ({ ...d, type: "deal", price: d.dealPrice })),
      ];
    }

    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "ALL" || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, inventoryProducts, deals, searchQuery, activeCategory, filterType]);

  const getItemBadge = (type) => {
    switch(type) {
      case "deal": return { label: "DEAL", color: "bg-gradient-to-r from-red-500 to-pink-500" };
      case "inventory": return { label: "DIRECT SALE", color: "bg-gradient-to-r from-green-500 to-emerald-500" };
      default: return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-6">
      {/* Left Side: Menu Grid */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Header */}
       

        {/* Filters Row */}
        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Search..."
              className="pl-11 h-11 bg-gray-800/50 border-gray-700/50 rounded-xl text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsTypeOpen(false); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all min-w-[140px]"
            >
              <Filter size={16} className="text-blue-400" />
              <span className="font-medium text-white text-sm">{activeCategory}</span>
              <ChevronDown size={14} className={`text-gray-400 ml-auto transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isCategoryOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                <div className="absolute left-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setIsCategoryOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700/50 transition-all text-sm ${
                        activeCategory === cat ? "bg-gray-700/50" : ""
                      }`}
                    >
                      <span className={activeCategory === cat ? "text-white font-medium" : "text-gray-300"}>
                        {cat}
                      </span>
                      {activeCategory === cat && <Check size={14} className="text-blue-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Type Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setIsTypeOpen(!isTypeOpen); setIsCategoryOpen(false); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all min-w-[160px]"
            >
              {currentType?.icon && <currentType.icon size={16} className="text-orange-400" />}
              <span className="font-medium text-white text-sm">{currentType?.label}</span>
              <ChevronDown size={14} className={`text-gray-400 ml-auto transition-transform ${isTypeOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isTypeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTypeOpen(false)} />
                <div className="absolute left-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                  {typeOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setFilterType(option.key);
                        setIsTypeOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/50 transition-all text-sm ${
                        filterType === option.key ? "bg-gray-700/50" : ""
                      }`}
                    >
                      <option.icon size={16} className="text-gray-400" />
                      <span className={filterType === option.key ? "text-white font-medium" : "text-gray-300"}>
                        {option.label}
                      </span>
                      {filterType === option.key && <Check size={14} className="ml-auto text-orange-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Items Grid - 3 cards per row */}
        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-500">
              <Utensils size={48} className="mb-3 opacity-30" />
              <p>No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const badge = getItemBadge(item.type);
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => addToCart(item, item.type)}
                    className="group relative bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-2xl overflow-hidden hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all cursor-pointer"
                  >
                    <div className="aspect-square relative bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {item.type === "deal" ? (
                            <Tag size={40} className="text-gray-600" />
                          ) : item.type === "inventory" ? (
                            <Package size={40} className="text-gray-600" />
                          ) : (
                            <Utensils size={40} className="text-gray-600" />
                          )}
                        </div>
                      )}
                      {badge && (
                        <Badge className={`absolute top-3 right-3 ${badge.color} border-0 shadow-lg text-[10px]`}>
                          {badge.label}
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button className="absolute bottom-3 right-3 h-12 w-12 rounded-full bg-orange-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                        <Plus size={24} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white line-clamp-2 mb-2 h-12">
                        {item.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-orange-400">
                          Rs. {item.price}
                        </span>
                        {item.category && (
                          <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-700/50 px-2 py-1 rounded">
                            {item.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right Side: Cart */}
      <Card className="w-[400px] flex flex-col bg-gray-900 border-gray-800 rounded-2xl overflow-hidden shadow-2xl h-full ml-auto">
        {/* Cart Header */}
        <div className="p-4 bg-gray-800/50 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <ShoppingCart className="text-orange-500" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-white text-lg">Current Order</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">
                    {cart.reduce((a, b) => a + b.quantity, 0)} items
                  </span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCart([])}
                className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Clear Cart"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          {/* Customer Selection & Details */}
          <div className="space-y-3">
            {!selectedUser ? (
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-blue-400 transition-colors" size={16} />
                <Input
                  placeholder="Select Customer..."
                  className="pl-10 pr-24 bg-gray-950 border-gray-700 rounded-xl h-11 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  value={userSearch}
                  onFocus={() => setIsUserDropdownOpen(true)}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <Button
                  size="sm"
                  className="absolute right-1.5 top-1.5 h-8 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600/50 rounded-lg text-xs"
                  onClick={() => {
                    if (currentUser) {
                      setSelectedUser(currentUser);
                      toast.success("Walk-in customer set");
                    }
                  }}
                >
                  <Store size={12} className="mr-1.5" /> Walk-in
                </Button>

                {isUserDropdownOpen && userSearch && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                    {isLoadingUsers ? (
                      <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        Searching...
                      </div>
                    ) : users.length > 0 ? (
                      users.map((user) => (
                        <div
                          key={user.id}
                          className="p-3 hover:bg-gray-800 cursor-pointer flex items-center gap-3 border-b border-gray-800/50 last:border-0 transition-colors"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserDropdownOpen(false);
                            setUserSearch("");
                          }}
                        >
                          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs ring-2 ring-blue-500/10">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.phone || user.email}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-950 rounded-xl border border-gray-800 overflow-hidden">
                {/* Selected Customer Header */}
                <div className="p-3 bg-gray-900/50 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">{selectedUser.name}</p>
                      <p className="text-[10px] text-blue-400 font-medium">CUSTOMER</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X size={16} />
                  </Button>
                </div>

                {/* Contact Inputs */}
                <div className="p-3 space-y-2.5">
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-gray-500">
                      <Phone size={14} />
                    </div>
                    <Input 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Add phone number..."
                      className="pl-9 bg-gray-900 border-gray-800 h-9 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-lg placeholder:text-gray-600"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-gray-500">
                      <MapPin size={14} />
                    </div>
                    <Input 
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Add delivery address..."
                      className="pl-9 bg-gray-900 border-gray-800 h-9 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-lg placeholder:text-gray-600"
                    />
                  </div>
                   <div className="relative">
                    <div className="absolute left-3 top-2.5 text-gray-500">
                      <NotebookPen size={14} />
                    </div>
                    <Input 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add order notes (optional)..."
                      className="pl-9 bg-gray-900 border-gray-800 h-9 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-lg placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <ScrollArea className="flex-1 bg-gray-950/30">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="h-24 w-24 rounded-full bg-gray-800/50 flex items-center justify-center mb-4 ring-1 ring-gray-700/50">
                <ShoppingBag size={40} className="text-gray-600" />
              </div>
              <p className="text-lg font-medium text-gray-400">Cart is empty</p>
              <p className="text-sm text-gray-600 mt-1 max-w-[200px]">Select items from the menu to start your order</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cart.map((item, index) => (
                <div
                  key={`${item.productId}-${item.dealId}-${index}`}
                  className="flex gap-3 bg-gray-900 border border-gray-800 p-3 rounded-xl group hover:border-gray-700 transition-colors relative"
                >
                  <div className="h-16 w-16 bg-gray-950 rounded-lg relative overflow-hidden shrink-0 border border-gray-800">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-700">
                        {item.type === "deal" ? <Tag size={20} /> : item.type === "inventory" ? <Package size={20} /> : <Utensils size={20} />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-medium text-sm text-gray-200 line-clamp-1 leading-tight">{item.name}</h4>
                      <span className="font-bold text-white text-sm whitespace-nowrap">Rs. {item.price * item.quantity}</span>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <p className="text-[11px] text-gray-500">Rs. {item.price} x {item.quantity}</p>
                      
                      <div className="flex items-center gap-1 bg-gray-950 rounded-lg border border-gray-800 p-0.5 shadow-sm">
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateQuantity(index, -1); }}
                          className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-xs font-bold w-6 text-center text-gray-300">{item.quantity}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateQuantity(index, 1); }}
                          className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-gray-800 text-gray-400 hover:text-green-400 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Cart Footer */}
        <div className="bg-gray-900 border-t border-gray-800 p-4 space-y-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] z-10">

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Payable</p>
                <p className="text-3xl font-bold text-white mt-0.5">
                  <span className="text-xl text-gray-500 mr-1">Rs.</span>
                  {calculateTotal()}
                </p>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className={`w-full h-14 font-bold text-lg rounded-xl shadow-lg transition-all ${
              cart.length === 0 || !selectedUser 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-orange-500/20 active:scale-[0.98]"
            }`}
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || !selectedUser || isPlacingOrder}
          >
            {isPlacingOrder ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
                <span>Processing Order...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Place Order</span>
                <Check className="stroke-[3px]" size={20} />
              </div>
            )}
          </Button>
        </div>
      </Card>

      {/* Click outside listener for user dropdown */}
      {isUserDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsUserDropdownOpen(false)} />
      )}
    </div>
  );
}
