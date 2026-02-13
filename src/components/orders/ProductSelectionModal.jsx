import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  ChevronDown,
  Check,
  Loader2,
  Utensils,
  Tag,
  Package,
  Layers,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

// Reusing filter icons/labels from ManualOrderPage for consistency
const typeOptions = [
  { key: "PRODUCT", label: "Menu Items", icon: Utensils },
  { key: "DEAL", label: "Deals", icon: Tag },
  { key: "INVENTORY", label: "Direct Sale", icon: Package },
  { key: "ALL", label: "Show All", icon: Layers },
];

export default function ProductSelectionModal({
  isOpen,
  onClose,
  products = [],
  inventoryProducts = [],
  deals = [],
  onSelectProduct,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, PRODUCT, DEAL, INVENTORY
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeUnit, setActiveUnit] = useState("ALL");
  const [activeSize, setActiveSize] = useState("ALL");

  // Filter Dropdown States
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);

  // Variant Selection State
  const [selectedItem, setSelectedItem] = useState(null); // Item being configured
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // --- Derived State (Filters) ---
  const categories = useMemo(() => {
    if (filterType === "DEAL") return [];
    let source = products;
    if (filterType === "INVENTORY") source = inventoryProducts;
    else if (filterType === "ALL") source = [...products, ...inventoryProducts];

    const cats = [...new Set(source.map((p) => p.category).filter(Boolean))];
    return ["ALL", ...cats.sort()];
  }, [products, inventoryProducts, filterType]);

  const units = useMemo(() => {
    if (filterType !== "INVENTORY" && filterType !== "ALL") return [];
    const us = [
      ...new Set(inventoryProducts.map((p) => p.unitType).filter(Boolean)),
    ];
    return ["ALL", ...us.sort()];
  }, [inventoryProducts, filterType]);

  const sizes = useMemo(() => {
    if (filterType === "DEAL") return [];
    let source = products;
    if (filterType === "INVENTORY") source = inventoryProducts;
    else if (filterType === "ALL") source = [...products, ...inventoryProducts];

    const ss = [
      ...new Set(source.flatMap((p) => p.variants?.map((v) => v.size) || [])),
    ];
    return ["ALL", ...ss.sort()];
  }, [products, inventoryProducts, filterType]);

  const filteredItems = useMemo(() => {
    let items = [];

    if (filterType === "ALL" || filterType === "PRODUCT") {
      // Flatten products with variants logic same as Manual Page??
      // Or just list products and let click select variant?
      // Manual Page flattens them for the grid. Let's do the same for consistency.
      items = [
        ...items,
        ...products
          .filter((p) => p.isActive)
          .flatMap((p) => {
            return [
              {
                ...p,
                type: "product",
                price: p.basePrice || p.price,
                productId: p.id,
              },
            ];
          }),
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
      // 1. Search
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 2. Category
      const matchesCategory =
        activeCategory === "ALL" || item.category === activeCategory;

      // 3. Unit
      let matchesUnit = true;
      if (
        (filterType === "INVENTORY" || filterType === "ALL") &&
        activeUnit !== "ALL"
      ) {
        if (item.type === "inventory")
          matchesUnit = item.unitType === activeUnit;
        else if (filterType === "INVENTORY") matchesUnit = false;
      }

      // 4. Size
      let matchesSize = true;
      if (activeSize !== "ALL") {
        if (item.variants && item.variants.length > 0) {
          matchesSize = item.variants.some((v) => v.size === activeSize);
        } else {
          // matchesSize = false; // Strict? or strict only if activeSize is set?
          // If filtering by size, only show items with that size?
          matchesSize = false;
        }
      }

      return matchesSearch && matchesCategory && matchesUnit && matchesSize;
    });
  }, [
    products,
    inventoryProducts,
    deals,
    searchQuery,
    activeCategory,
    filterType,
    activeUnit,
    activeSize,
  ]);

  // --- Handlers ---
  const handleItemClick = (item) => {
    // If item has variants, open variant selector?
    // Actually, ManualPage flattens variants into the grid.
    // Here I removed flattening to keep grid cleaner (just products),
    // so I need to check for variants on click.

    if (item.type === "product" && item.variants && item.variants.length > 0) {
      setSelectedItem(item);
      setSelectedVariant(item.variants[0]);
      setQuantity(1);
    } else {
      // Direct Add
      // Wait, confirm quantity?
      setSelectedItem(item);
      setSelectedVariant(null);
      setQuantity(1);
    }
  };

  const confirmAdd = () => {
    if (!selectedItem) return;

    const finalItem = {
      ...selectedItem,
      quantity,
      size: selectedVariant ? selectedVariant.size : null,
      price: selectedVariant ? selectedVariant.price : selectedItem.price,
    };
    onSelectProduct(finalItem);
    handleClose();
  };

  const handleClose = () => {
    setSelectedItem(null);
    setSelectedVariant(null);
    setQuantity(1);
    onClose();
  };

  // Handle Portal Mounting
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Timer to avoid synchronous state update warning
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen || !mounted) return null;

  const currentType = typeOptions.find((t) => t.key === filterType);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Main Content */}
      <div
        className="bg-gray-900 border border-gray-800 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Add Item to Order</h2>
            <p className="text-sm text-gray-500">
              Select a product or deal to add.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Product Grid & Filters */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800">
            {/* Filters Bar */}
            <div className="p-4 flex gap-3 flex-wrap border-b border-gray-800 bg-gray-900/30">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <Input
                  placeholder="Search items..."
                  className="pl-9 h-10 bg-gray-800 border-gray-700 text-white rounded-lg focus:ring-orange-500/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Simplified Type Select */}
              <div className="relative">
                <button
                  onClick={() => setIsTypeOpen(!isTypeOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 text-sm text-white"
                >
                  <Filter size={14} className="text-orange-400" />
                  <span>{currentType?.label}</span>
                </button>
                {isTypeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsTypeOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
                      {typeOptions.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setFilterType(opt.key);
                            setIsTypeOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${filterType === opt.key ? "text-orange-400 font-bold" : "text-gray-300"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Grid */}
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleItemClick(item)}
                    className="group relative bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-orange-500/50 hover:bg-gray-800 transition cursor-pointer"
                  >
                    <div className="aspect-square relative bg-gray-900">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                          <Utensils size={32} />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-white text-sm truncate">
                        {item.name}
                      </h3>
                      <p className="text-orange-400 font-bold text-xs mt-1">
                        Rs. {item.price || item.basePrice || item.dealPrice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Item Configuration (If Selected) */}
          {selectedItem && (
            <div className="w-80 bg-gray-900 flex flex-col border-l border-gray-800">
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-800 mb-4">
                  {selectedItem.image ? (
                    <Image
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                      <Utensils size={40} />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {selectedItem.name}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {selectedItem.description}
                </p>

                {/* Variant Selection */}
                {selectedItem.variants && selectedItem.variants.length > 0 && (
                  <div className="mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                      Size
                    </label>
                    <div className="space-y-2">
                      {selectedItem.variants.map((v, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedVariant(v)}
                          className={`w-full flex justify-between items-center px-4 py-3 rounded-xl border transition ${
                            selectedVariant === v
                              ? "bg-orange-500/10 border-orange-500 text-orange-400"
                              : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-800/80"
                          }`}
                        >
                          <span className="font-bold text-sm">{v.size}</span>
                          <span className="text-sm">Rs. {v.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mb-6">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center bg-gray-800 rounded-xl border border-gray-700 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-700 rounded-lg text-white"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center font-bold text-white text-lg">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-700 rounded-lg text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-gray-400">Total Amount</span>
                  <span className="text-2xl font-bold text-white">
                    Rs.{" "}
                    {(selectedVariant?.price || selectedItem.price) * quantity}
                  </span>
                </div>
                <button
                  onClick={confirmAdd}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition"
                >
                  Add to Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
