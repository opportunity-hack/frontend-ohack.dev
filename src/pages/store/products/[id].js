import React, { useState, useMemo } from "react";
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

  if (!id) return null;

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
  };

  return (
    <>
      <Head>
        <title>{product.name} - Opportunity Hack Store</title>
        <meta name="description" content={product.description} />
        <meta
          property="og:title"
          content={`${product.name} - Opportunity Hack Store`}
        />
        <meta property="og:description" content={product.description} />
      </Head>

      <Container maxWidth="lg" sx={{ py: 4 }}>
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
                          setSelectedVariations((prev) => ({
                            ...prev,
                            [variationName]: e.target.value,
                          }))
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
