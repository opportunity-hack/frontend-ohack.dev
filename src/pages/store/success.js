import React, { useEffect } from "react";
import Head from "next/head";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Link from "next/link";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import { trackEvent } from "../../lib/ga";

export default function SuccessPage() {
  const { clearCart } = useShoppingCart();

  useEffect(() => {
    clearCart();
    trackEvent({
      action: "purchase",
      params: { page: "store_success" },
    });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Order Confirmed - Opportunity Hack Store</title>
        <meta
          name="description"
          content="Thank you for your purchase! Your order has been confirmed."
        />
      </Head>

      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Thank You!
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Your order has been confirmed. You will receive an email
            confirmation shortly.
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            All proceeds support nonprofits through technology at Opportunity
            Hack. 💙
          </Typography>
          <Link href="/store" passHref legacyBehavior>
            <Button
              variant="contained"
              size="large"
              startIcon={<StorefrontIcon />}
            >
              Continue Shopping
            </Button>
          </Link>
        </Paper>
      </Container>
    </>
  );
}
