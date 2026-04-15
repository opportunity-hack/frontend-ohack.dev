import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";

export default function CartItemList({
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
}) {
  if (!items || items.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <ShoppingCartIcon sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Your cart is empty
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Browse our store and add some items to your cart.
        </Typography>
        <Link href="/store" passHref legacyBehavior>
          <Button variant="contained">Continue Shopping</Button>
        </Link>
      </Box>
    );
  }

  return (
    <Box>
      {items.map((item, index) => (
        <Card key={`${item.id}-${index}`} sx={{ mb: 2 }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ sm: "center" }}
            >
              <Box
                sx={{
                  width: { xs: "100%", sm: 80 },
                  height: 80,
                  backgroundColor: "grey.100",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.image ? (
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.name}
                    sx={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                      p: 1,
                    }}
                  />
                ) : (
                  <ShoppingCartIcon sx={{ color: "grey.400" }} />
                )}
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {item.name}
                </Typography>
                {item.selectedVariations &&
                  Object.entries(item.selectedVariations).map(
                    ([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mt: 0.5 }}
                      />
                    )
                  )}
                <Typography variant="body2" color="primary" sx={{ mt: 0.5 }}>
                  ${item.price.toFixed(2)} each
                </Typography>
              </Box>

              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() =>
                    onUpdateQuantity(
                      item.id,
                      item.selectedVariations,
                      item.quantity - 1
                    )
                  }
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ minWidth: 24, textAlign: "center" }}>
                  {item.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() =>
                    onUpdateQuantity(
                      item.id,
                      item.selectedVariations,
                      item.quantity + 1
                    )
                  }
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{ minWidth: 70, textAlign: "right" }}
              >
                ${(item.price * item.quantity).toFixed(2)}
              </Typography>

              <IconButton
                color="error"
                onClick={() =>
                  onRemoveItem(item.id, item.selectedVariations)
                }
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      ))}

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Total
        </Typography>
        <Typography variant="h5" fontWeight="bold" color="primary">
          ${total.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
}
