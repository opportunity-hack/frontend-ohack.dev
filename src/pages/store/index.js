import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  InputAdornment,
  Button,
  Badge,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../lib/ga";
import ProductCard from "../../components/Store/ProductCard";
import FloatingCartButton from "../../components/Store/FloatingCartButton";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import products from "../../data/store-products.json";

export default function StorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { itemCount } = useShoppingCart();

  useEffect(() => {
    initFacebookPixel();
    trackEvent({ action: "page_view", params: { page: "store" } });
  }, []);

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Head>
        <title>Store - Opportunity Hack</title>
        <meta
          name="description"
          content="Support Opportunity Hack by purchasing merchandise. All proceeds go towards supporting nonprofits through technology."
        />
        <meta property="og:title" content="Opportunity Hack Store" />
        <meta
          property="og:description"
          content="Support Opportunity Hack by purchasing merchandise. All proceeds go towards supporting nonprofits through technology."
        />
        <meta property="og:type" content="website" />
      </Head>

      <Container maxWidth="lg" sx={{ pt: "9rem", pb: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <StorefrontIcon sx={{ fontSize: 36, color: "primary.main" }} />
            <Typography variant="h3" component="h1" fontWeight="bold">
              Store
            </Typography>
          </Box>
          <Link href="/store/cart" passHref legacyBehavior>
            <Button
              variant="contained"
              startIcon={
                <Badge badgeContent={itemCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
              }
              aria-label={
                itemCount > 0
                  ? `View cart with ${itemCount} ${itemCount === 1 ? "item" : "items"}`
                  : "View cart"
              }
              sx={{ whiteSpace: "nowrap" }}
            >
              View Cart
              {itemCount > 0 && ` (${itemCount})`}
            </Button>
          </Link>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Support Opportunity Hack by purchasing merchandise. All proceeds go
          towards supporting nonprofits through technology.
        </Typography>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            mb: 4,
            alignItems: { sm: "center" },
          }}
        >
          <TextField
            size="small"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 250 }}
          />
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                onClick={() => setCategory(cat)}
                color={category === cat ? "primary" : "default"}
                variant={category === cat ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Box>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <Grid container spacing={3}>
            {filteredProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No products found matching your criteria.
            </Typography>
          </Box>
        )}
      </Container>

      <FloatingCartButton />
    </>
  );
}
