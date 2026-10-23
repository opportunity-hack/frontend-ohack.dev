import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import { trackEvent, initFacebookPixel } from "../../lib/ga";
import { RefinedRoot, Eyebrow } from "../../components/design/refined";
import { pageSectionStyle } from "../../components/design/RefinedPage";
import CartItemList from "../../components/Store/CartItemList";

const sameVariations = (a, b) =>
  JSON.stringify(a || {}) === JSON.stringify(b || {});

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } =
    useShoppingCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initFacebookPixel();
    // Track cart view on page load; items/total are hydrated from localStorage before first render
    trackEvent({
      action: "store_view_cart",
      params: {
        page: "store_cart",
        items_count: items.length,
        cart_total: total,
        currency: "USD",
      },
    });
  }, []);

  // CartItemList calls this with (id, selectedVariations) — the same pair the
  // cart context keys on. (It used to look items up by a `cartKey` field that
  // never existed, so variation items couldn't be removed and the GA event
  // never fired.)
  const handleRemoveItem = (id, selectedVariations) => {
    const item = items.find(
      (i) =>
        i.id === id && sameVariations(i.selectedVariations, selectedVariations),
    );
    if (item) {
      trackEvent({
        action: "store_remove_from_cart",
        params: {
          page: "store_cart",
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
          value: item.price * item.quantity,
          currency: "USD",
        },
      });
    }
    removeItem(id, selectedVariations);
  };

  const handleClearCart = () => {
    trackEvent({
      action: "store_clear_cart",
      params: {
        page: "store_cart",
        items_count: items.length,
        cart_total: total,
        currency: "USD",
      },
    });
    clearCart();
  };

  const handleCheckout = async () => {
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!stripePublishableKey) {
      setError(
        "Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment.",
      );
      return;
    }

    setLoading(true);
    setError("");

    trackEvent({
      action: "store_begin_checkout",
      params: {
        page: "store_cart",
        items_count: items.length,
        cart_total: total,
        currency: "USD",
        items: JSON.stringify(
          items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        ),
      },
    });

    try {
      const response = await fetch("/api/store/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from Stripe");
      }
    } catch (err) {
      setError(err.message);
      trackEvent({
        action: "store_checkout_error",
        params: {
          page: "store_cart",
          error_message: err.message,
          items_count: items.length,
          cart_total: total,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasItems = items.length > 0;

  return (
    <>
      <Head>
        <title>Shopping Cart - Opportunity Hack Store</title>
        <meta
          name="description"
          content="Review your Opportunity Hack merchandise cart and proceed to checkout. All proceeds support nonprofits through technology."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://www.ohack.dev/store/cart" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Shopping Cart - Opportunity Hack Store"
        />
        <meta
          property="og:description"
          content="Review your cart and checkout. All proceeds support nonprofits through technology."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ohack.dev/store/cart" />
        <meta property="og:site_name" content="Opportunity Hack" />
      </Head>

      <RefinedRoot>
        <section className="ohx-wrap" style={pageSectionStyle}>
          <Link href="/store" className="ohx-link" style={{ fontSize: 13 }}>
            <span aria-hidden="true">←</span> Continue shopping
          </Link>

          <header style={{ marginTop: 18 }}>
            <Eyebrow>Opportunity Hack store</Eyebrow>
            <h1
              className="ohx-display"
              style={{ marginTop: 8, maxWidth: "22ch" }}
            >
              Your cart
            </h1>
            <p className="ohx-lead" style={{ marginTop: 14, maxWidth: "58ch" }}>
              Every order funds free software for nonprofits. Review your items,
              then finish payment on Stripe's secure checkout page.
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="ohx-card"
              style={{
                marginTop: 28,
                padding: "14px 18px",
                borderColor: "var(--danger)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: "var(--danger)",
                }}
              >
                {error}
              </p>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                style={{
                  background: "none",
                  border: 0,
                  padding: 0,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 18,
                  lineHeight: 1,
                  color: "var(--muted)",
                }}
              >
                ×
              </button>
            </div>
          )}

          <div
            style={{
              marginTop: 36,
              display: "flex",
              flexWrap: "wrap",
              gap: 32,
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: "999 1 420px", minWidth: 0 }}>
              <CartItemList
                items={items}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </div>

            {hasItems && (
              <aside
                className="ohx-card"
                aria-label="Order summary"
                style={{
                  flex: "1 1 300px",
                  padding: "22px 24px",
                  position: "sticky",
                  top: 88,
                  minWidth: 0,
                }}
              >
                <Eyebrow>Order summary</Eyebrow>
                <dl style={{ margin: "14px 0 0" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 15,
                      color: "var(--muted)",
                    }}
                  >
                    <dt style={{ margin: 0 }}>
                      {itemCount} {itemCount === 1 ? "item" : "items"}
                    </dt>
                    <dd
                      style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}
                    >
                      ${total.toFixed(2)}
                    </dd>
                  </div>
                  <hr className="ohx-rule" style={{ margin: "14px 0" }} />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: 12,
                    }}
                  >
                    <dt
                      className="ohx-display"
                      style={{ margin: 0, fontSize: 18 }}
                    >
                      Total
                    </dt>
                    <dd
                      className="ohx-display"
                      style={{
                        margin: 0,
                        fontSize: 26,
                        color: "var(--brand)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      ${total.toFixed(2)}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="ohx-btn ohx-btn--primary"
                  onClick={handleCheckout}
                  disabled={loading}
                  aria-busy={loading}
                  style={{
                    marginTop: 20,
                    width: "100%",
                    justifyContent: "center",
                    fontSize: 14,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "progress" : "pointer",
                  }}
                >
                  {loading ? "Processing…" : `Checkout — $${total.toFixed(2)}`}
                </button>
                <p
                  className="ohx-faint"
                  style={{
                    margin: "10px 0 0",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                  }}
                >
                  You'll be redirected to Stripe to pay. Proceeds support
                  nonprofits through technology.
                </p>

                <button
                  type="button"
                  onClick={handleClearCart}
                  disabled={loading}
                  style={{
                    marginTop: 16,
                    background: "none",
                    border: 0,
                    padding: 0,
                    cursor: loading ? "default" : "pointer",
                    font: "inherit",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--muted)",
                    textDecoration: "underline",
                    textDecorationColor: "var(--line)",
                    textUnderlineOffset: 3,
                  }}
                >
                  Clear cart
                </button>
              </aside>
            )}
          </div>
        </section>
      </RefinedRoot>
    </>
  );
}
