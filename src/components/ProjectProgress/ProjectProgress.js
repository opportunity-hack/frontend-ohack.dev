import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import Tooltip from "@mui/material/Tooltip";
import { TagChip } from "./styles";

export default function ProjectProgress({ state }) {
  const stateMapping = {
    concept: [2, 0, 0, 0, 0],
    hackathon: [1, 2, 0, 0, 0],
    "post-hackathon": [1, 1, 2, 0, 0],
    production: [1, 1, 1, 2, 0],
    maintenance: [1, 1, 1, 1, 2],
  };

  const states = [
    "concept",
    "hack",
    "post-hack",
    "prod",
    "maint",
  ];

  const description = [
    "Concept: This idea has not yet had anyone work on it, we need your help to make this a reality.",
    "Hackathon: Project was worked on in at least one hackathon, top finisher also designated.",
    "Post-Hackathon: Coding continued after the hackathon. We don't have anything available for public in a production-ready system yet. Capstone projects: We work with university senior capstone (ASU, ASU Poly, UArizona, GCU) teams to advance our mission.  These teams have completed their capstone work.  ",
    "Production: Application is using Heroku (or similar) for ease of deployment, data import/export with CSV is supported.  This is the ultimate goal of any Opportunity Hack project.",
    "Maintenance: Post-production security patching, feature enhancements.",
  ];

  const progressToRender = () => {
    const statusList = stateMapping[state];

    return states.map((name, index) => {
      if (statusList[index] === 2) {
        return (
          <Tooltip
            enterTouchDelay={0}
            title={
              <span style={{ fontSize: "14px" }}>{description[index]}</span>
            }
            arrow
          >
            <TagChip
              key="mine"
              color="primary"
              label={name}
              icon={<CheckCircleOutlineOutlinedIcon />}
            />
          </Tooltip>
        );
      } else if (statusList[index] === 1) {
        return (
          <Tooltip
            enterTouchDelay={0}
            title={
              <span style={{ fontSize: "14px" }}>{description[index]}</span>
            }
            arrow
          >
            <TagChip
              key="mine"
              color="success"
              label={name}
              icon={<CheckCircleOutlineOutlinedIcon />}
            />
          </Tooltip>
        );
      } else {
        return (
          <Tooltip
            enterTouchDelay={0}
            title={
              <span style={{ fontSize: "14px" }}>{description[index]}</span>
            }
            arrow
          >
            <TagChip
              key="mine"
              color="default"
              label={name}
              icon={<PendingOutlinedIcon />}
            />
          </Tooltip>
        );
      }
    });
  };

  return <div>{progressToRender()}</div>;
}
