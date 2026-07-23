import React from "react";
import {
  Alert,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Link,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";

const DepositSection = ({ formData, setFormData, handleChange, depositCfg }) => {
  const defaultCents = depositCfg?.default_amount_cents || 500;
  const currentCents = Number.isInteger(formData.depositAmountCents)
    ? formData.depositAmountCents
    : defaultCents;
  const paid = !!formData.stripePaymentIntentId;

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        Hacker deposit
      </Typography>
      {paid ? (
        <Alert severity="success" sx={{ mb: 1 }}>
          <Typography variant="body1">
            ✓ Deposit received ($
            {((currentCents || 0) / 100).toFixed(2)} —{" "}
            {formData.depositDisposition === "donate"
              ? "donated to OHack"
              : "refundable on completion"}
            ). You're all set to submit your application.
          </Typography>
        </Alert>
      ) : (
        <>
          <Typography variant="body1" sx={{ mb: 2 }}>
            We collect a small deposit so we can plan accurately for food and
            supplies. After the hackathon, we'll refund it — or you can leave
            it as a donation to keep Opportunity Hack free for the next group
            of hackers.
          </Typography>
          <TextField
            label="Deposit amount (USD)"
            type="number"
            value={(currentCents / 100).toString()}
            onChange={(e) => {
              const dollars = parseFloat(e.target.value);
              const cents = Number.isFinite(dollars)
                ? Math.round(dollars * 100)
                : defaultCents;
              setFormData((prev) => ({
                ...prev,
                depositAmountCents: Math.max(Math.round(defaultCents), cents),
              }));
            }}
            inputProps={{
              min: (defaultCents / 100).toString(),
              step: 1,
            }}
            helperText={`Minimum is the default ($${(defaultCents / 100).toFixed(2)}). You can pay more if you'd like to chip in.`}
            sx={{ maxWidth: 240, mb: 2 }}
          />
          <FormControl component="fieldset" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              What should we do with your deposit?
            </Typography>
            <RadioGroup
              name="depositDisposition"
              value={formData.depositDisposition || "refund"}
              onChange={handleChange}
            >
              <FormControlLabel
                value="refund"
                control={<Radio />}
                label="Refund it to me after I complete the hackathon."
              />
              <FormControlLabel
                value="donate"
                control={<Radio />}
                label="Donate it to Opportunity Hack."
              />
            </RadioGroup>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            You'll be redirected to Stripe to pay when you submit. Your
            application is saved and will pick up where you left off.
          </Typography>
        </>
      )}
    </Paper>
  );
};

const ReviewStep = ({ formData, setFormData, handleChange, eventData }) => {
  const depositCfg = eventData?.constraints?.hacker_deposit;
  const depositEnabled = !!depositCfg?.enabled;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
        Review & Submit
      </Typography>

      <TextField
        label="Any additional information or questions?"
        name="additionalInfo"
        multiline
        rows={4}
        fullWidth
        value={formData.additionalInfo || ""}
        onChange={handleChange}
        sx={{ mb: 4 }}
      />

      {depositEnabled && (
        <DepositSection
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          depositCfg={depositCfg}
        />
      )}

      <FormControlLabel
        control={
          <Checkbox
            name="codeOfConduct"
            checked={formData.codeOfConduct || false}
            onChange={handleChange}
            color="primary"
            required
          />
        }
        label={
          <Typography variant="body1">
            I agree to the{" "}
            <Link
              href="/hack/code-of-conduct"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code of Conduct
            </Link>
          </Typography>
        }
        sx={{ mb: 2 }}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          By submitting this form, you're applying to participate in
          Opportunity Hack. We'll send you next steps and event details over
          email.
        </Typography>
      </Alert>
    </Box>
  );
};

export default ReviewStep;
