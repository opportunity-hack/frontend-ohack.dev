import React from "react";
import { Box, Tooltip, Chip } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { styled } from "@mui/system";

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const VolunteerDetails = ({ volunteer, type }) => {
  const details = (() => {
    switch (type) {
      case "mentors":
        return [
          { label: "Expertise", value: volunteer.expertise },
          { label: "Company", value: volunteer.company },
          { label: "Participation", value: volunteer.participationCount },
        ];
      case "judges":
        return [
          { label: "Company", value: volunteer.companyName },
          { label: "Title", value: volunteer.title },
          { label: "Background", value: volunteer.background },
        ];
      case "volunteers":
        return [
          { label: "Company", value: volunteer.company },
          { label: "Contributions", value: volunteer.artifacts?.length || 0 },
        ];
      default:
        return [];
    }
  })();

  return (
    <Box>
      {details.map(
        (detail) =>
          detail.value && (
            <Tooltip key={detail.label} title={detail.label}>
              <StyledChip
                label={`${detail.label}: ${detail.value}`}
                variant="outlined"
              />
            </Tooltip>
          )
      )}
      {volunteer.linkedinProfile && (
        <Tooltip title="LinkedIn Profile">
          <StyledChip
            icon={<LinkedInIcon />}
            label="LinkedIn"
            component="a"
            href={volunteer.linkedinProfile}
            target="_blank"
            rel="noopener noreferrer"
            clickable
          />
        </Tooltip>
      )}
      {type === "volunteers" &&
        volunteer.artifacts?.map((artifact, index) => (
          <Tooltip key={index} title={artifact.comment}>
            <StyledChip
              label={artifact.label}
              variant="outlined"
              component="a"
              href={artifact.url?.[0]}
              target="_blank"
              rel="noopener noreferrer"
              clickable
            />
          </Tooltip>
        ))}
    </Box>
  );
};

export default VolunteerDetails;
