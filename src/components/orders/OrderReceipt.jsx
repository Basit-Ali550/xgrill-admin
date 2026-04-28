"use client";
import React from "react";
import { Printer, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Printable thermal-style receipt for an order.
 * Renders a modal preview with Print + Close actions.
 * On print, only the receipt section is sent to the printer (via @media print).
 *
 * Props:
 *   order   - { orderNumber, createdAt, totalAmount, customerName, customerPhone,
 *              deliveryAddress, items: [{ name, size, quantity, price, deal? }], notes }
 *   isOpen  - boolean
 *   onClose - () => void
 *   showSuccess - boolean - show "Order Placed!" success header
 */
export default function OrderReceipt({ order, isOpen, onClose, showSuccess = false }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = order.items || [];
  const subtotal = items.reduce((s, it) => {
    const price = it.price ?? it.unitPrice ?? 0;
    return s + price * (it.quantity || 0);
  }, 0);
  const total = order.totalAmount ?? subtotal;
  const discount = Math.max(0, subtotal - total);

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString("en-PK", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString();

  return (
    <>
      <div
        className="receipt-modal-root fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header (modal chrome only — hidden in print) */}
          <div className="bg-linear-to-r from-orange-500 to-red-600 px-5 py-4 flex items-center justify-between text-white shrink-0 print:hidden">
            <div className="flex items-center gap-2.5">
              {showSuccess ? (
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                  <Check size={18} className="stroke-[3px]" />
                </div>
              ) : null}
              <div>
                <h2 className="font-bold text-lg leading-tight">
                  {showSuccess ? "Order Placed!" : "Order Receipt"}
                </h2>
                <p className="text-xs text-white/80">{order.orderNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          {/* Receipt Body — prints */}
          <div
            id="receipt-print"
            className="receipt-body flex-1 overflow-y-auto bg-white text-black p-6 font-mono"
          >
            {/* Brand Header */}
            <div className="text-center pb-3 mb-3 border-b border-dashed border-gray-400">
              <h1 className="text-2xl font-bold tracking-wider">GRILL-X</h1>
              <p className="text-[11px] mt-0.5">Restaurant & Grill House</p>
              <p className="text-[10px] text-gray-700">Tel: +92 300 1234567</p>
            </div>

            {/* Order Meta */}
            <div className="text-[11px] space-y-1 mb-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Order #</span>
                <span className="font-bold">{order.orderNumber || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Date:</span>
                <span>{formattedDate}</span>
              </div>
              {order.customerName && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Customer:</span>
                  <span className="font-semibold">{order.customerName}</span>
                </div>
              )}
              {order.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Phone:</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-700 shrink-0">Address:</span>
                  <span className="text-right">{order.deliveryAddress}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="border-t border-b border-dashed border-gray-400 py-2 mb-2">
              <div className="grid grid-cols-12 text-[10px] font-bold uppercase tracking-wide">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-4 text-right">Amount</span>
              </div>
            </div>

            <div className="space-y-1.5 mb-3">
              {items.length === 0 ? (
                <p className="text-xs text-gray-500 italic text-center">No items</p>
              ) : (
                items.map((it, idx) => {
                  const price = it.price ?? it.unitPrice ?? 0;
                  const lineTotal = price * (it.quantity || 0);
                  const displayName = it.size
                    ? `${it.name} (${it.size})`
                    : it.name;
                  return (
                    <div key={idx} className="text-[11px]">
                      <div className="grid grid-cols-12 gap-1">
                        <span className="col-span-6 leading-tight">{displayName}</span>
                        <span className="col-span-2 text-center">×{it.quantity}</span>
                        <span className="col-span-4 text-right font-semibold tabular-nums">
                          Rs.{lineTotal.toFixed(0)}
                        </span>
                      </div>
                      <div className="grid grid-cols-12 gap-1 text-[9px] text-gray-600">
                        <span className="col-span-6" />
                        <span className="col-span-6 text-right">@ Rs.{price.toFixed(0)} each</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-gray-400 pt-2 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="tabular-nums">Rs.{subtotal.toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Discount:</span>
                  <span className="tabular-nums">−Rs.{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-dashed border-gray-400 pt-1.5 mt-1.5">
                <span>TOTAL:</span>
                <span className="tabular-nums">Rs.{total.toFixed(0)}</span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-3 text-[10px] border-t border-dashed border-gray-400 pt-2">
                <span className="text-gray-700 font-bold">Notes: </span>
                <span>{order.notes}</span>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-[10px] mt-4 border-t border-dashed border-gray-400 pt-3">
              <p className="font-bold">Thank you for your order!</p>
              <p className="text-gray-700 mt-1">Visit us again</p>
              <p className="text-gray-500 mt-2 text-[8px]">
                Generated {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          {/* Footer Actions (modal chrome) */}
          <div className="border-t border-gray-200 px-5 py-3 bg-gray-50 flex justify-end gap-2 shrink-0 print:hidden">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-gray-700 hover:bg-gray-200"
            >
              Close
            </Button>
            <Button
              type="button"
              onClick={handlePrint}
              className="bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg shadow-orange-500/20"
            >
              <Printer size={16} className="mr-2" />
              Print Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* Print-only styles: hide everything except the receipt body */}
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          .receipt-modal-root,
          .receipt-modal-root * {
            background: transparent !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
          }
          #receipt-print,
          #receipt-print * {
            visibility: visible !important;
          }
          #receipt-print {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            color: black !important;
            padding: 4mm !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            max-height: none !important;
            overflow: visible !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </>
  );
}
