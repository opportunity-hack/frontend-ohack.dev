import React, { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CheckIcon from "@mui/icons-material/Check";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CircularProgress from "@mui/material/CircularProgress";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import ReCaptchaProvider from "../ReCaptchaProvider";
import { initFacebookPixel, trackEvent, trackForm } from '../../lib/ga';

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

  useEffect(() => { initFacebookPixel(); }, []);
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
      trackForm('lead_form', 'start');
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
    trackForm('lead_form', 'email_entered');
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
      trackEvent({ action: 'lead_form_submit', params: { event_label: 'success', page: 'home' } });
      // Reset form on success
      setEmail("");
      setName("");
      formStartTimeRef.current = null;
    } catch (error) {
      console.error("Error:", error);
      setSubmitted(false);
      setError(error.message || "An error occurred. Please try again.");
      trackEvent({ action: 'lead_form_error', params: { event_label: error.message, page: 'home' } });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <Box
      sx={{
        my: { xs: 3, md: 4 },
        mx: "auto",
        maxWidth: "560px",
        borderRadius: "1rem",
        background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%)",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        px: { xs: 2.5, sm: 4 },
        py: { xs: 3, sm: 3.5 },
        textAlign: "center",
      }}
    >
      <NotificationsActiveIcon
        sx={{
          fontSize: 36,
          color: "var(--color3)",
          mb: 1,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          color: "#1a1a2e",
          mb: 0.5,
        }}
      >
        Stay in the loop
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#555",
          mb: 2.5,
          fontSize: { xs: "0.85rem", sm: "0.9rem" },
          lineHeight: 1.5,
        }}
      >
        Get notified about upcoming hackathons, new nonprofit projects, and ways to get involved.
      </Typography>

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

        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "stretch",
          }}
        >
          <TextField
            placeholder="you@example.com"
            variant="outlined"
            type="email"
            size="small"
            value={email}
            onChange={handleEmailChange}
            inputProps={{ maxLength: 100, "aria-label": "Email Address" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutlineIcon sx={{ fontSize: 20, color: "#999" }} />
                </InputAdornment>
              ),
            }}
            required
            fullWidth
            error={!!error && !open}
            helperText={!open && error ? error : ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#fff",
                borderRadius: "2rem",
                fontSize: "0.9rem",
                "& fieldset": {
                  borderColor: "rgba(0,0,0,0.12)",
                },
                "&:hover fieldset": {
                  borderColor: "var(--color3)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "var(--color3)",
                },
              },
            }}
          />
          <Button
            variant="contained"
            type="submit"
            endIcon={submitted === true ? <CheckIcon /> : null}
            disabled={isLoading || !email}
            sx={{
              borderRadius: "2rem",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
              px: 3,
              whiteSpace: "nowrap",
              minHeight: 40,
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              backgroundColor:
                submitted === true
                  ? "success.main"
                  : submitted === false
                    ? "error.main"
                    : "var(--color3)",
              "&:hover": {
                backgroundColor:
                  submitted === true
                    ? "success.dark"
                    : submitted === false
                      ? "error.dark"
                      : "var(--color3)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : submitted === true ? (
              "Subscribed"
            ) : (
              "Subscribe"
            )}
          </Button>
        </Box>
      </form>

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
    </Box>
  );
};

// Wrap the default export so consumers (homepage, etc.) get the reCAPTCHA
// context without having to mount the provider sitewide. This keeps the
// reCAPTCHA v3 script off of pages that don't render LeadForm.
export default function LeadFormWithRecaptcha() {
  return (
    <ReCaptchaProvider>
      <LeadForm />
    </ReCaptchaProvider>
  );
}
