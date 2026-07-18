"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Check,
  Layers,
  Loader2,
  MapPin,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tag,
  Trash2,
  User,
  Utensils,
  X,
} from "lucide-react";
import { getProductsAction } from "@/app/actions/products";
import { getDealsAction } from "@/app/actions/deals";
import { getCustomersAction } from "@/app/actions/users";
import { placeOrderAction } from "@/app/actions/orders";
import OrderReceipt from "@/components/orders/OrderReceipt";

const TYPE_OPTIONS = [
  { key: "ALL", label: "Everything", helper: "Full menu", icon: Layers, color: "orange" },
  { key: "PRODUCT", label: "Menu Items", helper: "Food & drinks", icon: Utensils, color: "amber" },
  { key: "DEAL", label: "Deals", helper: "Offers", icon: Tag, color: "rose" },
  { key: "INVENTORY", label: "Other Items", helper: "Direct sale", icon: Package, color: "emerald" },
];

const COLOR_STYLES = {
  orange: "border-orange-500 bg-orange-500 text-white shadow-orange-950/40",
  amber: "border-amber-500 bg-amber-500 text-gray-950 shadow-amber-950/40",
  rose: "border-rose-500 bg-rose-500 text-white shadow-rose-950/40",
  emerald: "border-emerald-500 bg-emerald-500 text-gray-950 shadow-emerald-950/40",
};

function Money({ value, className = "" }) {
  const amount = Number(value || 0);
  return (
    <span className={`tabular-nums ${className}`}>
      <span className="mr-1 text-[0.65em] opacity-70">Rs.</span>
      {Number.isInteger(amount) ? amount : amount.toFixed(2)}
    </span>
  );
}

