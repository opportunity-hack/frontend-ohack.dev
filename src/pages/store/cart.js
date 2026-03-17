import React, { useState } from "react";
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
import { loadStripe } from "@stripe/stripe-js";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import CartItemList from "../../components/Store/CartItemList";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } =
    useShoppingCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const stripe = await loadStripe(stripePublishableKey);
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Shopping Cart - Opportunity Hack Store</title>
        <meta name="description" content="Review your cart and checkout." />
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
          onRemoveItem={removeItem}
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
                onClick={clearCart}
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
