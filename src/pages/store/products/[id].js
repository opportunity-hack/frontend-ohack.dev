import React, { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  IconButton,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useShoppingCart } from "../../../context/ShoppingCartContext";
import { trackEvent, initFacebookPixel } from "../../../lib/ga";
import FloatingCartButton from "../../../components/Store/FloatingCartButton";
import products from "../../../data/store-products.json";

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addItem } = useShoppingCart();

  const product = useMemo(
    () => products.find((p) => p.id === id),
    [id]
  );

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

  if (!id) return null;

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ pt: "9rem", pb: 4 }}>
        <Typography variant="h5">Product not found</Typography>
        <Link href="/store" passHref legacyBehavior>
          <Button startIcon={<ArrowBackIcon />} sx={{ mt: 2 }}>
            Back to Store
          </Button>
        </Link>
      </Container>
    );
  }

  const hasVariations =
    product.variations && Object.keys(product.variations).length > 0;
  const allVariationsSelected = hasVariations
    ? Object.keys(product.variations).every(
        (key) => selectedVariations[key]
      )
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
        ...(hasVariations ? { variations: JSON.stringify(selectedVariations) } : {}),
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <Container maxWidth="lg" sx={{ pt: "9rem", pb: 4 }}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/store" passHref legacyBehavior>
            <Typography
              component="a"
              color="inherit"
              sx={{
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
                cursor: "pointer",
              }}
            >
              Store
            </Typography>
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Product Image */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                backgroundColor: "grey.100",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 350,
                p: 4,
              }}
            >
              {product.image ? (
                <Box
                  component="img"
                  src={product.image}
                  alt={product.name}
                  sx={{
                    maxHeight: 350,
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <ShoppingCartIcon sx={{ fontSize: 120, color: "grey.300" }} />
              )}
            </Box>
          </Grid>

          {/* Product Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {product.name}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  ${product.price.toFixed(2)}
                </Typography>
                {product.category && (
                  <Chip
                    label={product.category}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>

              <Typography variant="body1" color="text.secondary">
                {product.description}
              </Typography>

              {/* Variations */}
              {hasVariations &&
                Object.entries(product.variations).map(
                  ([variationName, options]) => (
                    <FormControl key={variationName} fullWidth size="small">
                      <InputLabel>{variationName}</InputLabel>
                      <Select
                        value={selectedVariations[variationName] || ""}
                        label={variationName}
                        onChange={(e) =>
                          handleVariationChange(variationName, e.target.value)
                        }
                      >
                        {options.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )
                )}

              {/* Quantity */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body1">Quantity:</Typography>
                <IconButton
                  size="small"
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ minWidth: 24, textAlign: "center" }}>
                  {quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <AddIcon />
                </IconButton>
              </Box>

              {/* Add to Cart */}
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={!allVariationsSelected}
                sx={{ mt: 2 }}
              >
                Add to Cart — ${(product.price * quantity).toFixed(2)}
              </Button>

              {hasVariations && !allVariationsSelected && (
                <Typography variant="body2" color="text.secondary">
                  Please select all options before adding to cart.
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity="success"
          variant="filled"
        >
          Added to cart!{" "}
          <Link href="/store/cart" passHref legacyBehavior>
            <Typography
              component="a"
              sx={{ color: "inherit", fontWeight: "bold" }}
            >
              View Cart
            </Typography>
          </Link>
        </Alert>
      </Snackbar>

      <FloatingCartButton />
    </>
  );
}
