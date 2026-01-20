"use client";
import { useAuth } from "@/context/AuthContext";

export function Header({ title }) {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: "64px",
        borderBottom: "1px solid rgba(75, 85, 99, 0.5)",
        background: "rgba(17, 24, 39, 0.5)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <h1
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "white",
          margin: 0,
        }}
      >
        {title}
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "white",
              margin: 0,
            }}
          >
            {user?.name}
          </p>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
            {user?.email}
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            background: "transparent",
            border: "1px solid #4b5563",
            borderRadius: "8px",
            color: "#d1d5db",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
