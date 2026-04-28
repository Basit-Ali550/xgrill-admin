"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Lightweight portal-based tooltip.
 * Uses position: fixed + getBoundingClientRect, rendered into document.body
 * so it escapes overflow / transform / stacking constraints from ancestors.
 *
 * Usage:
 *   <Tooltip content="Edit Item" side="right">
 *     <button>...</button>
 *   </Tooltip>
 */
export function Tooltip({
  children,
  content,
  side = "top",
  delay = 250,
  className = "",
  wrapperClassName = "",
}) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const canPortal = typeof document !== "undefined";

  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const offset = 10;
    switch (side) {
      case "right":
        setCoords({ top: r.top + r.height / 2, left: r.right + offset });
        break;
      case "left":
        setCoords({ top: r.top + r.height / 2, left: r.left - offset });
        break;
      case "bottom":
        setCoords({ top: r.bottom + offset, left: r.left + r.width / 2 });
        break;
      case "top":
      default:
        setCoords({ top: r.top - offset, left: r.left + r.width / 2 });
    }
  }, [side]);

  const open = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      computePosition();
      setShow(true);
    }, delay);
  };

  const close = () => {
    clearTimeout(timer.current);
    setShow(false);
  };

  if (!content) return children;

  // Translate the tooltip relative to its anchor point so the anchor sits
  // on the side that's adjacent to the trigger (e.g. for side=right, the
  // tooltip's left edge should be at coords.left and centered vertically).
  const transform = {
    top: "translate(-50%, -100%)",
    bottom: "translate(-50%, 0)",
    left: "translate(-100%, -50%)",
    right: "translate(0, -50%)",
  }[side];

  // Animation slide direction
  const slideAnim = {
    top: "slide-in-from-bottom-1",
    bottom: "slide-in-from-top-1",
    left: "slide-in-from-right-1",
    right: "slide-in-from-left-1",
  };

  // Diamond arrow (rotated square) — matches tooltip surface
  const arrowBase = "absolute w-2 h-2 bg-white ring-1 ring-gray-200 rotate-45";
  const arrowPos = {
    top: "left-1/2 -translate-x-1/2 -bottom-1",
    bottom: "left-1/2 -translate-x-1/2 -top-1",
    left: "top-1/2 -translate-y-1/2 -right-1",
    right: "top-1/2 -translate-y-1/2 -left-1",
  };

  return (
    <span
      ref={triggerRef}
      className={cn("relative inline-flex", wrapperClassName)}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {canPortal && show &&
        createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              transform,
              zIndex: 9999,
            }}
            className={cn(
              "pointer-events-none whitespace-nowrap",
              "px-3 py-1.5 rounded-lg",
              "bg-white",
              "ring-1 ring-gray-200",
              "text-gray-900 text-xs font-semibold tracking-wide",
              "shadow-2xl shadow-black/40",
              "animate-in fade-in zoom-in-95 duration-150 ease-out",
              slideAnim[side],
              className,
            )}
          >
            <span className="relative z-10">{content}</span>
            <span aria-hidden="true" className={cn(arrowBase, arrowPos[side])} />
          </span>,
          document.body,
        )}
    </span>
  );
}

export default Tooltip;
