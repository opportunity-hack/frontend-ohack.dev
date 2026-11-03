import React, { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  useShoppingCart,
  MAX_CART_ITEM_QUANTITY,
} from "../../../context/ShoppingCartContext";
import { trackEvent, initFacebookPixel } from "../../../lib/ga";
import { serializeJsonLd } from "../../../lib/jsonLd";
import { RefinedRoot, Eyebrow } from "../../../components/design/refined";
import {
  pageSectionStyle,
  BackLink,
} from "../../../components/design/RefinedPage";
import FloatingCartButton from "../../../components/Store/FloatingCartButton";
import products from "../../../data/store-products.json";

const STATUS_HIDE_MS = 3000;

const selectStyle = {
  width: "100%",
  font: "inherit",
  fontSize: 15,
  color: "var(--ink)",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "10px 12px",
  cursor: "pointer",
  accentColor: "var(--brand)",
};

const stepBtnStyle = {
  width: 38,
  height: 38,
  padding: 0,
  justifyContent: "center",
  fontSize: 18,
  lineHeight: 1,
};

// Reserved square media box. The catalog's /images/store/*.png paths may be
// missing, so a failed load falls back to a quiet Fraunces initial.
const ProductHeroImage = ({ src, name }) => {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;
  return (
    <div
      className="ohx-card"
      style={{
        aspectRatio: "1 / 1",
        background: "var(--surface-2)",
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
          width={600}
          height={600}
          decoding="async"
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            padding: 32,
            boxSizing: "border-box",
          }}
        />
      ) : (
        <span
          className="ohx-display"
          aria-hidden="true"
          style={{ fontSize: 96, color: "var(--brand)", opacity: 0.5 }}
        >
          {(name || "?").charAt(0)}
        </span>
      )}
    </div>
  );
};

