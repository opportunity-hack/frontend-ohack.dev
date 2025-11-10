import React, { useState, useRef } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CheckIcon from "@mui/icons-material/Check";
import CircularProgress from "@mui/material/CircularProgress";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

// Utility functions for bot detection
const isValidEmail = (email) => {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;

  // Block common disposable email domains
  const disposableDomains = [
    "tempmail.com",
    "throwaway.email",
    "guerrillamail.com",
    "mailinator.com",
    "10minutemail.com",
    "trashmail.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return !disposableDomains.includes(domain);
};

const isValidName = (name) => {
  if (!name || name.trim().length < 2) return false;

  // Check for suspicious patterns
  // 1. Names that are too long (likely random strings)
  if (name.length > 50) return false;

  // 2. Names with excessive consecutive consonants (likely random)
  const consonantPattern = /[bcdfghjklmnpqrstvwxyz]{8,}/i;
  if (consonantPattern.test(name)) return false;

  // 3. Names that are mostly uppercase (like the bot example: IlZYXUHyUaUHmCPWoLJzbB)
  const uppercaseCount = (name.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (name.match(/[a-z]/g) || []).length;
  if (uppercaseCount > 5 && uppercaseCount > lowercaseCount * 2) return false;

  // 4. Names with no vowels
  if (!/[aeiou]/i.test(name)) return false;

  return true;
};

const LeadForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Honeypot field - bots will fill this, humans won't see it
  const [honeypot, setHoneypot] = useState("");

  // Track form interaction time (bots submit too quickly)
  const formStartTimeRef = useRef(null);

  // Track submission attempts for rate limiting
  const submissionAttemptsRef = useRef(0);
  const lastSubmissionTimeRef = useRef(0);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    // Start tracking interaction time when user first interacts
    if (!formStartTimeRef.current) {
      formStartTimeRef.current = Date.now();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Reset error state
    setError(null);

    // 1. Check honeypot (should be empty)
    if (honeypot) {
      console.warn("Bot detected: honeypot filled");
      setError("Something went wrong. Please try again.");
      return;
    }

    // 2. Validate email format
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // 3. Check submission timing (bots submit too quickly)
    if (formStartTimeRef.current) {
      const timeTaken = Date.now() - formStartTimeRef.current;
      if (timeTaken < 2000) {
        // Less than 2 seconds
        console.warn("Bot detected: submission too quick");
        setError("Please take your time filling out the form.");
        return;
      }
    }

    // 4. Rate limiting check
    const now = Date.now();
    const timeSinceLastSubmission = now - lastSubmissionTimeRef.current;
    if (timeSinceLastSubmission < 5000) {
      // 5 seconds between attempts
      setError("Please wait a moment before submitting again.");
      return;
    }

    // 5. Check rate limiting (max 3 attempts per session)
    if (submissionAttemptsRef.current >= 3) {
      setError("Too many attempts. Please refresh the page and try again.");
      return;
    }

    // Open the dialog to collect the name
    setOpen(true);
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleClose = async () => {
    // Validate name before proceeding
    if (!isValidName(name)) {
      setError("Please enter a valid name (at least 2 characters).");
      return;
    }

    if (!executeRecaptcha) {
      setError("reCAPTCHA not ready. Please try again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Increment submission attempts
    submissionAttemptsRef.current += 1;
    lastSubmissionTimeRef.current = Date.now();

    try {
      const token = await executeRecaptcha("lead_form_submit");

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
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            token,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to subscribe. Please try again.",
        );
      }

      setSubmitted(true);
      // Reset form on success
      setEmail("");
      setName("");
      formStartTimeRef.current = null;
    } catch (error) {
      console.error("Error:", error);
      setSubmitted(false);
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot field - hidden from users but bots will fill it */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents: "none",
        }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <Grid mt={10} container spacing={0.5} alignItems="center">
        <Grid item xs={7} sm={7} md={7}>
          <TextField
            label="Email Address"
            variant="outlined"
            type="email"
            value={email}
            onChange={handleEmailChange}
            inputProps={{ maxLength: 100 }}
            required
            fullWidth
            error={!!error && !open}
            helperText={!open && error ? error : ""}
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
            disabled={isLoading || !email}
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
            inputProps={{ maxLength: 50 }}
            required
            fullWidth
            autoFocus
            error={!!error}
            helperText={error || ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleClose}
            color="success"
            disabled={isLoading || !executeRecaptcha || !name}
          >
            {isLoading ? <CircularProgress size={24} /> : "Ship it"}
          </Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default LeadForm;
