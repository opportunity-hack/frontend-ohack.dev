import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as HackerIcon,
  School as MentorIcon,
  Gavel as JudgeIcon,
  Apartment as SponsorIcon,
  VolunteerActivism as NonprofitIcon,
  QuizOutlined as QuizIcon,
} from "@mui/icons-material";
import SectionContainer from "../SectionContainer";

const urlIsValid = (v) => !v || /^https?:\/\//.test(v);

const ToggleRow = ({ icon: Icon, title, subtitle, checked, onChange, children }) => (
  <Card variant="outlined" sx={{ borderColor: checked ? "primary.light" : "divider" }}>
    <CardContent>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Icon sx={{ color: checked ? "primary.main" : "text.disabled", mt: 0.5 }} />
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
              )}
            </Box>
            <Switch checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
          </Stack>
          {checked && children && <Box sx={{ mt: 2 }}>{children}</Box>}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const ExternalUrlField = ({ label, value, onChange }) => (
  <TextField
    label={label}
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    fullWidth
    size="small"
    helperText="Leave blank to use the built-in form. Must start with http:// or https://."
    error={!urlIsValid(value)}
  />
);

const ParticipantsSection = ({ admin }) => {
  const { hackathon, setConstraint, setDeposit, markSectionDirty, dirtySections, commitSection, discardSection, saveState } = admin;
  const constraints = hackathon.constraints || {};
  const deposit = constraints.hacker_deposit || { enabled: false, default_amount_cents: 500 };
  const questions = constraints.hacker_required_questions?.questions || [];

  const setQuestionsExplicit = (next) => {
    setConstraint("hacker_required_questions", { questions: next });
    markSectionDirty("screening", true);
  };
  const setDepositExplicit = (field, value) => {
    setDeposit(field, value);
    markSectionDirty("deposit", true);
  };

  const addQuestion = () =>
    setQuestionsExplicit([...questions, { question: "", required_answer: true, error: "" }]);
  const updateQuestion = (i, field, value) => {
    const next = questions.map((q, idx) => (idx === i ? { ...q, [field]: value } : q));
    setQuestionsExplicit(next);
  };
  const removeQuestion = (i) => setQuestionsExplicit(questions.filter((_, idx) => idx !== i));

  const screeningDirty = dirtySections.has("screening");
  const depositDirty = dirtySections.has("deposit");
  const saving = saveState.status === "saving";

  return (
    <Stack spacing={3}>
      <SectionContainer
        title="Applications"
        description="Toggle which application forms are open for this event. Each role can either use the built-in form or point to an external URL."
      >
        <Stack spacing={2}>
          <ToggleRow
            icon={HackerIcon}
            title="Hacker applications"
            subtitle="Hackathon participants apply at /hack/[event_id]/hacker-application."
            checked={!!constraints.application_hacker_enabled}
            onChange={(v) => setConstraint("application_hacker_enabled", v)}
          >
            <Stack spacing={2}>
              <ExternalUrlField
                label="External hacker application URL"
                value={constraints.application_hacker_external_url}
                onChange={(v) => setConstraint("application_hacker_external_url", v)}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={!!constraints.application_hacker_force_open}
                    onChange={(e) => setConstraint("application_hacker_force_open", e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Force applications open (override deadline)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bypasses the automatic "applications closed" cutoff (3 days before start)
                      and the "event ended" wall. Turn off after accepting late entries.
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </ToggleRow>

          <ToggleRow
            icon={MentorIcon}
            title="Mentor applications"
            subtitle="Tech mentors who'll help teams during the event."
            checked={!!constraints.application_mentor_enabled}
            onChange={(v) => setConstraint("application_mentor_enabled", v)}
          >
            <ExternalUrlField
              label="External mentor application URL"
              value={constraints.application_mentor_external_url}
              onChange={(v) => setConstraint("application_mentor_external_url", v)}
            />
          </ToggleRow>

          <ToggleRow
            icon={JudgeIcon}
            title="Judge applications"
            subtitle="People evaluating final submissions."
            checked={!!constraints.application_judge_enabled}
            onChange={(v) => setConstraint("application_judge_enabled", v)}
          >
            <Stack spacing={2}>
              <ExternalUrlField
                label="External judge application URL"
                value={constraints.application_judge_external_url}
                onChange={(v) => setConstraint("application_judge_external_url", v)}
              />
              <TextField
                label="Judge access code"
                size="small"
                value={constraints.application_judge_enabled_code || ""}
                onChange={(e) => setConstraint("application_judge_enabled_code", e.target.value)}
                helperText="Optional code that lets approved judges apply even when this toggle is off."
              />
            </Stack>
          </ToggleRow>

          <ToggleRow
            icon={NonprofitIcon}
            title="Nonprofit applications"
            subtitle="Nonprofits submit projects for hackers to work on."
            checked={!!constraints.application_nonprofit_enabled}
            onChange={(v) => setConstraint("application_nonprofit_enabled", v)}
          />

          <ToggleRow
            icon={SponsorIcon}
            title="Sponsor applications"
            subtitle="Companies that want to sponsor the event."
            checked={!!constraints.application_sponsor_enabled}
            onChange={(v) => setConstraint("application_sponsor_enabled", v)}
          />
        </Stack>
      </SectionContainer>

      <SectionContainer
        title="Teams"
        description="Team formation rules. Limits apply once enrollment opens."
      >
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Min people per team"
                type="number"
                fullWidth
                value={constraints.min_people_per_team ?? ""}
                onChange={(e) => setConstraint("min_people_per_team", parseInt(e.target.value, 10))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Max people per team"
                type="number"
                fullWidth
                value={constraints.max_people_per_team ?? ""}
                onChange={(e) => setConstraint("max_people_per_team", parseInt(e.target.value, 10))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Max teams per problem"
                type="number"
                fullWidth
                value={constraints.max_teams_per_problem ?? ""}
                onChange={(e) => setConstraint("max_teams_per_problem", parseInt(e.target.value, 10))}
              />
            </Grid>
          </Grid>
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!constraints.team_creation_enabled}
                  onChange={(e) => setConstraint("team_creation_enabled", e.target.checked)}
                />
              }
              label="Allow hackers to create teams"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!constraints.team_join_enabled}
                  onChange={(e) => setConstraint("team_join_enabled", e.target.checked)}
                />
              }
              label="Allow hackers to join teams"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!constraints.team_find_a_team_enabled}
                  onChange={(e) => setConstraint("team_find_a_team_enabled", e.target.checked)}
                />
              }
              label='Show the "Find a team" matchmaking page'
            />
          </Stack>
        </Stack>
      </SectionContainer>

      <SectionContainer
        title="Hacker deposit"
        description="Optional Stripe deposit required when applying. Hackers can later choose to donate it or request a refund."
        dirty={depositDirty}
        saving={saving}
        onSave={() => commitSection("deposit")}
        onDiscard={() => discardSection("deposit")}
      >
        <Stack spacing={2} sx={{ maxWidth: 480 }}>
          <FormControlLabel
            control={
              <Switch
                checked={!!deposit.enabled}
                onChange={(e) => setDepositExplicit("enabled", e.target.checked)}
              />
            }
            label={
              <Box>
                <Typography variant="body1">Require hacker deposit</Typography>
                <Typography variant="caption" color="text.secondary">
                  Adds a Stripe Checkout step to the hacker application.
                </Typography>
              </Box>
            }
          />
          {deposit.enabled && (
            <TextField
              label="Default deposit amount (USD)"
              type="number"
              size="small"
              value={(((deposit.default_amount_cents ?? 500) / 100)).toString()}
              onChange={(e) => {
                const dollars = parseFloat(e.target.value);
                const cents = Number.isFinite(dollars) ? Math.round(dollars * 100) : 500;
                setDepositExplicit("default_amount_cents", cents);
              }}
              inputProps={{ min: 1, max: 500, step: 1 }}
              helperText="Defaults to $5. Hackers can choose to pay more on the form."
              sx={{ maxWidth: 240 }}
            />
          )}
        </Stack>
      </SectionContainer>

      <SectionContainer
        title="Screening questions"
        description='Optional yes/no questions on the hacker application. Use these for event-specific gates (e.g., "Are you a member of ASU WiCS?").'
        dirty={screeningDirty}
        saving={saving}
        onSave={() => commitSection("screening")}
        onDiscard={() => discardSection("screening")}
      >
        <Stack spacing={2}>
          {questions.length === 0 && (
            <Alert severity="info" icon={<QuizIcon />}>
              No screening questions. Hackers proceed straight to the application.
            </Alert>
          )}
          {questions.map((q, i) => (
            <Card key={i} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">Question {i + 1}</Typography>
                  <IconButton size="small" color="error" onClick={() => removeQuestion(i)} aria-label="Remove question">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack spacing={2}>
                  <TextField
                    label="Question text"
                    fullWidth
                    value={q.question || ""}
                    onChange={(e) => updateQuestion(i, "question", e.target.value)}
                    placeholder="e.g., Are you a current member of ASU WiCS?"
                  />
                  <FormControl fullWidth>
                    <InputLabel id={`req-ans-${i}`}>Required answer</InputLabel>
                    <Select
                      labelId={`req-ans-${i}`}
                      label="Required answer"
                      value={q.required_answer === true || q.required_answer === "true" ? "yes" : "no"}
                      onChange={(e) => updateQuestion(i, "required_answer", e.target.value === "yes")}
                    >
                      <MenuItem value="yes">Yes (applicant must answer Yes)</MenuItem>
                      <MenuItem value="no">No (applicant must answer No)</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Error message shown for the wrong answer"
                    fullWidth
                    value={q.error || ""}
                    onChange={(e) => updateQuestion(i, "error", e.target.value)}
                    placeholder="e.g., This hackathon is only open to ASU WiCS members."
                  />
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Box>
            <Button startIcon={<AddIcon />} variant="outlined" onClick={addQuestion}>
              Add question
            </Button>
          </Box>
        </Stack>
      </SectionContainer>
    </Stack>
  );
};

export default ParticipantsSection;