const NotFound = () => (
  <RefinedRoot>
    <section className="ohx-wrap ohx-narrow" style={pageSectionStyle}>
      <BackLink href="/store">Back to the store</BackLink>
      <header style={{ marginTop: 18 }}>
        <Eyebrow>Opportunity Hack store</Eyebrow>
        <h1 className="ohx-display" style={{ marginTop: 8 }}>
          Product not found
        </h1>
        <p className="ohx-lead" style={{ marginTop: 14 }}>
          That item may have sold out or moved. Everything we carry is back in
          the store.
        </p>
      </header>
      <Link
        href="/store"
        className="ohx-btn ohx-btn--primary"
        style={{ marginTop: 26 }}
      >
        Browse the store
      </Link>
    </section>
  </RefinedRoot>
);

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useShoppingCart();

  const product = useMemo(() => products.find((p) => p.id === id), [id]);

  const [selectedVariations, setSelectedVariations] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [snackOpen, setSnackOpen] = useState(false);

  useEffect(() => {
    if (product) {
      initFacebookPixel();
      trackEvent({
        action: "store_view_item",
        params: {
          page: "store_product",
          product_id: product.id,
          product_name: product.name,
          product_category: product.category,
          price: product.price,
          currency: "USD",
        },
      });
    }
  }, [product]);

  // Inline "Added to cart" status (replaces the MUI Snackbar Portal); same
  // 3s auto-hide as before.
  useEffect(() => {
    if (!snackOpen) return undefined;
    const t = setTimeout(() => setSnackOpen(false), STATUS_HIDE_MS);
    return () => clearTimeout(t);
  }, [snackOpen]);

  if (!id) return null;

  if (!product) {
    return <NotFound />;
  }

  const hasVariations =
    product.variations && Object.keys(product.variations).length > 0;
  const allVariationsSelected = hasVariations
    ? Object.keys(product.variations).every((key) => selectedVariations[key])
    : true;

  const handleVariationChange = (variationName, value) => {
    setSelectedVariations((prev) => ({
      ...prev,
      [variationName]: value,
    }));
    trackEvent({
      action: "store_select_variation",
      params: {
        page: "store_product",
        product_id: product.id,
        product_name: product.name,
        variation_type: variationName,
        variation_value: value,
      },
    });
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      selectedVariations: hasVariations ? selectedVariations : undefined,
    });
    setSnackOpen(true);
    trackEvent({
      action: "store_add_to_cart",
      params: {
        page: "store_product",
        product_id: product.id,
        product_name: product.name,
        product_category: product.category,
        price: product.price,
        quantity,
        value: product.price * quantity,
        currency: "USD",
        ...(hasVariations
          ? { variations: JSON.stringify(selectedVariations) }
          : {}),
      },
    });
  };

  const productUrl = `https://www.ohack.dev/store/products/${product.id}`;
  const productImage = product.image
    ? `https://www.ohack.dev${product.image}`
    : "https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp";

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: productImage,
    url: productUrl,
    brand: {
      "@type": "Organization",
      name: "Opportunity Hack",
      url: "https://www.ohack.dev",
    },
    offers: {
      "@type": "Offer",
      price: product.price.toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: productUrl,
      seller: {
        "@type": "Organization",
        name: "Opportunity Hack",
      },
    },
    ...(product.category && { category: product.category }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.ohack.dev",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Store",
        item: "https://www.ohack.dev/store",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  const lineTotal = (product.price * quantity).toFixed(2);

  return (
    <>
      <Head>
        <title>
          {product.name} — Opportunity Hack Store | Support Nonprofits
        </title>
        <meta name="description" content={product.description} />
        <meta
          name="keywords"
          content={`${product.name}, Opportunity Hack, ${product.category || "merchandise"}, nonprofit store, tech for good, hackathon gear`}
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={productUrl} />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={`${product.name} — $${product.price.toFixed(2)} | Opportunity Hack Store`}
        />
        <meta property="og:description" content={product.description} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:image" content={productImage} />
        <meta property="og:image:alt" content={product.name} />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />
        <meta
          property="product:price:amount"
          content={product.price.toFixed(2)}
        />
        <meta property="product:price:currency" content="USD" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${product.name} — $${product.price.toFixed(2)} | Opportunity Hack Store`}
        />
        <meta name="twitter:description" content={product.description} />
        <meta name="twitter:image" content={productImage} />
        <meta name="twitter:site" content="@opportunityhack" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(breadcrumbSchema),
          }}
        />
      </Head>

      <RefinedRoot>
        <section className="ohx-wrap" style={pageSectionStyle}>
          <BackLink href="/store">Back to the store</BackLink>

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gap: "32px 48px",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              alignItems: "start",
            }}
          >
            <ProductHeroImage src={product.image} name={product.name} />

            <div>
              <header>
                <Eyebrow>
                  {product.category || "Opportunity Hack store"}
                </Eyebrow>
                <h1
                  className="ohx-display"
                  style={{
                    marginTop: 8,
                    fontSize: "clamp(28px, 4vw, 44px)",
                    maxWidth: "18ch",
                  }}
                >
                  {product.name}
                </h1>
                <p
                  className="ohx-display"
                  style={{
                    margin: "12px 0 0",
                    fontSize: 26,
                    lineHeight: 1,
                    color: "var(--brand)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  ${product.price.toFixed(2)}
                </p>
              </header>

              <div className="ohx-prose" style={{ marginTop: 20 }}>
                <p>{product.description}</p>
              </div>

              {hasVariations && (
                <div
                  style={{
                    marginTop: 8,
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                  }}
                >
                  {Object.entries(product.variations).map(
                    ([variationName, options]) => {
                      const selectId = `variation-${variationName
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`;
                      return (
                        <label
                          key={variationName}
                          htmlFor={selectId}
                          style={{ display: "block" }}
                        >
                          <span
                            className="ohx-eyebrow"
                            style={{ display: "block", marginBottom: 6 }}
                          >
                            {variationName}
                          </span>
                          <select
                            id={selectId}
                            value={selectedVariations[variationName] || ""}
                            onChange={(e) =>
                              handleVariationChange(
                                variationName,
                                e.target.value,
                              )
                            }
                            style={selectStyle}
                          >
                            <option value="" disabled>
                              Choose {variationName.toLowerCase()}
                            </option>
                            {options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      );
                    },
                  )}
                </div>
              )}

              <div
                style={{
                  marginTop: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <span className="ohx-eyebrow" id="product-quantity-label">
                  Quantity
                </span>
                <div
                  role="group"
                  aria-labelledby="product-quantity-label"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <button
                    type="button"
                    className="ohx-btn ohx-btn--ghost"
                    style={stepBtnStyle}
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span
                    aria-live="polite"
                    style={{
                      minWidth: 30,
                      textAlign: "center",
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="ohx-btn ohx-btn--ghost"
                    style={stepBtnStyle}
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(MAX_CART_ITEM_QUANTITY, q + 1),
                      )
                    }
                    disabled={quantity >= MAX_CART_ITEM_QUANTITY}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="ohx-btn ohx-btn--primary"
                onClick={handleAddToCart}
                disabled={!allVariationsSelected}
                style={{
                  marginTop: 22,
                  fontSize: 14,
                  opacity: allVariationsSelected ? 1 : 0.55,
                  cursor: allVariationsSelected ? "pointer" : "not-allowed",
                }}
              >
                Add to cart — ${lineTotal}
              </button>

              {hasVariations && !allVariationsSelected && (
                <p
                  className="ohx-muted"
                  style={{ margin: "10px 0 0", fontSize: 14 }}
                >
                  Please select all options before adding to cart.
                </p>
              )}

              {/* Reserved slot so the status strip never shifts the layout. */}
              <div style={{ minHeight: 56, marginTop: 16 }} aria-live="polite">
                {snackOpen && (
                  <div
                    role="status"
                    className="ohx-card"
                    style={{
                      padding: "12px 16px",
                      borderColor: "var(--success)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 15, color: "var(--success)" }}>
                      Added to cart.
                    </span>
                    <Link href="/store/cart" className="ohx-link">
                      View cart{" "}
                      <span className="ohx-arrow" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </RefinedRoot>

      <FloatingCartButton />
    </>
  );
}
