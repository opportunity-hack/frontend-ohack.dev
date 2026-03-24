import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Container,
  Typography,
  Box,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import { trackEvent, initFacebookPixel } from "../../lib/ga";
import CartItemList from "../../components/Store/CartItemList";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoveItem = (cartKey) => {
    const item = items.find((i) => i.cartKey === cartKey);
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
    removeItem(cartKey);
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
    const stripePublishableKey =
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!stripePublishableKey) {
      setError(
        "Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment."
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
          }))
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

  return (
    <>
      <Head>
        <title>Shopping Cart - Opportunity Hack Store</title>
        <meta
          name="description"
          content="Review your Opportunity Hack merchandise cart and proceed to checkout. All proceeds support nonprofits through technology."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://ohack.dev/store/cart" />

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
        <meta property="og:url" content="https://ohack.dev/store/cart" />
        <meta property="og:site_name" content="Opportunity Hack" />
      </Head>

      <Container maxWidth="md" sx={{ pt: "9rem", pb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1" fontWeight="bold">
            Shopping Cart
          </Typography>
          <Link href="/store" passHref legacyBehavior>
            <Button startIcon={<ArrowBackIcon />}>Continue Shopping</Button>
          </Link>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <CartItemList
          items={items}
          total={total}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={handleRemoveItem}
        />

        {items.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearCart}
                disabled={loading}
              >
                Clear Cart
              </Button>
              <Button
                variant="contained"
                size="large"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <ShoppingCartCheckoutIcon />
                  )
                }
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : `Checkout — $${total.toFixed(2)}`}
              </Button>
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
