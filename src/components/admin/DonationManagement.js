import React, { useState, useEffect } from "react";
import { TextField, Typography, Grid, Paper, Button, Box } from "@mui/material";

const DonationManagement = ({ initialDonationData, onDonationDataChange }) => {
  const [donationData, setDonationData] = useState({
    donation_current: {
      food: "0",
      prize: "0",
      swag: "0",
      thank_you: "",
    },
    donation_goals: {
      food: "0",
      prize: "0",
      swag: "0",
    },
  });

  useEffect(() => {
    if (initialDonationData) {
      setDonationData(initialDonationData);
    }
  }, [initialDonationData]);

  const handleInputChange = (category, field, value) => {
    setDonationData((prevData) => ({
      ...prevData,
      [category]: {
        ...prevData[category],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onDonationDataChange(donationData);
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Donation Management
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Current Donations
          </Typography>
          <TextField
            fullWidth
            label="Food"
            type="number"
            value={donationData.donation_current.food}
            onChange={(e) =>
              handleInputChange("donation_current", "food", e.target.value)
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Prize"
            type="number"
            value={donationData.donation_current.prize}
            onChange={(e) =>
              handleInputChange("donation_current", "prize", e.target.value)
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Swag"
            type="number"
            value={donationData.donation_current.swag}
            onChange={(e) =>
              handleInputChange("donation_current", "swag", e.target.value)
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Thank You"
            value={donationData.donation_current.thank_you}
            onChange={(e) =>
              handleInputChange("donation_current", "thank_you", e.target.value)
            }
            margin="normal"
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Donation Goals
          </Typography>
          <TextField
            fullWidth
            label="Food Goal"
            type="number"
            value={donationData.donation_goals.food}
            onChange={(e) =>
              handleInputChange("donation_goals", "food", e.target.value)
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Prize Goal"
            type="number"
            value={donationData.donation_goals.prize}
            onChange={(e) =>
              handleInputChange("donation_goals", "prize", e.target.value)
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Swag Goal"
            type="number"
            value={donationData.donation_goals.swag}
            onChange={(e) =>
              handleInputChange("donation_goals", "swag", e.target.value)
            }
            margin="normal"
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Update Donation Data
        </Button>
      </Box>
    </Paper>
  );
};

export default DonationManagement;
