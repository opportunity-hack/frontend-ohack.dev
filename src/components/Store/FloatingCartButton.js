import React from "react";
import Link from "next/link";
import { useShoppingCart } from "../../context/ShoppingCartContext";

// Rendered on /store (inside a RefinedRoot) AND on /store/products/[id]
// (plain MUI page), so every color carries a literal fallback.
const NAVY = "var(--brand, #1B3A6B)";
const ACCENT = "var(--accent, #E2552E)";

export default function FloatingCartButton() {
  const { itemCount, total } = useShoppingCart();

  return (
    <Link
      href="/store/cart"
      aria-label={
        itemCount > 0
          ? `View shopping cart with ${itemCount} ${itemCount === 1 ? "item" : "items"} totaling $${total.toFixed(2)}`
          : "View shopping cart"
      }
      style={{
        position: "fixed",
        bottom: 24,
        right: 20,
        zIndex: 1100,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 18px",
        borderRadius: 6,
        background: NAVY,
        color: "#fff",
        textDecoration: "none",
        fontFamily: "inherit",
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1.1,
        boxShadow: "0 14px 30px -18px rgba(14,37,71,0.7)",
      }}
    >
      <span
        aria-hidden="true"
        style={{ position: "relative", display: "inline-flex", width: 22 }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M2.5 3h2.6l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.7a1.5 1.5 0 0 0 1.5-1.1L21.5 7H6" />
        </svg>
        {itemCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -9,
              right: -11,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 999,
              background: ACCENT,
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            {itemCount}
          </span>
        )}
      </span>
      {itemCount > 0 ? (
        <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            ${total.toFixed(2)}
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.85 }}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </span>
      ) : (
        <span>Cart</span>
      )}
    </Link>
  );
}
