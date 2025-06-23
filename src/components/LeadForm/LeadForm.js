import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CheckIcon from "@mui/icons-material/Check";
import CircularProgress from "@mui/material/CircularProgress";

const LeadForm = () => {
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const ReactRecaptcha3 = (await import("react-google-recaptcha3")).default;
      await ReactRecaptcha3.init(
        process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY
      );
      setRecaptchaLoaded(true);
    } catch (error) {
      console.error("Error loading reCAPTCHA:", error);
      setError("Failed to load reCAPTCHA. Please try again.");
    } finally {
      setIsLoading(false);
      setOpen(true);
    }
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleClose = async () => {
    if (!recaptchaLoaded) {
      setError("reCAPTCHA not loaded. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ReactRecaptcha3 = (await import("react-google-recaptcha3")).default;
      const token = await ReactRecaptcha3.getToken();

      if (!token) {
        throw new Error("Failed to obtain reCAPTCHA token");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/lead`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, token }),
        }
      );

      if (!response.ok) {
        throw new Error("API request failed");
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      setSubmitted(false);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid mt={10} container spacing={0.5} alignItems="center">
        <Grid item xs={7} sm={7} md={7}>
          <TextField
            label="Email Address"
            variant="outlined"
            type="email"
            value={email}
            onChange={handleEmailChange}
            inputProps={{ maxLength: 100 }}
            fullWidth
          />
        </Grid>
        <Grid item xs={5} sm={5} md={5}>
          <Button
            variant="contained"
            color={
              submitted === true
                ? "success"
                : submitted === false
                  ? "error"
                  : "primary"
            }
            type="submit"
            endIcon={submitted === true ? <CheckIcon /> : null}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} />
            ) : (
              "Subscribe to newsletter"
            )}
          </Button>
        </Grid>
      </Grid>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Hey! Also tell us your name</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            variant="filled"
            type="text"
            value={name}
            onChange={handleNameChange}
            fullWidth
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleClose}
            color="success"
            disabled={isLoading || !recaptchaLoaded}
          >
            {isLoading ? <CircularProgress size={24} /> : "Ship it"}
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default LeadForm;
