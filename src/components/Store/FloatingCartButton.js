import React from "react";
import { Fab, Badge, Zoom, Typography, Box } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";
import { useShoppingCart } from "../../context/ShoppingCartContext";

export default function FloatingCartButton() {
  const { itemCount, total } = useShoppingCart();

  return (
    <Zoom in>
      <Link href="/store/cart" passHref legacyBehavior>
        <Fab
          variant="extended"
          color="primary"
          aria-label="View shopping cart"
          sx={{
            position: "fixed",
            bottom: { xs: 24, sm: 32 },
            right: { xs: 16, sm: 32 },
            zIndex: 1100,
            px: 2.5,
            py: 1,
            gap: 1,
            boxShadow: 6,
            textTransform: "none",
            "&:hover": {
              boxShadow: 10,
            },
          }}
        >
          <Badge badgeContent={itemCount} color="error">
            <ShoppingCartIcon />
          </Badge>
          {itemCount > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", ml: 0.5 }}>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ lineHeight: 1.2 }}
              >
                ${total.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ lineHeight: 1, opacity: 0.9 }}>
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Typography>
            </Box>
          )}
          {itemCount === 0 && (
            <Typography variant="body2" fontWeight="bold">
              Cart
            </Typography>
          )}
        </Fab>
      </Link>
    </Zoom>
  );
}
