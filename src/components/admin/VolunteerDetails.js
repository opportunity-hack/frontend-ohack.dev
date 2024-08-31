import React from "react";
import { Box, Tooltip, Chip } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { styled } from "@mui/system";

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const VolunteerDetails = ({ volunteer, type }) => {
  const details =
    type === "mentors"
      ? [
          { label: "Expertise", value: volunteer.expertise },
          { label: "Company", value: volunteer.company },
          { label: "Participation", value: volunteer.participationCount },
        ]
      : [
          { label: "Company", value: volunteer.companyName },
          { label: "Title", value: volunteer.title },
          { label: "Background", value: volunteer.background },
        ];

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
    </Box>
  );
};

export default VolunteerDetails;
