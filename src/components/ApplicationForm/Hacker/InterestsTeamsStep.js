import React from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Link,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  PRIMARY_ROLE_OPTIONS,
  SOCIAL_CAUSES_OPTIONS,
  TEAM_SIZE_OPTIONS,
  WORKSHOP_OPTIONS,
} from "./hackerFormConfig";

// Auto-save helper — the cause handlers fire it after every mutation so that
// reordering or removing a cause survives a refresh. The `useFormPersistence`
// hook also debounces internally, so this wrapper just kicks the existing
// debounce timer.
const scheduleSave = (saveToLocalStorage) => {
  setTimeout(() => {
    saveToLocalStorage();
  }, 500);
};

const CauseRankingList = ({ formData, setFormData, saveToLocalStorage }) => {
  const handleAddCause = (cause) => {
    if (formData.socialCauses.includes(cause)) return;
    if (cause === "Other") {
      const customCause = window.prompt(
        "Please specify your other social cause interest:",
      );
      if (customCause && customCause.trim()) {
        setFormData((prev) => ({
          ...prev,
          socialCauses: [...prev.socialCauses, cause],
          otherSocialCause: customCause.trim(),
        }));
      } else {
        return;
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        socialCauses: [...prev.socialCauses, cause],
      }));
    }
    scheduleSave(saveToLocalStorage);
  };

  const handleRemoveCause = (index) => {
    setFormData((prev) => {
      const newCauses = [...prev.socialCauses];
      const removedCause = newCauses[index];
      newCauses.splice(index, 1);
      if (removedCause === "Other") {
        return { ...prev, socialCauses: newCauses, otherSocialCause: "" };
      }
      return { ...prev, socialCauses: newCauses };
    });
    scheduleSave(saveToLocalStorage);
  };

  const handleEditOtherCause = () => {
    const currentValue = formData.otherSocialCause || "";
    const newValue = window.prompt(
      "Edit your other social cause:",
      currentValue,
    );
    if (newValue !== null) {
      setFormData((prev) => ({
        ...prev,
        otherSocialCause: newValue.trim(),
      }));
      scheduleSave(saveToLocalStorage);
    }
  };

  const handleMoveCause = (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.socialCauses.length - 1)
    ) {
      return;
    }
    const newIndex = direction === "up" ? index - 1 : index + 1;
    setFormData((prev) => {
      const newCauses = [...prev.socialCauses];
      const temp = newCauses[index];
      newCauses[index] = newCauses[newIndex];
      newCauses[newIndex] = temp;
      return { ...prev, socialCauses: newCauses };
    });
    scheduleSave(saveToLocalStorage);
  };

  return (
    <>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="social-causes-label">Add Social Causes</InputLabel>
        <Select
          labelId="social-causes-label"
          id="social-causes"
          value=""
          onChange={(e) => {
            if (e.target.value) handleAddCause(e.target.value);
          }}
          input={<OutlinedInput label="Add Social Causes" />}
        >
          {SOCIAL_CAUSES_OPTIONS.filter(
            (option) => !formData.socialCauses.includes(option),
          ).map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          {formData.socialCauses.length === 0
            ? "Please select at least one social cause you're interested in"
            : "Add as many causes as you like. You can rank them below after adding."}
        </FormHelperText>
      </FormControl>

      {formData.socialCauses.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 1 }}>
            Your ranked causes (most important first):
          </Typography>

          <Paper variant="outlined" sx={{ p: 2 }}>
            {formData.socialCauses.map((cause, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: index === formData.socialCauses.length - 1 ? 0 : 2,
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor:
                      index === 0
                        ? "primary.main"
                        : index === 1
                          ? "primary.light"
                          : index === 2
                            ? "info.light"
                            : "grey.200",
                    color: index < 3 ? "white" : "text.primary",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    width: 50,
                    fontSize: "1.1rem",
                  }}
                >
                  #{index + 1}
                </Box>

                <Box sx={{ flex: 1, px: 2, py: 1.5, fontSize: "1rem" }}>
                  {cause === "Other" ? (
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography sx={{ mr: 1 }}>Other:</Typography>
                      <Typography fontWeight="medium" color="primary.main">
                        {formData.otherSocialCause || "(not specified)"}
                      </Typography>
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOtherCause();
                        }}
                        sx={{ ml: 1, minWidth: 0, p: 0.5 }}
                      >
                        Edit
                      </Button>
                    </Box>
                  ) : (
                    cause
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    mr: 0.5,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <Button
                    variant={index === 0 ? "text" : "contained"}
                    color="primary"
                    disabled={index === 0}
                    onClick={() => handleMoveCause(index, "up")}
                    sx={{
                      minWidth: { xs: 40, sm: 48 },
                      height: { xs: 28, sm: 40 },
                      p: 0.5,
                      m: 0.5,
                      fontSize: "1.2rem",
                    }}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    variant={
                      index === formData.socialCauses.length - 1
                        ? "text"
                        : "contained"
                    }
                    color="primary"
                    disabled={index === formData.socialCauses.length - 1}
                    onClick={() => handleMoveCause(index, "down")}
                    sx={{
                      minWidth: { xs: 40, sm: 48 },
                      height: { xs: 28, sm: 40 },
                      p: 0.5,
                      m: 0.5,
                      fontSize: "1.2rem",
                    }}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveCause(index)}
                    sx={{
                      minWidth: { xs: 40, sm: 48 },
                      height: { xs: 28, sm: 40 },
                      p: 0.5,
                      m: 0.5,
                    }}
                    aria-label="Remove"
                  >
                    ✕
                  </Button>
                </Box>
              </Box>
            ))}

            {formData.socialCauses.length === 0 && (
              <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                No causes selected yet. Please add at least one cause from the
                dropdown above.
              </Box>
            )}
          </Paper>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, fontStyle: "italic" }}
          >
            The order matters! Your top priority should be #1.
          </Typography>
        </Box>
      )}
    </>
  );
};

