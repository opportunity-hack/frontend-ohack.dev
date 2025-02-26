import React from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Link from "next/link";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from '@mui/material/CircularProgress';

const TeamCreationDialog = ({ 
  open, 
  onClose,
  onConfirm, 
  teamSuggestions,
  sendingTeamDetails,
  teamCreationErrorDetails,
  onUpdateTeamName,
  onUpdateSlackChannel,
  onUpdateGithubUsername,
  newTeamName,
  newTeamSlackChannel
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="team-create-dialog-title"
      aria-describedby="team-create-dialog-description"
    >
      <DialogTitle id="team-create-dialog-title">Create a new team</DialogTitle>
      <DialogContent>
        <b>Team Name Suggestion:</b> {teamSuggestions}

        <DialogContentText component={"span"} id="team-create-dialog-description">
          <Stack spacing={2}>
            <TextField
              id="team-name"
              label={<span style={{ fontSize: "15px" }}>Team Name (at least 3 letters)</span>}
              helperText={<span style={{ color:"black", fontSize: "14px" }}>A unique team name - we will create a GitHub repo for you</span>}
              onChange={onUpdateTeamName}
              margin="dense"
              FormHelperTextProps={{ style: { fontSize: 12 } }}
              variant="filled"
            />

            <TextField
              id="slack-name"
              label={<span style={{ fontSize: "15px" }}>Slack Channel (at least 3 letters)</span>}
              helperText={<span style={{ color:"black", fontSize: "14px" }}>Create this public channel first <Link href="https://slack.com/help/articles/201402297-Create-a-channel" target="_blank"><Button variant="text" size="small" >How?</Button></Link></span>}
              onChange={onUpdateSlackChannel}
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">#</InputAdornment>
                ),
              }}
              FormHelperTextProps={{ style: { fontSize: 12 } }}
              variant="filled"
            />

            <TextField
              id="github-name"
              label={<span style={{ fontSize: "15px" }}>Github Username</span>}
              helperText={<span style={{ color:"black", fontSize: "14px" }}>Enter your Github username (we will make you an admin)</span>}
              onChange={onUpdateGithubUsername}
              margin="dense"
              FormHelperTextProps={{ style: { fontSize: 12 } }}
              variant="filled"
            />

          </Stack>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Stack container>
          <Stack spacing={2} direction="row">
            <Button
              className="button button--compact button--secondary"
              onClick={onClose}
            >
              Cancel
            </Button>
            { ((newTeamName !== "" && newTeamName.length > 2) && (newTeamSlackChannel !== "" && newTeamSlackChannel.length > 2)) && 
              <Button        
                className="button button--compact button--third"
                disabled={sendingTeamDetails}
                onClick={onConfirm}                              
              >
                Submit
                {" "}
                {sendingTeamDetails && 
                  <CircularProgress size={20} />
                }
                <Typography variant="body1">Takes ~14 seconds :(</Typography>
              </Button>
            }
          </Stack>
          <Stack spacing={0} direction="row" alignContent={"right"} alignItems={"right"} justifyContent={"right"}>
            <Typography>
              {teamCreationErrorDetails}
            </Typography>      
          </Stack>                
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default TeamCreationDialog;
