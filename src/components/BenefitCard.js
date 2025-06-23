import { memo } from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";

export const BenefitCard = memo(({ icon: Icon, title, description }) => (
  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Icon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Typography variant="body1">{description}</Typography>
    </CardContent>
  </Card>
));

BenefitCard.displayName = "BenefitCard";
