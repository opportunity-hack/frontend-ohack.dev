import {
  Box,
  Button,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import React, {useState} from 'react';

const opportunities = [
  'Source Projects',
  'Recruit',
  'Social Media',
  'NewsLetter',
  'Slack',
];
const details = {
  'Source Projects':
    'Your task is to source projects from nonprofits by reaching out to nonprofits, explaining OHack, funneling them into our nonprofit form, and getting them to join Slack. This involves identifying potential nonprofits to contact, crafting a message that explains OHack and its benefits to nonprofits, guiding interested nonprofits through the process of filling out the nonprofit form, and inviting them to join the OHack Slack channel to connect with other participants and receive updates and support. This is an important task as it will help to build a strong community of nonprofit organizations participating in OHack, which will in turn help to ensure the developers have a variety of projects to choose from',
  Recruit:
    'The task is to recruit sponsors to fund projects at OHack. This involves using SalesForce to reach out to potential sponsors on a regular basis, explaining the benefits of sponsoring OHack and how it can help them support the nonprofit community. The goal is to secure sponsors who are interested in either running their own hackathons with the support of OHack, or having OHack run the entire event for them. Volunteers who are skilled in marketing and sales may be particularly well-suited for this task, as it will involve creating compelling messaging and pitches to potential sponsors. This is an important task as securing sponsorships will help to provide the resources and funding necessary to run successful hackathons and support the nonprofit organizations participating in OHack.',
  'Social Media':
    "The task is to improve OHack's social media presence and engagement. This involves developing and implementing a social media strategy to increase OHack's online visibility and reach, creating engaging content that promotes the event and its impact, and helping to manage and grow OHack's social media channels. This may also involve working with the team to create and run social media marketing campaigns and ads to reach a wider audience. Volunteers who are skilled in content creation, marketing, and social media management may be particularly well-suited for this task. This is an important task as it will help to raise awareness of OHack and its mission, and encourage more people to get involved as participants, volunteers, and sponsors.",
  NewsLetter:
    "The task is to send newsletters to various Women in Tech and Out in Tech groups and clubs to promote OHack and build the event's brand. This involves identifying relevant groups and clubs to target, creating a list of these organizations, and actively engaging with them to build relationships and share information about OHack. This may involve creating and sending newsletters or other forms of communication to these groups, as well as participating in discussions and events to build connections and support. Volunteers who are skilled in marketing, communication, and community building may be particularly well-suited for this task. This is an important task as it will help to build a strong and diverse community of hackers and mentors for OHack, which will in turn help to ensure the success of the event.",
  Slack:
    'The task is to engage and support the OHack Slack community of over 1,000 users. This involves actively participating in discussions and conversations within the Slack channel, answering questions and providing support to community members, and helping to keep the community active and engaged. This may also involve working with the team to create and share relevant content and resources within Slack, and organizing and participating in events and activities to foster community engagement. Volunteers who are skilled in communication and community building may be particularly well-suited for this task. This is an important task as it will help to maintain a strong and active community of OHack participants, which will in turn help to ensure the success of the event.',
};

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  opportunity: '',
};
export default function Opportunities() {
  const [selected, setSelected] = useState(opportunities[0]);
  const [values, setValues] = useState(defaultValues);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const handleSnackbarClose = () => setSnackbarOpen(false);
  const handleSnackbarOpen = () => setSnackbarOpen(true);
  const handleErrorClose = () => setErrorOpen(false);
  const handleErrorOpen = () => setErrorOpen(true);

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  const handleInputChange = (event) => {
    const {name, value} = event.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    if (
      values.firstName === '' ||
      values.lastName === '' ||
      values.email === ''
    ) {
      handleErrorOpen();
      return;
    }
    console.log(values);
    handleSnackbarOpen();
    setValues(defaultValues);
  };

  return (
    <Box
      width="100%"
      height="100%"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Snackbar
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={3000}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{width: '100%'}}
        >
          <Typography variant="h6">
            Success! We will be in touch soon!
          </Typography>
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        open={errorOpen}
        onClose={handleErrorClose}
        autoHideDuration={3000}
      >
        <Alert onClose={handleErrorClose} severity="error" sx={{width: '100%'}}>
          <Typography variant="h6">
            Error! Please fill out all fields.
          </Typography>
        </Alert>
      </Snackbar>
      <Stack
        maxWidth="50%"
        direction="column"
        justifyContent="flex-start"
        alignItems="center"
        spacing={10}
        sx={{
          mt: 10,
        }}
      >
        <Typography variant="h1">More Opportunities</Typography>
        <Typography
          variant="h3"
          sx={{
            mb: 5,
          }}
        >
          Interested in Helping Out in a non-technical role? We've got you
          covered! Select one of the options below to learn more about the
          different volunteer opportunities!
        </Typography>
        <Select label="Opportunities" value={selected} onChange={handleChange}>
          {opportunities.map((opportunity) => (
            <MenuItem key={opportunity} value={opportunity}>
              {opportunity}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="h4">{details[selected]}</Typography>
        <Typography variant="h3">Interested? Sign up below!</Typography>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          maxWidth="800px"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            spacing: 5,
          }}
        >
          <Stack direction="column" spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <TextField
                required
                name="firstName"
                label="First Name"
                value={values.firstName}
                onChange={handleInputChange}
              />
              <TextField
                required
                name="lastName"
                label="Last Name"
                value={values.lastName}
                onChange={handleInputChange}
              />
            </Stack>
            <TextField
              required
              name="email"
              label="Email"
              fullWidth
              value={values.email}
              onChange={handleInputChange}
            />
            <TextField
              name="phone"
              label="Phone Number"
              fullWidth
              value={values.phone}
              onChange={handleInputChange}
            />
            <TextField
              name="opportunity"
              label="Task Name"
              fullWidth
              helperText="Choose one of the above tasks you are interested in."
              value={values.opportunity}
              onChange={handleInputChange}
            />
            <Button onClick={() => handleSubmit()}>Submit</Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
