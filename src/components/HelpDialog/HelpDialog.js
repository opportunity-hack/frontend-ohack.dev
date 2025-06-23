import React from 'react';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

export const HelpDialog = ({ open, onClose, onCancel, onHelp }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onCancel={onCancel}
      aria-labelledby="help-dialog-title"
      aria-describedby="help-dialog-description"
      maxWidth="md"
    >
      <DialogTitle id="help-dialog-title" sx={{ fontSize: '1.2rem', fontWeight: 'bold', pb: 1 }}>
        Thank you for helping a nonprofit with your talent!
      </DialogTitle>
      <DialogContent>
        <DialogContentText component={"div"} sx={{ fontSize: '15px' }} id="help-dialog-description">
          <Typography paragraph>
            There are several ways to contribute to nonprofit projects. Choose the role that best fits your skills:
          </Typography>
          
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Hacker Role</Typography>
            <Typography paragraph>
              You'll be <b>creating</b> solutions that directly benefit nonprofits using these platforms:
            </Typography>
            <ul>
              <li>
                <b>Slack</b> - Team communication with nonprofits and mentors
              </li>
              <li>
                <b>DevPost</b> - Submit your projects for hackathons
              </li>
              <li>
                <b>GitHub</b> - All code must be public, well-documented, and open source
              </li>
              <li>
                <b>Hosting Services: </b>
                <Link href="https://heroku.com" target="_blank" style={{ marginRight: 8 }}>
                  Heroku <OpenInNewIcon fontSize="small" />
                </Link>
                |
                <Link href="https://fly.io" target="_blank" style={{ margin: '0 8px' }}>
                  Fly <OpenInNewIcon fontSize="small" />
                </Link>
                |
                <Link href="https://aws.amazon.com/" target="_blank" style={{ marginLeft: 8 }}>
                  AWS <OpenInNewIcon fontSize="small" />
                </Link>
              </li>
            </ul>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
              Mentor Role
              <Link
                href="https://www.ohack.org/about/mentors"
                rel="noreferrer"
                target="_blank"
                style={{ marginLeft: 16 }}
              >
                <Button variant="outlined" size="small">More details</Button>
              </Link>
            </Typography>
            
            <Typography paragraph>
              You'll be <b>guiding</b> hackers to successful project completion by:
            </Typography>
            <ul>
              <li>Ensuring teams understand and focus on the problem statement</li>
              <li>Helping teams leverage existing libraries rather than reinventing solutions</li>
              <li>Guiding teams to meet judging criteria on DevPost</li>
              <li>
                Supporting teams with demo creation using tools like{' '}
                <Link href="https://www.loom.com/" target="_blank">
                  Loom <OpenInNewIcon fontSize="small" />
                </Link>
                {' '}or{' '}
                <Link href="https://support.apple.com/guide/quicktime-player/record-your-screen-qtp97b08e666/" target="_blank">
                  Quicktime <OpenInNewIcon fontSize="small" />
                </Link>
              </li>
            </ul>
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          color="error"
          onClick={onCancel}
          sx={{ mr: 'auto' }}
        >
          Cancel
        </Button>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onHelp('hacker')}
            sx={{ mr: 1 }}
          >
            Join as Hacker
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => onHelp('mentor')}
          >
            Join as Mentor
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export const UnhelpDialog = ({ open, onClose, onCancel }) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="unhelp-dialog-title"
      aria-describedby="unhelp-dialog-description"
      maxWidth="sm"
    >
      <DialogTitle id="unhelp-dialog-title" sx={{ fontWeight: 'bold' }}>
        Ready to step away?
      </DialogTitle>
      <DialogContent>
        <DialogContentText component={"div"} id="unhelp-dialog-description">
          <Typography paragraph>
            We understand that circumstances change. By withdrawing your help:
          </Typography>
          <ul>
            <li>Your commitment to this nonprofit project will be marked as completed</li>
            <li>The nonprofit will be notified</li>
            <li>You can always return to help with future projects</li>
          </ul>
          <Typography paragraph sx={{ mt: 2, fontStyle: 'italic' }}>
            Thank you for your contributions so far!
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ mr: 1 }}
        >
          Continue Helping
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
        >
          Confirm Withdrawal
        </Button>
      </DialogActions>
    </Dialog>
  );
};
