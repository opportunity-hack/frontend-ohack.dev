import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActions,
  Chip,
  Box,
} from "@mui/material";
import Link from "next/link";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export default function ProductCard({ product }) {
  const hasVariations =
    product.variations && Object.keys(product.variations).length > 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <CardMedia
        component="div"
        sx={{
          height: 220,
          backgroundColor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {product.image ? (
          <Box
            component="img"
            src={product.image}
            alt={product.name}
            sx={{
              maxHeight: "100%",
              maxWidth: "100%",
              objectFit: "contain",
              p: 2,
            }}
          />
        ) : (
          <ShoppingCartIcon sx={{ fontSize: 64, color: "grey.400" }} />
        )}
      </CardMedia>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {product.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.description}
        </Typography>
        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            ${product.price.toFixed(2)}
          </Typography>
          {product.category && (
            <Chip label={product.category} size="small" variant="outlined" />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Link href={`/store/products/${product.id}`} passHref legacyBehavior>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCartIcon />}
          >
            {hasVariations ? "Select Options" : "View Details"}
          </Button>
        </Link>
      </CardActions>
    </Card>
  );
}