const TeamMatchingPreferences = ({ formData, handleTeamMatchingChange }) => (
  <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 3 }}>
    <Typography variant="subtitle1" gutterBottom>
      Team Matching Preferences
    </Typography>

    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Our team-matching process has successfully connected hundreds of hackers
      into effective teams over the years. Your preferences below will help us
      create balanced teams where members complement each other's skills and
      share common interests in social causes.
    </Typography>

    <FormControl fullWidth required sx={{ mb: 3 }}>
      <InputLabel id="preferred-size-label">Preferred Team Size</InputLabel>
      <Select
        labelId="preferred-size-label"
        id="preferred-size"
        value={formData.teamMatchingPreferences?.preferredSize || ""}
        onChange={(e) =>
          handleTeamMatchingChange("preferredSize", e.target.value)
        }
        label="Preferred Team Size"
      >
        {TEAM_SIZE_OPTIONS.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>
        This helps us match you with the right sized team
      </FormHelperText>
    </FormControl>

    <FormControl fullWidth required sx={{ mb: 3 }}>
      <InputLabel id="preferred-skills-label">
        Skills You'd Like in Teammates
      </InputLabel>
      <Select
        labelId="preferred-skills-label"
        id="preferred-skills"
        multiple
        value={formData.teamMatchingPreferences?.preferredSkills || []}
        onChange={(e) =>
          handleTeamMatchingChange("preferredSkills", e.target.value)
        }
        input={<OutlinedInput label="Skills You'd Like in Teammates" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((value) => (
              <Chip key={value} label={value} />
            ))}
          </Box>
        )}
      >
        {PRIMARY_ROLE_OPTIONS.filter((option) => option !== "Other").map(
          (option) => (
            <MenuItem key={option} value={option}>
              <Checkbox
                checked={
                  (
                    formData.teamMatchingPreferences?.preferredSkills || []
                  ).indexOf(option) > -1
                }
              />
              <ListItemText primary={option} />
            </MenuItem>
          ),
        )}
      </Select>
      <FormHelperText>
        Select skills that would complement your own. These are especially
        helpful for team matching.
      </FormHelperText>
    </FormControl>

    <Alert severity="info" sx={{ mb: 1 }}>
      <Typography variant="body2">
        <strong>Tip:</strong> Being specific about your team preferences
        increases your chances of finding compatible teammates!
      </Typography>
    </Alert>
  </Box>
);

