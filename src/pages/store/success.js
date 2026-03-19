import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Link from "next/link";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import { trackEvent, initFacebookPixel } from "../../lib/ga";

export default function SuccessPage() {
  const { clearCart } = useShoppingCart();
  const router = useRouter();
  const { session_id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initFacebookPixel();
    clearCart();
    trackEvent({
      action: "store_purchase_complete",
      params: {
        page: "store_success",
        currency: "USD",
      },
    });
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!session_id) return;

    let cancelled = false;
    let retried = false;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/store/orders/by-session/${session_id}`
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setOrder(data.order);
        } else if (res.status === 404 && !retried) {
          // Retry once after 2s for webhook race condition
          retried = true;
          await new Promise((r) => setTimeout(r, 2000));
          const retryRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/store/orders/by-session/${session_id}`
          );
          if (retryRes.ok) {
            const data = await retryRes.json();
            if (!cancelled) setOrder(data.order);
          }
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrder();
    return () => {
      cancelled = true;
    };
  }, [session_id]);

  return (
    <>
      <Head>
        <title>Order Confirmed — Opportunity Hack Store</title>
        <meta
          name="description"
          content="Thank you for your purchase! Your order has been confirmed. All proceeds support nonprofits through technology at Opportunity Hack."
        />
        <meta name="robots" content="noindex, nofollow" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Order Confirmed — Opportunity Hack Store"
        />
        <meta
          property="og:description"
          content="Thank you for supporting nonprofits through technology!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Opportunity Hack" />
      </Head>

      <Container maxWidth="sm" sx={{ pt: "9rem", pb: 8 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CheckCircleOutlineIcon
            sx={{ fontSize: 80, color: "success.main", mb: 2 }}
          />
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Thank You!
          </Typography>

          {loading ? (
            <Box sx={{ my: 3 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading your order details...
              </Typography>
            </Box>
          ) : order ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {order.customerName
                  ? `Thanks, ${order.customerName}! Your`
                  : "Your"}{" "}
                order has been confirmed.
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Order #{order.id?.substring(0, 8)}
              </Typography>

              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          {item.name}
                          {item.description && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              {item.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">
                          ${item.totalPrice?.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={2} align="right" sx={{ fontWeight: "bold" }}>
                        Total
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: "bold" }}>
                        ${order.total?.toFixed(2)} {order.currency?.toUpperCase()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                A confirmation email has been sent to {order.customerEmail}.
              </Typography>
            </>
          ) : (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Your order has been confirmed. You will receive an email
              confirmation shortly.
            </Typography>
          )}

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
