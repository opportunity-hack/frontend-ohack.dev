import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { judgeHeaderMapping, transformJudgeData } from "./judgeHeaderMappings";
import {
  mentorHeaderMapping,
  transformMentorData,
} from "./mentorHeaderMappings";


const VolunteerBulkAdd = ({ onAddVolunteers }) => {
  const [pastedData, setPastedData] = useState("");
  const [volunteerType, setVolunteerType] = useState("mentors");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handlePaste = (event) => {
    setPastedData(event.target.value);
  };

  const handleTypeChange = (event) => {
    setVolunteerType(event.target.value);
  };

  const parseVolunteers = () => {
    const rows = pastedData.trim().split("\n");
    const headers = rows[0].split("\t");

    return rows.slice(1).map((row) => {
      const values = row.split("\t");
      const rawVolunteer = {};
      headers.forEach((header, index) => {
        rawVolunteer[header.trim()] = values[index]?.trim() || "";
      });

      if (volunteerType === "judges") {
        return transformJudgeData(rawVolunteer);
      } else if (volunteerType === "mentors") {
        return transformMentorData(rawVolunteer);
      } else {
        // Handle general volunteer parsing here
        // You'll need to create similar mapping and transformation functions for this type
        return rawVolunteer;
      }
    });
  };

  const handleSubmit = () => {
    try {
      const volunteers = parseVolunteers();
      onAddVolunteers(volunteerType, volunteers);
      setSnackbar({
        open: true,
        message: "Volunteers added successfully!",
        severity: "success",
      });
      setPastedData("");
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error adding volunteers. Please check your data.",
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Add New Volunteers
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Volunteer Type</InputLabel>
        <Select value={volunteerType} onChange={handleTypeChange}>
          <MenuItem value="mentors">Mentors</MenuItem>
          <MenuItem value="judges">Judges</MenuItem>
          <MenuItem value="volunteers">General Volunteers</MenuItem>
        </Select>
      </FormControl>
      <TextField
        fullWidth
        multiline
        rows={10}
        value={pastedData}
        onChange={handlePaste}
        placeholder="Paste your tab-separated volunteer data here..."
        variant="outlined"
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={!pastedData}
      >
        Add Volunteers
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VolunteerBulkAdd;