"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { getProductsAction } from "@/app/actions/products";
import { getDealsAction } from "@/app/actions/deals";
import { getCustomersAction } from "@/app/actions/users";
import { placeOrderAction } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  Eye,
  User,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import OrderReceipt from "@/components/orders/OrderReceipt";

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
  const [customerName, setCustomerName] = useState(""); // Re-adding name state
  const [notes, setNotes] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeUnit, setActiveUnit] = useState("ALL");
  const [activeSize, setActiveSize] = useState('ALL'); // For Products/Inventory
  const [viewDeal, setViewDeal] = useState(null); // For Deal Modal
  const [filterType, setFilterType] = useState("ALL"); 
  
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);

  // User Search State
  const [userSearch, setUserSearch] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const hasShownToast = useRef(false);
  const userSearchRef = useRef(null);
  const userPickerRef = useRef(null);
  
  // URL Params for pre-filling
  const { search } = typeof window !== 'undefined' ? window.location : {};

  useEffect(() => {
    fetchData();
    
    // Parse query params if available
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const name = params.get('name');
        const phone = params.get('phone');
        const address = params.get('address');
        const customerId = params.get('customerId');
        
        if (customerId || name) {
            if (customerId) {
                if (!hasShownToast.current) {
                    toast.success("Customer details loaded from previous order");
                    hasShownToast.current = true;
                }
            } 
            if (name) setCustomerName(name);
            if (phone) setContactPhone(phone);
            if (address) setDeliveryAddress(address);

             setSelectedUser({ 
                id: customerId || 'manual', 
                name: name || 'Guest', 
                phone: phone || '', 
                address: address || '' 
             });
        }
    }
  }, []);

  // Default user selection removed

  useEffect(() => {
    if (selectedUser) {
      setCustomerName(selectedUser.name || "");
      setContactPhone(selectedUser.phone || "");
      setDeliveryAddress(selectedUser.address || "");
    } else {
      setCustomerName("");
      setContactPhone("");
      setDeliveryAddress("");
    }
  }, [selectedUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Always fetch — empty query returns top regulars sorted by order count
      fetchUsers(userSearch);
    }, userSearch ? 300 : 0);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Pre-load top customers as soon as dropdown opens (no need to type)
  useEffect(() => {
    if (isUserDropdownOpen && users.length === 0 && !userSearch) {
      fetchUsers("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUserDropdownOpen]);

  // Close customer dropdown on outside click (ref-based — works across stacking contexts)
  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handler = (e) => {
      if (userPickerRef.current && !userPickerRef.current.contains(e.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isUserDropdownOpen]);

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
      const res = await getCustomersAction(query);
      if (res.success) setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch customers");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const PriceDisplay = ({ price, className = "", showCurrency = true }) => {
    const val = parseFloat(price || 0);
    const formatted = val % 1 === 0 ? val.toFixed(0) : val.toFixed(3);
    const [whole, decimal] = formatted.split('.');
    
    return (
      <span className={`inline-flex items-baseline ${className}`}>
        {showCurrency && <span className="text-[0.7em] mr-0.5 opacity-70">Rs.</span>}
        <span>{whole}</span>
        {decimal && <span className="text-[0.6em] ml-0.5 opacity-70">.{decimal}</span>}
      </span>
    );
  };

  const addToCart = (item, type) => {
    const wasCartEmpty = cart.length === 0;

    setCart((prev) => {
      const matches = (i) =>
        (type === "product" && i.productId === (item.productId || item.id) && i.size === item.size) ||
        (type === "inventory" && i.productId === (item.productId || item.id) && i.size === item.size) ||
        (type === "deal" && i.dealId === item.id);

      const existing = prev.find(matches);

      if (existing) {
        return prev.map((i) => (matches(i) ? { ...i, quantity: i.quantity + 1 } : i));
      }

      return [
        ...prev,
        {
          productId: type === "deal" ? undefined : (item.productId || item.id),
          dealId: type === "deal" ? item.id : undefined,
          name: item.name,
          price: type === "deal" ? item.dealPrice : item.basePrice || item.price,
          image: item.image,
          quantity: 1,
          size: item.size, // Add size
          type,
        },
      ];
    });

    // Auto-prompt for customer when first item lands in cart
    if (wasCartEmpty && !selectedUser) {
      setIsUserDropdownOpen(true);
      setTimeout(() => userSearchRef.current?.focus(), 60);
    }

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
    
    if (!contactPhone.trim()) {
      return toast.error("Phone number is required");
    }
    if (contactPhone.trim().length < 11) {
      return toast.error("Phone number must be at least 11 digits");
    }

    setIsPlacingOrder(true);
    try {
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          dealId: item.dealId,
          quantity: item.quantity,
          size: item.size,
        })),
        customerId: selectedUser?.id === 'manual' ? null : (selectedUser?.id || null), 
        customerName: customerName,
        customerPhone: contactPhone,
        notes,
        phone: contactPhone,
        address: deliveryAddress,
      };

      const result = await placeOrderAction(orderData);

      if (result.success) {
        toast.success("Order placed!", { duration: 2000 });
        // Snapshot cart + customer details for the receipt before clearing state
        const receiptOrder = {
          ...result.data,
          orderNumber: result.data?.orderNumber || `ORD-${Date.now()}`,
          createdAt: result.data?.createdAt || new Date().toISOString(),
          totalAmount: result.data?.totalAmount ?? calculateTotal(),
          customerName: customerName,
          customerPhone: contactPhone,
          deliveryAddress: deliveryAddress,
          notes,
          items: cart.map((item) => ({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
          })),
        };
        setPlacedOrder(receiptOrder);
        setCart([]);
        setNotes("");
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
    { key: "INVENTORY", label: "Other Items", icon: Package },
    { key: "DEAL", label: "Deals", icon: Tag },
  ];

  const currentType = typeOptions.find(f => f.key === filterType);

  // Derived Data for Filters
  
  const categories = useMemo(() => {
    let cats = [];
    if (filterType === "PRODUCT") {
       cats = products.filter(p => p.isActive).map(p => p.category);
    } else if (filterType === "INVENTORY") {
       cats = inventoryProducts.map(p => p.category);
    } else {
       cats = [...products.map(p => p.category), ...inventoryProducts.map(p => p.category)];
    }
    return ["ALL", ...new Set(cats.filter(Boolean))];
  }, [products, inventoryProducts, filterType]);

  const units = useMemo(() => {
    if (filterType !== 'INVENTORY') return [];
    // Extract unique unitTypes
    const allUnits = inventoryProducts.map(p => p.unitType).filter(Boolean);
    return ["ALL", ...new Set(allUnits)];
  }, [inventoryProducts, filterType]);

  const sizes = useMemo(() => {
     let allSizes = [];
     if (filterType === 'PRODUCT') {
        allSizes = products.flatMap(p => p.variants?.map(v => v.size)).filter(Boolean);
     } else if (filterType === 'INVENTORY') {
        allSizes = inventoryProducts.flatMap(p => p.variants?.map(v => v.size)).filter(Boolean);
     }
     return ["ALL", ...new Set(allSizes)];
  }, [products, inventoryProducts, filterType]);

  // Filter Logic
  const filteredItems = useMemo(() => {
    let items = [];
    if (filterType === "ALL" || filterType === "PRODUCT") {
      items = [
        ...items,
        ...products
          .filter((p) => p.isActive)
          .filter((p) => p.availableStock === null || p.availableStock > 0)
          .flatMap((p) => {
             if (p.variants && p.variants.length > 0) {
                return p.variants.map((v) => ({
                   ...p,
                   id: `${p.id}-${v.size}`,
                   productId: p.id,
                   name: `${p.name} (${v.size})`,
                   price: v.price,
                   size: v.size,
                   type: "product",
                   image: p.image
                }));
             }
             return [{
                ...p,
                type: "product",
                price: p.basePrice || p.price,
                productId: p.id
             }];
          }),
      ];
    }

    if (filterType === "ALL" || filterType === "INVENTORY") {
      items = [
        ...items,
        ...inventoryProducts
          .filter((p) => p.availableStock === null || p.availableStock > 0)
          .flatMap((p) => {
            if (p.variants && p.variants.length > 0) {
              return p.variants.map((v) => ({
                ...p,
                id: `inv-${p.id}-${v.size}`,
                productId: p.id,
                name: `${p.name} (${v.size})`,
                price: v.price,
                size: v.size,
                type: "inventory",
                image: p.image,
              }));
            }
            return [{
              ...p,
              type: "inventory",
              price: p.basePrice || p.price,
            }];
          }),
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
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !q || [
        item.name,
        item.description,
        item.category,
        item.brand,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q));

      const matchesCategory =
        activeCategory === "ALL" || item.category === activeCategory;

      let matchesUnit = true;
      if (filterType === 'INVENTORY' && activeUnit !== 'ALL') {
         matchesUnit = item.unitType === activeUnit;
      }
      let matchesSize = true;
      if ((filterType === 'PRODUCT' || filterType === 'INVENTORY') && activeSize !== 'ALL') {
         matchesSize = item.variants?.some(v => v.size === activeSize);
      }

      return matchesSearch && matchesCategory && matchesUnit && matchesSize;
    });
  }, [products, inventoryProducts, deals, searchQuery, activeCategory, filterType, activeUnit, activeSize]);

  const getItemBadge = (type) => {
    switch(type) {
      case "deal": return { label: "DEAL", bg: "bg-rose-500/20", text: "text-rose-300", ring: "ring-rose-400/30", dot: "bg-rose-400" };
      case "inventory": return { label: "Direct Sale", bg: "bg-emerald-500/20", text: "text-emerald-300", ring: "ring-emerald-400/30", dot: "bg-emerald-400" };
      default: return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-6">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex gap-3 items-center flex-wrap">

          <div className="relative flex-1 max-w-xs min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <Input
              placeholder="Search by name, category, brand..."
              className="pl-11 pr-9 h-11 bg-gray-800/50 border-gray-700/50 rounded-xl text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1 rounded-md hover:bg-gray-700/50 transition-colors"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative">
            <button
               onClick={() => { setIsTypeOpen(!isTypeOpen); setIsCategoryOpen(false); setIsUnitOpen(false); setIsSizeOpen(false); }}
               className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all min-w-[150px] cursor-pointer"
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
                         // Reset other filters
                         setActiveCategory("ALL");
                         setActiveUnit("ALL");
                         setActiveSize("ALL");
                         setIsTypeOpen(false);
                       }}
                       className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-700/50 transition-all text-sm cursor-pointer ${
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
          {filterType !== 'DEAL' && categories.length > 1 && (
            <div className="relative">
              <button
                onClick={() => { setIsCategoryOpen(!isCategoryOpen); setIsTypeOpen(false); setIsUnitOpen(false); setIsSizeOpen(false); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all min-w-[140px] cursor-pointer"
              >
                <Filter size={16} className="text-blue-400" />
                <span className="font-medium text-white text-sm">{activeCategory}</span>
                <ChevronDown size={14} className={`text-gray-400 ml-auto transition-transform ${isCategoryOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isCategoryOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700/50 transition-all text-sm cursor-pointer ${
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
          )}
          {filterType === 'INVENTORY' && units.length > 1 && (
             <div className="relative">
             <button
               onClick={() => { setIsUnitOpen(!isUnitOpen); setIsCategoryOpen(false); setIsTypeOpen(false); setIsSizeOpen(false); }}
               className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all min-w-[120px] cursor-pointer"
             >
               <Package size={16} className="text-green-400" />
               <span className="font-medium text-white text-sm">{activeUnit === 'ALL' ? 'Unit' : activeUnit}</span>
               <ChevronDown size={14} className={`text-gray-400 ml-auto transition-transform ${isUnitOpen ? "rotate-180" : ""}`} />
             </button>
             
             {isUnitOpen && (
               <>
                 <div className="fixed inset-0 z-40" onClick={() => setIsUnitOpen(false)} />
                 <div className="absolute left-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                   {units.map((unit) => (
                     <button
                       key={unit}
                       onClick={() => {
                         setActiveUnit(unit);
                         setIsUnitOpen(false);
                       }}
                       className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700/50 transition-all text-sm cursor-pointer ${
                         activeUnit === unit ? "bg-gray-700/50" : ""
                       }`}
                     >
                       <span className={activeUnit === unit ? "text-white font-medium" : "text-gray-300"}>
                         {unit}
                       </span>
                       {activeUnit === unit && <Check size={14} className="text-green-400" />}
                     </button>
                   ))}
                 </div>
               </>
             )}
           </div>
          )}

          {/* Size Dropdown (Show for PRODUCT & INVENTORY) */}
          {(filterType === 'PRODUCT' || filterType === 'INVENTORY') && sizes.length > 1 && (
             <div className="relative">
             <button
               onClick={() => { setIsSizeOpen(!isSizeOpen); setIsCategoryOpen(false); setIsTypeOpen(false); setIsUnitOpen(false); }}
               className="flex items-center gap-2 px-4 py-2.5 bg-gray-800/80 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 transition-all min-w-[120px] cursor-pointer"
             >
               <Layers size={16} className="text-purple-400" />
               <span className="font-medium text-white text-sm">{activeSize === 'ALL' ? 'Size' : activeSize}</span>
               <ChevronDown size={14} className={`text-gray-400 ml-auto transition-transform ${isSizeOpen ? "rotate-180" : ""}`} />
             </button>
             
             {isSizeOpen && (
               <>
                 <div className="fixed inset-0 z-40" onClick={() => setIsSizeOpen(false)} />
                 <div className="absolute left-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                   {sizes.map((size) => (
                     <button
                       key={size}
                       onClick={() => {
                         setActiveSize(size);
                         setIsSizeOpen(false);
                       }}
                       className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-700/50 transition-all text-sm cursor-pointer ${
                         activeSize === size ? "bg-gray-700/50" : ""
                       }`}
                     >
                       <span className={activeSize === size ? "text-white font-medium" : "text-gray-300"}>
                         {size}
                       </span>
                       {activeSize === size && <Check size={14} className="text-purple-400" />}
                     </button>
                   ))}
                 </div>
               </>
             )}
           </div>
          )}
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
              <p>{searchQuery ? `No items match "${searchQuery}"` : "No items available"}</p>
              <p className="text-xs mt-1 text-gray-600">Out-of-stock items are hidden automatically</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {filteredItems.map((item) => {
                const badge = getItemBadge(item.type);
                const cartLine = cart.find((c) =>
                  (item.type === "deal" && c.dealId === item.id) ||
                  (item.type !== "deal" &&
                    c.productId === (item.productId || item.id) &&
                    c.size === item.size),
                );
                const cartQty = cartLine?.quantity || 0;
                const inCart = cartQty > 0;
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => addToCart(item, item.type)}
                    className={`group relative bg-gray-800/50 backdrop-blur border rounded-2xl overflow-hidden transition-all duration-300 ease-out cursor-pointer ${
                      inCart
                        ? "border-orange-500 ring-2 ring-orange-500/40 shadow-xl shadow-orange-500/20"
                        : "border-gray-700/50 hover:border-orange-500/60 hover:shadow-xl hover:shadow-orange-500/15"
                    }`}
                  >
                    {inCart && (
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500 text-white shadow-lg ring-2 ring-orange-300/40 text-[11px] font-bold">
                        <Check size={12} className="stroke-[3px]" />
                        In Cart × {cartQty}
                      </div>
                    )}
                    <div className="aspect-square relative bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] will-change-transform"
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
                      {badge && !inCart && (
                        <div
                          className={`absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${badge.bg} ${badge.text} backdrop-blur-md ring-1 ${badge.ring} shadow-lg text-[11px] font-bold uppercase tracking-wider`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </div>
                      )}
                      {item.type !== "deal" && typeof item.availableStock === "number" && (
                        <div
                          className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md ring-1 ring-white/10 shadow-lg"
                          title={`Available: ${item.availableStock}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.availableStock <= 5
                                ? "bg-red-400 animate-pulse"
                                : item.availableStock <= 15
                                  ? "bg-amber-400"
                                  : "bg-emerald-400"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold tabular-nums ${
                              item.availableStock <= 5
                                ? "text-red-200"
                                : item.availableStock <= 15
                                  ? "text-amber-200"
                                  : "text-emerald-200"
                            }`}
                          >
                            {item.availableStock}
                            <span className="text-[10px] font-semibold opacity-75 uppercase tracking-wider ml-1">
                              left
                            </span>
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button className="absolute bottom-3 right-3 h-12 w-12 rounded-full bg-orange-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                        <Plus size={24} />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-semibold text-white line-clamp-2 leading-tight">
                           {item.name}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.type === "deal" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setViewDeal(item); }}
                              className="h-6 w-6 flex items-center justify-center rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <Eye size={13} />
                            </button>
                          )}
                          {item.category && (
                            <span className="text-[10px] uppercase tracking-wider text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Item description (Deals, Products, Inventory) */}
                      {item.description && (
                        <p className="text-[11px] text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Deal included items */}
                      {item.type === "deal" && item.products && item.products.length > 0 && (
                        <div className="mb-2 space-y-1">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Includes:</p>
                          <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar">
                            {item.products.map((prodId, idx) => {
                              const prod = products.find(p => p.id === prodId) || inventoryProducts.find(p => p.id === prodId);
                              if (!prod) return (
                                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                  <span className="w-1 h-1 rounded-full bg-gray-600 shrink-0" />
                                  <span>Unknown Item</span>
                                </div>
                              );
                              const variantSizes = prod.variants?.map(v => v.size).join(', ');
                              return (
                                <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                                  <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0" />
                                  <span className="text-gray-200 truncate">{prod.name}</span>
                                  {variantSizes && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
                                      {variantSizes}
                                    </span>
                                  )}
                                  {prod.category && (
                                    <span className="text-[9px] text-gray-500 shrink-0">
                                      • {prod.category}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-orange-400">
                            <PriceDisplay price={item.price} />
                          </span>
                           {item.size && (
                             <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-wide">
                               {item.size}
                             </span>
                           )}
                        </div>
                        {/* Show original price & savings for deals */}
                        {item.type === "deal" && item.originalPrice && item.originalPrice > item.price && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-gray-500 line-through">
                              Rs.{parseFloat(item.originalPrice).toFixed(0)}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                              Save {((1 - item.price / item.originalPrice) * 100).toFixed(0)}%
                            </span>
                          </div>
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
              <div ref={userPickerRef} className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-blue-400 transition-colors" size={16} />
                <Input
                  ref={userSearchRef}
                  placeholder="Select Customer..."
                  type="search"
                  autoComplete="off"
                  spellCheck={false}
                  className="pl-10 pr-24 bg-gray-950 border-gray-700 rounded-xl h-11 focus:ring-1 focus:ring-blue-500/50 transition-all"
                  value={userSearch}
                  onFocus={() => setIsUserDropdownOpen(true)}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => {
                    // Prevent Enter from bubbling up and triggering form-submit / navigation
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      // If exactly one match, auto-select it
                      if (users.length === 1) {
                        setSelectedUser(users[0]);
                        setIsUserDropdownOpen(false);
                        setUserSearch("");
                      }
                    }
                    if (e.key === "Escape") {
                      setIsUserDropdownOpen(false);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="absolute right-1.5 top-1.5 h-8 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600/50 rounded-lg text-xs"
                  onClick={() => {
                    setSelectedUser({ id: 'manual', name: 'Guest', phone: '', address: '' });
                    toast.success("Manual entry mode");
                  }}
                >
                  <Store size={12} className="mr-1.5" /> Manual
                </Button>

                {isUserDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-72 overflow-y-auto custom-scrollbar">
                    {!userSearch && (
                      <div className="px-3 py-2 bg-gray-800/40 border-b border-gray-800 sticky top-0">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
                          Regular Customers
                        </p>
                      </div>
                    )}
                    {isLoadingUsers ? (
                      <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        {userSearch ? "Searching..." : "Loading customers..."}
                      </div>
                    ) : users.length > 0 ? (
                      users.map((cust) => {
                        const isRegular = (cust.orderCount || 0) > 1;
                        const isNew = (cust.orderCount || 0) === 0;
                        return (
                          <div
                            key={cust.id}
                            className="p-3 hover:bg-gray-800 cursor-pointer flex items-center gap-3 border-b border-gray-800/50 last:border-0 transition-colors"
                            onClick={() => {
                              setSelectedUser(cust);
                              setIsUserDropdownOpen(false);
                              setUserSearch("");
                            }}
                          >
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ring-2 ${
                                isRegular
                                  ? "bg-amber-500/20 text-amber-300 ring-amber-500/30"
                                  : "bg-blue-500/20 text-blue-400 ring-blue-500/10"
                              }`}
                            >
                              {cust.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white truncate">{cust.name}</p>
                                {isRegular && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30 shrink-0">
                                    ★ Regular
                                  </span>
                                )}
                                {isNew && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-700/40 text-gray-400 ring-1 ring-gray-600/40 shrink-0">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 truncate">
                                {cust.phone || cust.email || "No contact info"}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-white tabular-nums">
                                {cust.orderCount || 0}
                              </p>
                              <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                                {cust.orderCount === 1 ? "order" : "orders"}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-400">
                          {userSearch
                            ? `No customers match "${userSearch}"`
                            : "No customers yet"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Click <span className="text-orange-400 font-semibold">Manual</span> for a one-time guest
                        </p>
                      </div>
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
                      <User size={14} />
                    </div>
                    <Input 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer Name..."
                      className="pl-9 bg-gray-900 border-gray-800 h-9 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 rounded-lg placeholder:text-gray-600 font-bold text-gray-200"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-2.5 text-gray-500">
                      <Phone size={14} />
                    </div>
                    <Input 
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="Add phone number (min 11 digits)"
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
                        <span className="font-bold text-white text-sm whitespace-nowrap">
                          <PriceDisplay price={item.price * item.quantity} />
                        </span>
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <p className="text-[11px] text-gray-500 flex items-center gap-1">
                          <PriceDisplay price={item.price} /> x {item.quantity}
                        </p>
                      
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

        <div className="bg-gray-900 border-t border-gray-800 p-4 space-y-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] z-10">

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Payable</p>
                <p className="text-3xl font-bold text-white mt-0.5">
                  <PriceDisplay price={calculateTotal()} />
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


      {/* Order Placed → Receipt Modal */}
      <OrderReceipt
        order={placedOrder}
        isOpen={!!placedOrder}
        onClose={() => setPlacedOrder(null)}
        showSuccess
      />

      {/* Deal View Modal */}
      {viewDeal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setViewDeal(null)}
        >
          <div
            className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl ring-1 ring-white/5 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero Image */}
            <div className="relative h-52 bg-gradient-to-br from-gray-800 to-gray-900 shrink-0">
              {viewDeal.image ? (
                <Image src={viewDeal.image} alt={viewDeal.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Tag size={56} className="text-gray-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

              {/* Close */}
              <button
                onClick={() => setViewDeal(null)}
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 ring-1 ring-white/10 transition-all cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>

              {/* Save ribbon */}
              {viewDeal.originalPrice && viewDeal.originalPrice > viewDeal.price && (
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full text-white text-[11px] font-bold shadow-lg ring-1 ring-emerald-300/30">
                  SAVE {((1 - viewDeal.price / viewDeal.originalPrice) * 100).toFixed(0)}%
                </div>
              )}

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-2xl font-bold text-white leading-tight drop-shadow-lg">
                  {viewDeal.name}
                </h3>
                {viewDeal.description && (
                  <p className="text-xs text-gray-300/90 mt-1 leading-relaxed line-clamp-2">
                    {viewDeal.description}
                  </p>
                )}
              </div>
            </div>

            {/* Floating Price Card */}
            <div className="px-5 -mt-5 relative z-10 shrink-0">
              <div className="bg-gray-800/90 backdrop-blur-md border border-gray-700/60 rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl shadow-black/30">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-bold">Total Price</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold text-white">
                      <PriceDisplay price={viewDeal.price} />
                    </span>
                    {viewDeal.originalPrice && viewDeal.originalPrice > viewDeal.price && (
                      <span className="text-xs text-gray-500 line-through">
                        Rs.{parseFloat(viewDeal.originalPrice).toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
                {viewDeal.originalPrice && viewDeal.originalPrice > viewDeal.price && (
                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.15em] text-gray-500 font-bold">You Save</p>
                    <p className="text-emerald-400 font-bold text-lg leading-tight mt-0.5">
                      Rs.{(viewDeal.originalPrice - viewDeal.price).toFixed(0)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items list - scrollable */}
            <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2 custom-scrollbar min-h-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold flex items-center gap-1.5">
                  <Package size={11} className="text-orange-400" />
                  Includes ({viewDeal.products?.length || 0})
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
              </div>

              <div className="space-y-2">
                {viewDeal.products?.map((id, idx) => {
                  const prod = products.find((p) => p.id === id) || inventoryProducts.find((p) => p.id === id);
                  if (!prod) {
                    return (
                      <div key={idx} className="bg-gray-800/30 rounded-xl border border-gray-800 p-3 text-xs text-gray-500 italic">
                        Unknown item
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className="group bg-gray-800/40 hover:bg-gray-800/70 rounded-xl border border-gray-800 hover:border-gray-700 overflow-hidden transition-all"
                    >
                      <div className="flex items-start gap-3 p-3">
                        <div className="h-14 w-14 rounded-xl bg-gray-900 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-gray-800 group-hover:ring-orange-500/30 transition-all">
                          {prod.image ? (
                            <div className="relative h-full w-full">
                              <Image src={prod.image} alt={prod.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <Utensils size={18} className="text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-gray-100 text-sm font-semibold truncate max-w-full">
                              {prod.name}
                            </span>
                            {prod.category && (
                              <span className="text-[9px] uppercase tracking-wider text-blue-300 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded shrink-0 font-bold">
                                {prod.category}
                              </span>
                            )}
                          </div>
                          {prod.description && (
                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-1.5">
                              {prod.description}
                            </p>
                          )}
                          {prod.variants && prod.variants.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {prod.variants.map((v, vi) => (
                                <span
                                  key={vi}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium"
                                >
                                  {v.size}
                                  <span className="text-purple-400/60 mx-1">·</span>
                                  Rs.{parseFloat(v.price).toFixed(0)}
                                </span>
                              ))}
                            </div>
                          ) : prod.basePrice ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-300 border border-orange-500/20 font-semibold inline-block">
                              Rs.{parseFloat(prod.basePrice).toFixed(0)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="p-4 bg-gray-950/60 border-t border-gray-800/80 shrink-0">
              <Button
                onClick={() => {
                  addToCart(viewDeal, "deal");
                  setViewDeal(null);
                }}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Plus size={18} className="stroke-[3px]" />
                <span>Add Deal to Cart</span>
                <span className="ml-auto text-orange-50/90 text-sm font-semibold border-l border-orange-300/30 pl-3">
                  <PriceDisplay price={viewDeal.price} />
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
