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

export const HelpDialog = ({ open, onClose, onCancel, onHelp }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      onCancel={onCancel}
      aria-labelledby="help-dialog-title"
      aria-describedby="help-dialog-description"
    >
      <DialogTitle id="help-dialog-title" style={{fontSize: '15px'}}>
        Thank you for helping a nonprofit with your talent!
      </DialogTitle>
      <DialogContent>
        <DialogContentText component={"span"} style={{fontSize: '15px'}} id="help-dialog-description">
          There are several ways to contibute, if you want, when you want.
          <Typography variant="h4">Hacker</Typography>
          You'll be <b>creating</b> something that benefits nonprofits. Most of what
          you do will take place on:
          <ul>
            <li>
              <b>Slack</b> - communication with your team, nonprofits, mentors
            </li>
            <li>
              <b>DevPost</b> - for hackathons this is where you formally submit your projects
            </li>
            <li>
              <b>GitHub</b> - your code must be publically available and well
              documented so that others can use it, all code is open source for the public good
            </li>
            <li>
              <b><Link href="https://heroku.com" target="_blank">Heroku<OpenInNewIcon/></Link> | <Link href="https://fly.io" target="_blank">Fly<OpenInNewIcon/></Link> | <Link href="https://aws.amazon.com/" target="_blank">AWS<OpenInNewIcon/></Link></b> - 
              when you productionalize your code, use something like this to make it available to the masses
            </li>
          </ul>
          <Typography variant="h4">
            Mentor &nbsp;
            <Link
            href="https://www.ohack.org/about/mentors"
            rel="noreferrer"
            target="_blank"
          >
            <Button variant="outlined">More details on mentoring</Button>
          </Link>
          
          </Typography>
          
          
          
          You'll be <b>assisting</b> hackers with their project. Most of what you do
          will take place on:
          <ul>
            <li>
              Slack/In-person - checking in on teams, troubleshooting, giving them guidance, and jumping into a screenshare here
              and there
            </li>            
          </ul>
          As a mentor, your goals are:
          <ul>
            <li>Make sure the team knows the problem they are solving</li>
            <li>...are solving that problem 👆</li>
            <li>
              Are using libraries and are not trying to reinvent the wheel
            </li>
            <li>Are looking at the judging criteria (on DevPost)</li>
            <li>
              Ensure teams have a demo video that describes the problem
              and solution using tools like <Link href="https://www.loom.com/">Loom<OpenInNewIcon/></Link> or <Link href="https://support.apple.com/guide/quicktime-player/record-your-screen-qtp97b08e666/">Quicktime Screen recording<OpenInNewIcon/></Link>.
            </li>
          </ul>          
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          className="button button--compact button--third"
          onClick={() => onHelp('hacker')}
          autoFocus
        >
          Help as Hacker
        </Button>
        <Button
          className="button button--compact button--third"
          onClick={() => onHelp('mentor')}
        >
          Help as Mentor
        </Button>
        <Button          
          className="error"
          onClick={onCancel}
        >
          Cancel
        </Button>
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
    >
      <DialogTitle id="unhelp-dialog-title">
        Helping has completed!
      </DialogTitle>
      <DialogContent>
        <DialogContentText component={"span"} id="unhelp-dialog-description">
          <h4>What this means</h4>
          You are recording the fact that you're no longer helping this
          nonprofit
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          className="button button--compact button--secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          className="button button--compact button--red"
          onClick={onClose}
          autoFocus
        >
          Withdraw Help
        </Button>
      </DialogActions>
    </Dialog>
  );
};
