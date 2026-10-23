import React, { useState } from "react";
import Link from "next/link";
import { MAX_CART_ITEM_QUANTITY } from "../../context/ShoppingCartContext";

// Only ever rendered on /store/cart inside a <RefinedRoot>, so the .ohx-*
// classes and CSS variables are safe here. The page owns the order summary +
// checkout button; this list renders the rows (or the empty state).

const stepBtnStyle = {
  width: 34,
  height: 34,
  padding: 0,
  justifyContent: "center",
  fontSize: 16,
  lineHeight: 1,
};

// 72×72 reserved thumb; the catalog image paths may be missing, so a failed
// load falls back to a quiet initial instead of a broken-image glyph.
const CartThumb = ({ src, name }) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  return (
    <div
      style={{
        width: 72,
        height: 72,
        flexShrink: 0,
        borderRadius: 6,
        background: "var(--surface-2)",
        border: "1px solid var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          width={72}
          height={72}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: 8,
            boxSizing: "border-box",
          }}
        />
      ) : (
        <span
          className="ohx-display"
          aria-hidden="true"
          style={{ fontSize: 22, color: "var(--brand)", opacity: 0.55 }}
        >
          {(name || "?").charAt(0)}
        </span>
      )}
    </div>
  );
};

const CartRow = ({ item, onUpdateQuantity, onRemoveItem }) => {
  const atMin = item.quantity <= 1;
  const atMax = item.quantity >= MAX_CART_ITEM_QUANTITY;
  const variations = item.selectedVariations
    ? Object.entries(item.selectedVariations)
    : [];

  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 0",
        borderTop: "1px solid var(--line)",
        flexWrap: "wrap",
      }}
    >
      <CartThumb src={item.image} name={item.name} />

      <div style={{ flex: "1 1 200px", minWidth: 0 }}>
        <p
          className="ohx-display"
          style={{ margin: 0, fontSize: 17, lineHeight: 1.2 }}
        >
          {item.name}
        </p>
        {variations.length > 0 && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}
          >
            {variations.map(([key, value]) => (
              <span key={key} className="ohx-tag">
                {key}: {value}
              </span>
            ))}
          </div>
        )}
        <p className="ohx-faint" style={{ margin: "6px 0 0", fontSize: 13 }}>
          ${item.price.toFixed(2)} each
        </p>
      </div>

      <div
        role="group"
        aria-label={`Quantity for ${item.name}`}
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          style={stepBtnStyle}
          aria-label="Decrease quantity"
          disabled={atMin}
          onClick={() =>
            onUpdateQuantity(
              item.id,
              item.selectedVariations,
              item.quantity - 1,
            )
          }
        >
          −
        </button>
        <span
          style={{
            minWidth: 28,
            textAlign: "center",
            fontVariantNumeric: "tabular-nums",
            fontWeight: 600,
          }}
          aria-live="polite"
        >
          {item.quantity}
        </span>
        <button
          type="button"
          className="ohx-btn ohx-btn--ghost"
          style={stepBtnStyle}
          aria-label="Increase quantity"
          disabled={atMax}
          onClick={() =>
            onUpdateQuantity(
              item.id,
              item.selectedVariations,
              item.quantity + 1,
            )
          }
        >
          +
        </button>
      </div>

      <div
        style={{
          minWidth: 88,
          textAlign: "right",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        <span
          className="ohx-display"
          style={{
            fontSize: 18,
            color: "var(--brand)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          ${(item.price * item.quantity).toFixed(2)}
        </span>
        <button
          type="button"
          className="ohx-link"
          onClick={() => onRemoveItem(item.id, item.selectedVariations)}
          style={{
            backgroundColor: "transparent",
            border: 0,
            padding: 0,
            paddingBottom: 2,
            cursor: "pointer",
            font: "inherit",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--muted)",
          }}
        >
          Remove
        </button>
      </div>
    </li>
  );
};

export default function CartItemList({
  items,
  onUpdateQuantity,
  onRemoveItem,
}) {
  if (!items || items.length === 0) {
    return (
      <div
        className="ohx-card"
        style={{
          padding: "40px 28px",
          textAlign: "center",
          background: "var(--surface-2)",
        }}
      >
        <p className="ohx-eyebrow">Your cart is empty</p>
        <p
          className="ohx-display"
          style={{ fontSize: 22, margin: "10px 0 8px" }}
        >
          Nothing in here yet.
        </p>
        <p className="ohx-muted" style={{ margin: "0 0 20px", fontSize: 15 }}>
          Every item funds free software for nonprofits.
        </p>
        <Link href="/store" className="ohx-link">
          Browse the store{" "}
          <span className="ohx-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    );
  }

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        borderBottom: "1px solid var(--line)",
      }}
    >
      {items.map((item, index) => (
        <CartRow
          key={`${item.id}-${index}`}
          item={item}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </ul>
  );
}