const TeamBrowser = ({
  formData,
  setFormData,
  handleChange,
  eventTeams,
  teamsLoading,
  teamSearch,
  setTeamSearch,
}) => (
  <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2, mb: 3 }}>
    <Typography variant="subtitle1" gutterBottom>
      Find your team
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      These are the team codes other registered hackers have already entered for
      this event. Pick yours from the list to join them. If you're the first on
      your team, type a new team code below and share it with your teammates so
      they can pick it here.
    </Typography>
    <TextField
      label="Search team codes"
      fullWidth
      size="small"
      value={teamSearch}
      onChange={(e) => setTeamSearch(e.target.value)}
      placeholder="Filter by team code…"
      sx={{ mb: 2 }}
      disabled={teamsLoading}
    />
    {teamsLoading && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Loading team codes…
      </Typography>
    )}
    {!teamsLoading && eventTeams.length === 0 && (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          No team codes have been registered for this event yet — you'll be
          among the first. Type your team code below and share it with your
          teammates.
        </Typography>
      </Alert>
    )}
    {!teamsLoading && eventTeams.length > 0 && (
      <Box
        sx={{
          maxHeight: 240,
          overflowY: "auto",
          border: "1px solid #f0f0f0",
          borderRadius: 1,
          mb: 2,
        }}
      >
        {eventTeams
          .filter((t) =>
            teamSearch
              ? (t.code || "")
                  .toLowerCase()
                  .includes(teamSearch.toLowerCase())
              : true,
          )
          .map((t) => {
            const selected =
              (formData.teamCode || "").trim().toLowerCase() ===
              (t.code || "").trim().toLowerCase();
            const count = t.count || 0;
            return (
              <Box
                key={t.code}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    teamCode: t.code || "",
                  }))
                }
                sx={{
                  p: 1.5,
                  cursor: "pointer",
                  borderBottom: "1px solid #f5f5f5",
                  bgcolor: selected ? "action.selected" : "inherit",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {t.code}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {count} hacker{count === 1 ? "" : "s"} registered
                </Typography>
              </Box>
            );
          })}
      </Box>
    )}
    <TextField
      label="Team Code"
      name="teamCode"
      required
      fullWidth
      value={formData.teamCode || ""}
      onChange={handleChange}
      helperText="Pick a code above to join an existing team, or type a new code and share it with your teammates so they enter the exact same one."
    />
  </Box>
);

