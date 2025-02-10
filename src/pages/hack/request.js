import React, { useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Box,
  Container,
  Snackbar,
  CircularProgress,
  Slider,
  Tooltip,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import InfoIcon from "@mui/icons-material/Info";
import { debounce } from "lodash";
import * as ga from "../../lib/ga";

function ValueLabelComponent(props) {
  const { children, value } = props;

  return (
    <Tooltip
      enterTouchDelay={0}
      placement="top"
      title={`$${value.toLocaleString()}`}
    >
      {children}
    </Tooltip>
  );
}

const calculatePerPersonBudget = (totalBudget, employeeCount) => {
  const countRanges = {
    "50": 50,
    "100": 100,    
    "200": 200,
    "300": 300,
    "500": 500,
    "1000+": 1000
  };
  const averageCount = countRanges[employeeCount] || 0;
  return averageCount ? Math.round(totalBudget / averageCount) : 0;
};

export default function CreateHackathon() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    employeeCount: "",
    preferredDate: "",
    location: "",
    focusArea: "",
    additionalInfo: "",
    budget: 10000, // Default budget set to $10,000
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trackEvent = useCallback(
    debounce((action, category, label, value) => {
      ga.event({
        action,
        category,
        label,
        value,
      });
    }, 500),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    trackEvent("input", "CreateHackathon", `${name}_changed`);
  };

  const handleSliderChange = (event, newValue) => {
    setFormData((prevData) => ({ ...prevData, budget: newValue }));
    trackEvent("input", "CreateHackathon", "budget_changed", newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/create-hackathon`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        trackEvent(
          "submit",
          "CreateHackathon",
          "form_submitted",
          formData.budget
        );
        setSnackbar({
          open: true,
          message:
            "Thank you for your interest! We'll be in touch soon to discuss how we can make your hackathon a success.",
          severity: "success",
        });
        setTimeout(() => router.push("/"), 7500);
      } else {
        throw new Error("Failed to submit");
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred. Please try again or contact us directly.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>
          Create a High-Impact Corporate Hackathon | Opportunity Hack
        </title>
        <meta
          name="description"
          content="Partner with Opportunity Hack to host a transformative hackathon for your company. Engage employees, drive innovation, and create lasting social impact. Our expert team has been organizing impactful hackathons since 2013."
        />
        <meta
          name="keywords"
          content="corporate hackathon, social good, charity hackathon, employee engagement, tech for good, Opportunity Hack, CSR, corporate social responsibility"
        />
      </Head>
      <Container maxWidth="md">
        <Box mt={10}>
          <Typography variant="h3" component="h1" gutterBottom>
            Create a High-Impact Corporate Hackathon
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            Transform Your Company's Social Impact with Opportunity Hack
          </Typography>
          <Typography variant="body1" paragraph>
            Since 2013, Opportunity Hack has been at the forefront of organizing
            transformative hackathons that bridge the gap between tech talent
            and nonprofits. Now, we're bringing our expertise directly to your
            company. Host a hackathon that not only engages your employees but
            also creates tangible, real-world solutions for pressing social
            issues.
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label="Company or University Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Contact Name"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Contact Phone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>
                Number of Students or Employees who would participate
              </InputLabel>
              <Select
                name="employeeCount"
                value={formData.employeeCount}
                onChange={handleChange}
                label="Number of Employees who would participate"
                required
              >
                <MenuItem value="50">50</MenuItem>
                <MenuItem value="100">100</MenuItem>
                <MenuItem value="200">200</MenuItem>
                <MenuItem value="300">300</MenuItem>
                <MenuItem value="500">500</MenuItem>
                <MenuItem value="1000+">1000+</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              label="Preferred Date"
              name="preferredDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.preferredDate}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Location (City, State, Country)"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Focus Area</InputLabel>
              <Select
                name="focusArea"
                value={formData.focusArea}
                onChange={handleChange}
                required
              >
                <MenuItem value="Local Charities">Local Charities</MenuItem>
                <MenuItem value="Opportunity Hack Problems">
                  Opportunity Hack Problems
                </MenuItem>
                <MenuItem value="Custom Problem Statements">
                  Custom Problem Statements (please provide details below)
                </MenuItem>
              </Select>
            </FormControl>
            <Box mt={4} mb={2}>
              <Typography variant="h6" gutterBottom>
                Estimated Budget for Social Impact
                <Tooltip
                  title=<span style={{ fontSize: "1.2rem" }}>
                    This budget helps us tailor the event to your needs and
                    maximizes the social impact we can achieve together. It
                    covers event organization, travel, materials, and a donation
                    to support our ongoing nonprofit work.
                  </span>
                >
                  <InfoIcon
                    fontSize="small"
                    sx={{ ml: 1, verticalAlign: "middle" }}
                  />
                </Tooltip>
              </Typography>
              <Slider
                value={formData.budget}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                min={5000}
                max={50000}
                step={1000}
                marks={[
                  { value: 5000, label: "$5k" },
                  { value: 25000, label: "$25k" },
                  { value: 50000, label: "$50k" },
                ]}
                ValueLabelComponent={ValueLabelComponent}
              />
              <Typography variant="body2" color="textSecondary" align="center">
                Suggested budget: ${formData.budget.toLocaleString()}
              </Typography>
              {formData.employeeCount && (
                <>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                    sx={{ mt: 1 }}
                  >
                    Estimated per-person budget: $
                    {calculatePerPersonBudget(
                      formData.budget,
                      formData.employeeCount
                    )}
                  </Typography>
                  <Box
                    sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      Typical costs per participant:
                      <ul style={{ margin: "8px 0" }}>
                        <li>
                          $97 - Meals and refreshments for the weekend (36 hours
                          of continous hacking)
                        </li>
                        <li>
                          $19 - Participant swag pack (shirt, hat, stickers)
                        </li>
                        <li>
                          Additional costs include prizes, venue, equipment, and
                          event support
                        </li>
                      </ul>
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            <TextField
              fullWidth
              margin="normal"
              label="Additional Information or Special Requests"
              name="additionalInfo"
              multiline
              rows={4}
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Tell us about your company's social responsibility goals or any specific areas of impact you're interested in..."
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} />
              ) : (
                "Submit Request for Custom Proposal"
              )}
            </Button>
          </form>
        </Box>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
