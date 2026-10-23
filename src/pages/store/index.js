import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import { serializeJsonLd } from "../../lib/jsonLd";
import { RefinedRoot, Eyebrow } from "../../components/design/refined";
import { pageSectionStyle } from "../../components/design/RefinedPage";
import ProductCard from "../../components/Store/ProductCard";
import FloatingCartButton from "../../components/Store/FloatingCartButton";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import products from "../../data/store-products.json";

const STORE_DESCRIPTION =
  "Shop Opportunity Hack merchandise — t-shirts, hoodies, stickers, mugs, and more. All proceeds support nonprofits through technology.";

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const searchInputStyle = {
  flex: "1 1 260px",
  minWidth: 0,
  font: "inherit",
  fontSize: "0.95rem",
  color: "var(--ink)",
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  padding: "11px 14px",
  outline: "none",
};

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { itemCount } = useShoppingCart();

  useEffect(() => {
    initFacebookPixel();
    trackEvent({
      action: "store_page_view",
      params: {
        page: "store",
        product_count: products.length,
      },
    });
  }, []);

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const handleSearch = useCallback(
    (value) => {
      setSearch(value);
      if (value.length >= 3) {
        trackEvent({
          action: "store_search",
          params: {
            page: "store",
            search_term: value,
            results_count: products.filter(
              (p) =>
                p.name.toLowerCase().includes(value.toLowerCase()) ||
                p.description.toLowerCase().includes(value.toLowerCase()),
            ).length,
          },
        });
      }
    },
    [products],
  );

  const handleCategoryFilter = useCallback((cat) => {
    setCategory(cat);
    trackEvent({
      action: "store_category_filter",
      params: {
        page: "store",
        category: cat,
      },
    });
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Opportunity Hack Store",
    description: STORE_DESCRIPTION,
    url: "https://www.ohack.dev/store",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: `https://www.ohack.dev${product.image}`,
        url: `https://www.ohack.dev/store/products/${product.id}`,
        offers: {
          "@type": "Offer",
          price: product.price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: "Opportunity Hack",
          },
        },
      },
    })),
  };

  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Opportunity Hack Store",
    description: STORE_DESCRIPTION,
    url: "https://www.ohack.dev/store",
    breadcrumb: {
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
      ],
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Opportunity Hack",
      url: "https://www.ohack.dev",
    },
  };

  const cartLabel =
    itemCount > 0
      ? `View cart with ${itemCount} ${itemCount === 1 ? "item" : "items"}`
      : "View cart";

  return (
    <>
      <Head>
        <title>
          Opportunity Hack Store | Merchandise for Social Good — T-Shirts,
          Hoodies &amp; More
        </title>
        <meta name="description" content={STORE_DESCRIPTION} />
        <meta
          name="keywords"
          content="Opportunity Hack store, nonprofit merchandise, tech for good apparel, hackathon t-shirt, coding for good, social impact gifts, charity store"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.ohack.dev/store" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Opportunity Hack Store | Merchandise for Social Good"
        />
        <meta property="og:description" content={STORE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/store" />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp"
        />
        <meta
          property="og:image:alt"
          content="Opportunity Hack merchandise store"
        />
        <meta property="og:site_name" content="Opportunity Hack" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Opportunity Hack Store | Merchandise for Social Good"
        />
        <meta name="twitter:description" content={STORE_DESCRIPTION} />
        <meta
          name="twitter:image"
          content="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp"
        />
        <meta name="twitter:site" content="@opportunityhack" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(storeSchema) }}
        />
      </Head>

      <RefinedRoot>
        {/* ---------------- MASTHEAD ---------------- */}
        <section
          className="ohx-wrap"
          style={{
            ...pageSectionStyle,
            paddingBottom: "clamp(32px, 5vh, 56px)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "20px 32px",
            }}
          >
            <header style={{ marginTop: 18 }}>
              <Eyebrow>Opportunity Hack store</Eyebrow>
              <h1
                className="ohx-display"
                style={{ marginTop: 8, maxWidth: "20ch" }}
              >
                Gear that funds{" "}
                <span className="ohx-italic">code for good.</span>
              </h1>
              <p
                className="ohx-lead"
                style={{ marginTop: 14, maxWidth: "58ch" }}
              >
                Support Opportunity Hack by purchasing merchandise. All proceeds
                go towards supporting nonprofits through technology.
              </p>
            </header>
            <Link
              href="/store/cart"
              className="ohx-btn ohx-btn--ghost"
              aria-label={cartLabel}
              style={{ whiteSpace: "nowrap" }}
            >
              View cart{itemCount > 0 && ` (${itemCount})`}
            </Link>
          </div>
        </section>

        {/* ---------------- CONTROLS + GRID ---------------- */}
        <section
          style={{
            background: "var(--surface-2)",
            borderTop: "1px solid var(--line)",
          }}
        >
          <div
            className="ohx-wrap"
            style={{
              paddingTop: "clamp(36px, 6vh, 64px)",
              paddingBottom: "clamp(56px, 9vh, 104px)",
            }}
          >
            <Eyebrow>Browse</Eyebrow>
            <h2
              className="ohx-display"
              style={{ marginTop: 8, marginBottom: 24 }}
            >
              All products
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 14,
                marginBottom: 18,
              }}
            >
              <input
                type="search"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                style={searchInputStyle}
              />
            </div>

            {/* Category filter as quiet toggle tags */}
            <div
              role="group"
              aria-label="Filter by category"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 28,
              }}
            >
              {categories.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className="ohx-tag"
                    aria-pressed={active}
                    onClick={() => handleCategoryFilter(cat)}
                    style={{
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background: active ? "var(--brand)" : "var(--surface)",
                      color: active ? "#fff" : "var(--muted)",
                      borderColor: active ? "var(--brand)" : "var(--line)",
                    }}
                  >
                    {capitalize(cat)}
                  </button>
                );
              })}
            </div>

            <p
              className="ohx-faint"
              style={{ fontSize: "0.85rem", marginBottom: 20 }}
              aria-live="polite"
            >
              {filteredProducts.length === 0
                ? "No matching products"
                : `Showing ${filteredProducts.length} of ${products.length}`}
            </p>

            {filteredProducts.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gap: 20,
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
                }}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div
                className="ohx-card"
                style={{ padding: "40px 28px", textAlign: "center" }}
              >
                <p
                  className="ohx-display"
                  style={{ fontSize: 22, margin: "0 0 8px" }}
                >
                  No products found matching your criteria.
                </p>
                <p className="ohx-muted" style={{ margin: 0, fontSize: 15 }}>
                  Try a different search or clear the category filter.
                </p>
              </div>
            )}
          </div>
        </section>
      </RefinedRoot>

      <FloatingCartButton />
    </>
  );
}
