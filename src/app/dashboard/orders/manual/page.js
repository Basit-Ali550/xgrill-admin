"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Check,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  Trash2,
  User,
  X,
} from "lucide-react";
import { getProductsAction } from "@/app/actions/products";
import { getDealsAction } from "@/app/actions/deals";
import { getCustomersAction } from "@/app/actions/users";
import { placeOrderAction } from "@/app/actions/orders";
import OrderReceipt from "@/components/orders/OrderReceipt";

const TYPE_OPTIONS = [
  { key: "ALL", label: "Everything" },
  { key: "PRODUCT", label: "Menu Items" },
  { key: "DEAL", label: "Deals" },
  { key: "INVENTORY", label: "Other Items" },
];

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
      className={`relative size-[100px] shrink-0 overflow-hidden rounded-xl border text-center shadow-md transition active:scale-95 ${
        active
          ? "border-blue-300 bg-blue-600 text-white shadow-blue-950/40 ring-2 ring-blue-300/30"
          : "border-blue-800 bg-blue-950/50 text-blue-100 shadow-black/20 hover:border-blue-500 hover:bg-blue-900/60"
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

    return items.filter((item) => {
      return activeCategory === "ALL" || item.category === activeCategory;
    });
  }, [activeCategory, deals, filterType, inventoryProducts, products]);

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
    <div className="flex min-h-full flex-col gap-3 xl:h-full xl:min-h-0 xl:flex-row">
      <section className="min-h-[500px] min-w-0 flex-1 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/35 xl:min-h-0">
        <div className="h-full min-h-0 overflow-y-auto p-3">
          <div className="mb-4">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">Filters</p>
                <h2 className="text-base font-black text-white">Item type</h2>
              </div>
              <p className="text-xs font-bold text-gray-500">{filteredItems.length} items</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {TYPE_OPTIONS.map((option) => (
                <Tile
                  key={option.key}
                  active={filterType === option.key}
                  onClick={() => chooseType(option.key)}
                  ariaLabel={`Show ${option.label}`}
                >
                  <div className="flex h-full items-center justify-center p-2">
                    <span className="line-clamp-3 text-sm font-black leading-tight">{option.label}</span>
                    {filterType === option.key && <Check className="absolute right-1.5 top-1.5" size={15} />}
                  </div>
                </Tile>
              ))}
            </div>
          </div>

          {filterType !== "DEAL" && categories.length > 1 && (
            <div className="mb-4">
              <div className="mb-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">Filters</p>
                <h2 className="text-base font-black text-white">Category</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Tile
                    key={category}
                    active={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                    ariaLabel={`Filter by ${category}`}
                  >
                    <div className="flex h-full items-center justify-center p-2">
                      <span className="line-clamp-3 text-sm font-black leading-tight">
                        {category === "ALL" ? "All Categories" : category}
                      </span>
                      {activeCategory === category && <Check className="absolute right-1.5 top-1.5" size={15} />}
                    </div>
                  </Tile>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">Products</p>
                <h2 className="text-base font-black text-white">Tap to add</h2>
              </div>
              {cartCount > 0 && <p className="text-xs font-bold text-emerald-400">{cartCount} selected</p>}
            </div>

            {isLoading ? (
              <div className="flex h-52 items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={42} />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-700 text-center">
                <p className="font-bold text-gray-300">No items found</p>
                <button type="button" onClick={() => chooseType("ALL")} className="mt-2 text-sm font-bold text-orange-400 hover:text-orange-300">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,100px)] gap-2">
                {filteredItems.map((item) => {
                  const cartQuantity = findCartLine(item)?.quantity || 0;
                  return (
                    <button
                      key={`${item.type}-${item.id}`}
                      type="button"
                      onClick={() => addToCart(item)}
                      className={`relative size-[100px] overflow-hidden rounded-xl border p-2 text-left shadow-md transition active:scale-95 ${
                        cartQuantity
                          ? "border-emerald-300 bg-emerald-600 text-white ring-2 ring-emerald-300/30"
                          : "border-orange-500/60 bg-gray-800 text-white hover:border-orange-300 hover:bg-gray-700"
                      }`}
                    >
                      <div className="flex h-full flex-col justify-between">
                        <p className="line-clamp-3 pr-4 text-xs font-black leading-tight">
                          {item.name}{item.size ? ` · ${item.size}` : ""}
                        </p>
                        <Money value={item.price} className={`text-sm font-black ${cartQuantity ? "text-white" : "text-orange-400"}`} />
                      </div>
                      {cartQuantity > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex min-w-6 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[10px] font-black text-emerald-700 shadow">
                          ×{cartQuantity}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
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
