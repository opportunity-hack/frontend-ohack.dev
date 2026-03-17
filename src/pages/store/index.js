import React, { useState, useEffect, useCallback } from "react";
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

const STORE_DESCRIPTION =
  "Shop Opportunity Hack merchandise — t-shirts, hoodies, stickers, mugs, and more. All proceeds support nonprofits through technology.";

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
                p.description.toLowerCase().includes(value.toLowerCase())
            ).length,
          },
        });
      }
    },
    [products]
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
    const matchesCategory =
      category === "all" || product.category === category;
    return matchesSearch && matchesCategory;
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Opportunity Hack Store",
    description: STORE_DESCRIPTION,
    url: "https://ohack.dev/store",
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: `https://ohack.dev${product.image}`,
        url: `https://ohack.dev/store/products/${product.id}`,
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
    url: "https://ohack.dev/store",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://ohack.dev",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Store",
          item: "https://ohack.dev/store",
        },
      ],
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Opportunity Hack",
      url: "https://ohack.dev",
    },
  };

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
        <link rel="canonical" href="https://ohack.dev/store" />

        {/* Open Graph */}
        <meta
          property="og:title"
          content="Opportunity Hack Store | Merchandise for Social Good"
        />
        <meta property="og:description" content={STORE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ohack.dev/store" />
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
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
            onChange={(e) => handleSearch(e.target.value)}
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
                onClick={() => handleCategoryFilter(cat)}
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