function Tile({ active, onClick, children, className = "", ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`relative size-[150px] shrink-0 overflow-hidden rounded-2xl border text-left shadow-lg transition active:scale-95 ${
        active
          ? "border-orange-400 bg-orange-500 text-white shadow-orange-950/40 ring-2 ring-orange-300/35"
          : "border-gray-700 bg-gray-800/90 text-gray-100 shadow-black/20 hover:border-orange-400/70 hover:bg-gray-800"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function ManualOrderPage() {
  const [products, setProducts] = useState([]);
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [activeCategory, setActiveCategory] = useState("ALL");

  const [cart, setCart] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const [userSearch, setUserSearch] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userPickerRef = useRef(null);
  const userSearchRef = useRef(null);
  const hasShownToast = useRef(false);

  useEffect(() => {
    async function loadItems() {
      setIsLoading(true);
      try {
        const [productsRes, inventoryRes, dealsRes] = await Promise.all([
          getProductsAction(),
          getProductsAction({ includeInventory: "true" }),
          getDealsAction(),
        ]);

        if (productsRes.success) {
          setProducts(productsRes.data.filter((product) => !product.isInventoryOnly));
        }
        if (inventoryRes.success) {
          setInventoryProducts(
            inventoryRes.data.filter(
              (product) => product.isInventoryOnly && !product.isServiceSupply && product.isActive,
            ),
          );
        }
        if (dealsRes.success) setDeals(dealsRes.data);
      } catch {
        toast.error("Failed to load items");
      } finally {
        setIsLoading(false);
      }
    }

    loadItems();

    const params = new URLSearchParams(window.location.search);
    const customerId = params.get("customerId");
    const name = params.get("name");
    const phone = params.get("phone");
    const address = params.get("address");

    if (customerId || name) {
      setSelectedUser({ id: customerId || "manual", name: name || "Guest", phone: phone || "", address: address || "" });
      if (!hasShownToast.current) {
        toast.success("Customer details loaded");
        hasShownToast.current = true;
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setCustomerName("");
      setContactPhone("");
      setDeliveryAddress("");
      return;
    }
    setCustomerName(selectedUser.name || "");
    setContactPhone(selectedUser.phone || "");
    setDeliveryAddress(selectedUser.address || "");
  }, [selectedUser]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!isUserDropdownOpen) return;
      setIsLoadingUsers(true);
      try {
        const result = await getCustomersAction(userSearch);
        if (result.success) setUsers(result.data);
      } catch {
        toast.error("Could not load customers");
      } finally {
        setIsLoadingUsers(false);
      }
    }, userSearch ? 300 : 0);
    return () => clearTimeout(timer);
  }, [userSearch, isUserDropdownOpen]);

  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const closePicker = (event) => {
      if (userPickerRef.current && !userPickerRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", closePicker);
    return () => document.removeEventListener("mousedown", closePicker);
  }, [isUserDropdownOpen]);

  const categories = useMemo(() => {
    const source = filterType === "PRODUCT"
      ? products
      : filterType === "INVENTORY"
        ? inventoryProducts
        : [...products, ...inventoryProducts];
    return ["ALL", ...new Set(source.map((item) => item.category).filter(Boolean))];
  }, [filterType, inventoryProducts, products]);

  const filteredItems = useMemo(() => {
    const menuItems = products
      .filter((product) => product.isActive)
      .filter((product) => product.availableStock == null || product.availableStock > 0)
      .flatMap((product) => product.variants?.length
        ? product.variants.map((variant) => ({
            ...product,
            id: `${product.id}-${variant.size}`,
            productId: product.id,
            name: product.name,
            size: variant.size,
            price: variant.price,
            type: "product",
          }))
        : [{ ...product, productId: product.id, price: product.basePrice || product.price, type: "product" }]);

    const directSaleItems = inventoryProducts
      .filter((product) => product.availableStock == null || product.availableStock > 0)
      .flatMap((product) => product.variants?.length
        ? product.variants.map((variant) => ({
            ...product,
            id: `inventory-${product.id}-${variant.size}`,
            productId: product.id,
            name: product.name,
            size: variant.size,
            price: variant.price,
            type: "inventory",
          }))
        : [{ ...product, productId: product.id, price: product.basePrice || product.price, type: "inventory" }]);

    const dealItems = deals
      .filter((deal) => deal.isActive)
      .map((deal) => ({ ...deal, price: deal.dealPrice, type: "deal" }));

    let items = [];
    if (filterType === "ALL" || filterType === "PRODUCT") items.push(...menuItems);
    if (filterType === "ALL" || filterType === "INVENTORY") items.push(...directSaleItems);
    if (filterType === "ALL" || filterType === "DEAL") items.push(...dealItems);

    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
      const matchesSearch = !query || [item.name, item.size, item.category, item.brand]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, deals, filterType, inventoryProducts, products, searchQuery]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);

  const findCartLine = (item) => cart.find((line) => (
    item.type === "deal"
      ? line.dealId === item.id
      : line.productId === (item.productId || item.id) && line.size === item.size
  ));

  const addToCart = (item) => {
    setCart((currentCart) => {
      const matches = (line) => item.type === "deal"
        ? line.dealId === item.id
        : line.productId === (item.productId || item.id) && line.size === item.size;
      const existing = currentCart.find(matches);
      if (existing) {
        return currentCart.map((line) => matches(line) ? { ...line, quantity: line.quantity + 1 } : line);
      }
      return [...currentCart, {
        productId: item.type === "deal" ? undefined : (item.productId || item.id),
        dealId: item.type === "deal" ? item.id : undefined,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        quantity: 1,
        size: item.size,
        type: item.type,
      }];
    });
  };

  const updateQuantity = (index, change) => {
    setCart((currentCart) => currentCart
      .map((item, itemIndex) => itemIndex === index ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
  };

  const chooseType = (type) => {
    setFilterType(type);
    setActiveCategory("ALL");
  };

  const useGuestCustomer = () => {
    setSelectedUser({ id: "manual", name: "Guest", phone: "", address: "" });
    setIsUserDropdownOpen(false);
    setUserSearch("");
    setTimeout(() => userSearchRef.current?.blur(), 0);
  };

  const handlePlaceOrder = async () => {
    if (!cart.length) return toast.error("Cart is empty");
    if (!selectedUser) return toast.error("Select a customer or use Walk-in Guest");
    if (contactPhone.trim().length < 11) return toast.error("Phone number must be at least 11 digits");

    setIsPlacingOrder(true);
    try {
      const result = await placeOrderAction({
        items: cart.map((item) => ({
          productId: item.productId,
          dealId: item.dealId,
          quantity: item.quantity,
          size: item.size,
        })),
        customerId: selectedUser.id === "manual" ? null : selectedUser.id,
        customerName,
        customerPhone: contactPhone,
        phone: contactPhone,
        address: deliveryAddress,
        notes,
      });

      if (!result.success) return toast.error(result.error || "Failed to place order");

      setPlacedOrder({
        ...result.data,
        orderNumber: result.data?.orderNumber || `ORD-${Date.now()}`,
        createdAt: result.data?.createdAt || new Date().toISOString(),
        totalAmount: result.data?.totalAmount ?? cartTotal,
        customerName,
        customerPhone: contactPhone,
        deliveryAddress,
        notes,
        items: cart.map(({ name, size, quantity, price }) => ({ name, size, quantity, price })),
      });
      setCart([]);
      setNotes("");
      toast.success("Order placed successfully");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] flex-col gap-4 xl:h-[calc(100vh-7rem)] xl:flex-row">
      <section className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/35">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b border-gray-800 bg-gray-900/80 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px] flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" size={22} />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search product, size or category..."
                  className="h-14 w-full rounded-xl border border-gray-700 bg-gray-950 pl-12 pr-12 text-base font-medium text-white outline-none placeholder:text-gray-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white"
                    aria-label="Clear search"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
              <div className="rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Showing</p>
                <p className="text-lg font-black text-white">{filteredItems.length} items</p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">Step 1</p>
                  <h2 className="text-lg font-black text-white">Choose item type</h2>
                </div>
                <p className="hidden text-sm text-gray-500 sm:block">Large buttons for quick selection</p>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {TYPE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = filterType === option.key;
                  return (
                    <Tile
                      key={option.key}
                      active={active}
                      onClick={() => chooseType(option.key)}
                      ariaLabel={`Show ${option.label}`}
                      className={active ? COLOR_STYLES[option.color] : ""}
                    >
                      <div className="flex h-full flex-col justify-between p-4">
                        <span className={`flex size-12 items-center justify-center rounded-xl ${active ? "bg-black/15" : "bg-gray-950 text-orange-400"}`}>
                          <Icon size={27} />
                        </span>
                        <span>
                          <span className="block text-lg font-black leading-tight">{option.label}</span>
                          <span className={`mt-1 block text-xs font-medium ${active ? "opacity-75" : "text-gray-500"}`}>{option.helper}</span>
                        </span>
                        {active && <Check className="absolute right-3 top-3" size={20} />}
                      </div>
                    </Tile>
                  );
                })}
              </div>
            </div>

            {filterType !== "DEAL" && categories.length > 1 && (
              <div className="mb-6">
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">Step 2</p>
                  <h2 className="text-lg font-black text-white">Choose category</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {categories.map((category) => {
                    const active = activeCategory === category;
                    return (
                      <Tile
                        key={category}
                        active={active}
                        onClick={() => setActiveCategory(category)}
                        ariaLabel={`Filter by ${category}`}
                      >
                        <div className="flex h-full flex-col justify-between p-4">
                          <span className={`flex size-12 items-center justify-center rounded-xl text-xl font-black ${active ? "bg-white/15" : "bg-gray-950 text-orange-400"}`}>
                            {category === "ALL" ? <Layers size={25} /> : category.charAt(0).toUpperCase()}
                          </span>
                          <span className="line-clamp-2 text-lg font-black leading-tight">
                            {category === "ALL" ? "All Categories" : category}
                          </span>
                          {active && <Check className="absolute right-3 top-3" size={20} />}
                        </div>
                      </Tile>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">
                    {filterType === "DEAL" ? "Step 2" : "Step 3"}
                  </p>
                  <h2 className="text-lg font-black text-white">Tap product to add</h2>
                </div>
                {cartCount > 0 && <p className="text-sm font-bold text-emerald-400">{cartCount} selected</p>}
              </div>

              {isLoading ? (
                <div className="flex h-52 items-center justify-center">
                  <Loader2 className="animate-spin text-orange-500" size={42} />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 text-center">
                  <Search className="mb-3 text-gray-600" size={38} />
                  <p className="font-bold text-gray-300">No items found</p>
                  <button type="button" onClick={() => { setSearchQuery(""); chooseType("ALL"); }} className="mt-2 text-sm font-bold text-orange-400 hover:text-orange-300">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,150px)] gap-3">
                  {filteredItems.map((item) => {
                    const cartQuantity = findCartLine(item)?.quantity || 0;
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        onClick={() => addToCart(item)}
                        className={`group relative size-[150px] overflow-hidden rounded-2xl border text-left shadow-lg transition active:scale-95 ${
                          cartQuantity
                            ? "border-orange-400 bg-orange-950/50 ring-2 ring-orange-500/30"
                            : "border-gray-700 bg-gray-800 hover:border-orange-400/70"
                        }`}
                      >
                        <div className="relative h-[72px] overflow-hidden bg-gray-950">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="150px" className="object-cover transition group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-gray-600">
                              {item.type === "deal" ? <Tag size={30} /> : item.type === "inventory" ? <Package size={30} /> : <Utensils size={30} />}
                            </div>
                          )}
                          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/75 px-2 py-1 text-[10px] font-bold uppercase text-white backdrop-blur">
                            {item.type === "deal" ? "Deal" : item.category || "Item"}
                          </span>
                        </div>
                        <div className="flex h-[78px] flex-col justify-between p-2.5">
                          <p className="line-clamp-2 text-sm font-black leading-tight text-white">
                            {item.name}{item.size ? ` · ${item.size}` : ""}
                          </p>
                          <Money value={item.price} className="text-base font-black text-orange-400" />
                        </div>
                        {cartQuantity > 0 && (
                          <span className="absolute right-2 top-2 flex min-w-8 items-center justify-center rounded-full bg-orange-500 px-2 py-1 text-sm font-black text-white shadow-lg">
                            ×{cartQuantity}
                          </span>
                        )}
                        <span className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
                          <Plus size={18} strokeWidth={3} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <aside className="flex min-h-[620px] w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl xl:min-h-0 xl:w-[370px]">
        <div className="border-b border-gray-800 bg-gray-900 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-xl bg-orange-500 text-white">
                <ShoppingCart size={22} />
              </span>
              <div>
                <h2 className="text-lg font-black text-white">Current Order</h2>
                <p className="text-xs font-medium text-gray-500">{cartCount} item{cartCount === 1 ? "" : "s"}</p>
              </div>
            </div>
            {cart.length > 0 && (
              <button type="button" onClick={() => setCart([])} className="flex size-10 items-center justify-center rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400" aria-label="Clear cart">
                <Trash2 size={19} />
              </button>
            )}
          </div>

          {!selectedUser ? (
            <div ref={userPickerRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  ref={userSearchRef}
                  value={userSearch}
                  onChange={(event) => setUserSearch(event.target.value)}
                  onFocus={() => setIsUserDropdownOpen(true)}
                  placeholder="Search customer..."
                  className="h-12 w-full rounded-xl border border-gray-700 bg-gray-950 pl-10 pr-4 text-sm font-medium text-white outline-none focus:border-orange-500"
                />
              </div>
              <button type="button" onClick={useGuestCustomer} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 text-sm font-bold text-orange-400 hover:bg-orange-500 hover:text-white">
                <Store size={17} /> Walk-in Guest
              </button>

              {isUserDropdownOpen && (
                <div className="absolute left-0 right-0 top-13 z-50 max-h-64 overflow-y-auto rounded-xl border border-gray-700 bg-gray-900 p-1 shadow-2xl">
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center gap-2 p-5 text-sm text-gray-400"><Loader2 className="animate-spin" size={17} /> Loading...</div>
                  ) : users.length ? users.map((customer) => (
                    <button
                      type="button"
                      key={customer.id}
                      onClick={() => { setSelectedUser(customer); setIsUserDropdownOpen(false); setUserSearch(""); }}
                      className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-gray-800"
                    >
                      <span className="flex size-9 items-center justify-center rounded-full bg-orange-500/15 font-black text-orange-400">{customer.name?.charAt(0) || "?"}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-white">{customer.name}</span>
                        <span className="block truncate text-xs text-gray-500">{customer.phone || customer.email || "No contact"}</span>
                      </span>
                    </button>
                  )) : <p className="p-5 text-center text-sm text-gray-500">No customers found</p>}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 rounded-xl border border-gray-800 bg-gray-950 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-white">{selectedUser.name || "Guest"}</p>
                <button type="button" onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-red-400" aria-label="Change customer"><X size={18} /></button>
              </div>
              <label className="relative block">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Customer name" className="h-9 w-full rounded-lg border border-gray-800 bg-gray-900 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500" />
              </label>
              <label className="relative block">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
                <input value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="Phone (11 digits)" className="h-9 w-full rounded-lg border border-gray-800 bg-gray-900 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500" />
              </label>
              <label className="relative block">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={15} />
                <input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder="Delivery address" className="h-9 w-full rounded-lg border border-gray-800 bg-gray-900 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500" />
              </label>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {!cart.length ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
              <span className="mb-3 flex size-20 items-center justify-center rounded-full bg-gray-900 text-gray-700"><ShoppingBag size={34} /></span>
              <p className="font-bold text-gray-400">Cart is empty</p>
              <p className="mt-1 text-xs text-gray-600">Tap a product button to add it</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item, index) => (
                <div key={`${item.productId || item.dealId}-${item.size || "base"}`} className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{item.name}{item.size ? ` · ${item.size}` : ""}</p>
                    <Money value={item.price * item.quantity} className="text-sm font-black text-orange-400" />
                  </div>
                  <div className="flex items-center rounded-xl border border-gray-700 bg-gray-950 p-1">
                    <button type="button" onClick={() => updateQuantity(index, -1)} className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400"><Minus size={15} /></button>
                    <span className="w-8 text-center text-sm font-black text-white">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(index, 1)} className="flex size-8 items-center justify-center rounded-lg bg-orange-500 text-white hover:bg-orange-600"><Plus size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-800 bg-gray-900 p-4">
          <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Order note (optional)" className="mb-3 h-10 w-full rounded-xl border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none focus:border-orange-500" />
          <div className="mb-3 flex items-end justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total</span>
            <Money value={cartTotal} className="text-3xl font-black text-white" />
          </div>
          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={!cart.length || !selectedUser || isPlacingOrder}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-lg font-black text-white shadow-lg shadow-orange-950/30 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600"
          >
            {isPlacingOrder ? <><Loader2 className="animate-spin" size={21} /> Processing...</> : <><Check size={21} strokeWidth={3} /> Place Order</>}
          </button>
        </div>
      </aside>

      <OrderReceipt order={placedOrder} isOpen={!!placedOrder} onClose={() => setPlacedOrder(null)} showSuccess />
    </div>
  );
}
