"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSocket } from "@/context/SocketContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/orders", label: "Orders", icon: "📋" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
  { href: "/dashboard/products", label: "Products", icon: "🍔" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isConnected } = useSocket();

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        width: "256px",
        minHeight: "100vh",
        background: "rgba(17, 24, 39, 0.9)",
        backdropFilter: "blur(12px)",
        borderRight: "1px solid rgba(75, 85, 99, 0.5)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px",
          borderBottom: "1px solid rgba(75, 85, 99, 0.5)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #f97316, #dc2626)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
            }}
          >
            <span style={{ fontSize: "20px" }}>🔥</span>
          </div>
          <div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "white",
                margin: 0,
              }}
            >
              Grill-X
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isConnected ? "#22c55e" : "#ef4444",
                  animation: isConnected ? "pulse 2s infinite" : "none",
                }}
              />
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "16px" }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                marginBottom: "8px",
                textDecoration: "none",
                transition: "all 0.2s",
                background: active ? "rgba(249, 115, 22, 0.2)" : "transparent",
                color: active ? "#fb923c" : "#9ca3af",
                border: active
                  ? "1px solid rgba(249, 115, 22, 0.3)"
                  : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span style={{ fontWeight: "500" }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(75, 85, 99, 0.5)",
        }}
      >
        <div
          style={{ fontSize: "12px", color: "#6b7280", textAlign: "center" }}
        >
          Real-time Order Management
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </aside>
  );
}