const InterestsTeamsStep = ({
  formData,
  setFormData,
  handleChange,
  handleTeamMatchingChange,
  customHandleMultiSelectChange,
  saveToLocalStorage,
  eventTeams,
  teamsLoading,
  teamSearch,
  setTeamSearch,
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
      Interests & Team Formation
    </Typography>

    <Alert severity="info" sx={{ mb: 3 }}>
      <Typography variant="body2">
        At Opportunity Hack, we believe in the power of diverse, well-matched
        teams. The information you provide below helps us connect hackers with
        complementary skills and shared interests in social causes. Our
        team-matching algorithm uses this data to create balanced teams that
        can effectively address nonprofit challenges.
      </Typography>
    </Alert>

    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Social Causes You're Interested In{" "}
        <Box component="span" color="error.main">
          *
        </Box>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select and rank social causes by priority. Your top choices will be
        given more weight in team matching.
      </Typography>

      <CauseRankingList
        formData={formData}
        setFormData={setFormData}
        saveToLocalStorage={saveToLocalStorage}
      />

      <TextField
        label="Previous Social Impact Experience (Optional)"
        name="socialImpactExperience"
        multiline
        rows={3}
        fullWidth
        value={formData.socialImpactExperience || ""}
        onChange={handleChange}
        helperText="Share any previous experience with social impact projects or nonprofits"
        sx={{ mb: 3 }}
      />

      <TextField
        label="What motivates you to participate in Opportunity Hack?"
        name="motivation"
        multiline
        rows={3}
        fullWidth
        value={formData.motivation || ""}
        onChange={handleChange}
        helperText="What impact do you hope to create?"
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth required sx={{ mb: 3 }}>
        <InputLabel id="team-status-label">Team Status</InputLabel>
        <Select
          labelId="team-status-label"
          id="team-status"
          name="teamStatus"
          value={formData.teamStatus || ""}
          onChange={handleChange}
          label="Team Status"
        >
          <MenuItem value="I have a team">
            I have a complete team of 2-5 people
          </MenuItem>
          <MenuItem value="I'm looking for team members">
            I have a team and we'd like to add more people
          </MenuItem>
          <MenuItem value="I'd like to be matched with a team">
            I don't have a team and I'd like to be matched with people to form
            a team
          </MenuItem>
          <MenuItem value="I would like to work alone">
            I would like to work alone and I'm okay with not obtaining
            experience with working with others
          </MenuItem>
        </Select>
        <FormHelperText>
          Let us know your team situation - we'll help connect you with
          teammates before or during the event
        </FormHelperText>
      </FormControl>

      {formData.teamStatus === "I have a team" && (
        <TeamBrowser
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          eventTeams={eventTeams}
          teamsLoading={teamsLoading}
          teamSearch={teamSearch}
          setTeamSearch={setTeamSearch}
        />
      )}

      {formData.teamStatus === "I would like to work alone" && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            Solo hackers usually don't finish.
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            In our experience most hackers who start solo drop out by the end
            of day one — building, testing, demoing, and presenting alone in
            36 hours is genuinely hard. Joining a team makes finishing far
            more likely, and you'll learn more along the way. We strongly
            recommend picking "I don't have a team" instead so we can match
            you with people.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                name="soloAcknowledged"
                checked={!!formData.soloAcknowledged}
                onChange={handleChange}
                color="primary"
                required
              />
            }
            label={
              <Typography variant="body1">
                I understand the risks and still want to work alone.
              </Typography>
            }
            sx={{ alignItems: "flex-start", mt: 1 }}
          />
        </Alert>
      )}

      {(formData.teamStatus === "I'm looking for team members" ||
        formData.teamStatus === "I'd like to be matched with a team") && (
        <TeamMatchingPreferences
          formData={formData}
          handleTeamMatchingChange={handleTeamMatchingChange}
        />
      )}

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="workshop-interests-label">
          Workshop Interests (Optional)
        </InputLabel>
        <Select
          labelId="workshop-interests-label"
          id="workshop-interests"
          multiple
          value={formData.workshopInterests || []}
          onChange={(e) =>
            customHandleMultiSelectChange(e, "workshopInterests")
          }
          input={<OutlinedInput label="Workshop Interests (Optional)" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {WORKSHOP_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              <Checkbox
                checked={
                  (formData.workshopInterests || []).indexOf(option) > -1
                }
              />
              <ListItemText primary={option} />
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>
          We use this to plan workshop topics. Select anything that sounds
          useful — pick "Other" if you have something specific in mind.
        </FormHelperText>
      </FormControl>

      {(formData.workshopInterests || []).includes("Other") && (
        <TextField
          label="Tell us what other workshop you'd like"
          name="workshopInterestsOther"
          fullWidth
          value={formData.workshopInterestsOther || ""}
          onChange={handleChange}
          helperText="What topic, format, or speaker would help you?"
          sx={{ mb: 3 }}
        />
      )}

      <Alert severity="info" icon={false} sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Continuing after the hackathon
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Finishing a project means taking your prototype the rest of the way
          to production for the nonprofit — usually about three months of
          part-time follow-through after the event. It's how nonprofits
          actually get a working tool (most can't take a hackathon prototype
          to production on their own), and it's how teams earn the highest
          tier of recognition.
        </Typography>
        <Typography variant="body2">
          See our{" "}
          <Link
            href="/about/completion"
            target="_blank"
            rel="noopener noreferrer"
          >
            Definition of Done
          </Link>{" "}
          for what "complete" looks like, and the{" "}
          <Link
            href="/about/hearts"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hearts system
          </Link>{" "}
          for how productionalized projects are rewarded.
        </Typography>
      </Alert>
      <FormControlLabel
        control={
          <Checkbox
            name="willContinue"
            checked={formData.willContinue || false}
            onChange={handleChange}
            color="primary"
          />
        }
        label="I'm interested in continuing project development after the hackathon"
        sx={{ mb: 2, display: "block" }}
      />
    </Box>
  </Box>
);

export default InterestsTeamsStep;
