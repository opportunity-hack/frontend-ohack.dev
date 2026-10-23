import React, { useState } from "react";
import Link from "next/link";
import { trackEvent } from "../../lib/ga";

// Only ever rendered on /store inside a <RefinedRoot>, so the .ohx-* classes
// and CSS variables are safe here.

// Reserved 4:3 media box. The catalog's /images/store/*.png paths are plain
// <img>s with explicit dimensions (CWV); if a file is missing the box falls
// back to a quiet Fraunces initial instead of a broken-image glyph.
const ProductImage = ({ src, name }) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  return (
    <div
      style={{
        aspectRatio: "4 / 3",
        background: "var(--surface-2)",
        borderBottom: "1px solid var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: 20,
            boxSizing: "border-box",
          }}
        />
      ) : (
        <span
          className="ohx-display"
          aria-hidden="true"
          style={{ fontSize: 44, color: "var(--brand)", opacity: 0.55 }}
        >
          {(name || "?").charAt(0)}
        </span>
      )}
    </div>
  );
};

export default function ProductCard({ product }) {
  const hasVariations =
    product.variations && Object.keys(product.variations).length > 0;

  const handleProductClick = () => {
    trackEvent({
      action: "store_product_click",
      params: {
        page: "store",
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        price: product.price,
        currency: "USD",
      },
    });
  };

  return (
    <article
      className="ohx-card ohx-card--hover"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <ProductImage src={product.image} name={product.name} />

      <div
        style={{
          padding: "18px 20px 20px",
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h2
            className="ohx-display"
            style={{ fontSize: 20, lineHeight: 1.15, margin: 0 }}
          >
            {product.name}
          </h2>
          <span
            className="ohx-display"
            style={{
              fontSize: 20,
              lineHeight: 1,
              color: "var(--brand)",
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ${product.price.toFixed(2)}
          </span>
        </div>

        <p
          className="ohx-muted"
          style={{
            margin: 0,
            fontSize: 14.5,
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description}
        </p>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {product.category ? (
            <span className="ohx-tag">{product.category}</span>
          ) : (
            <span />
          )}
          <Link
            href={`/store/products/${product.id}`}
            className="ohx-btn ohx-btn--primary"
            onClick={handleProductClick}
          >
            {hasVariations ? "Select options" : "View details"}
          </Link>
        </div>
      </div>
    </article>
  );
}
