import React from 'react';
import { Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import Image from 'next/image';
import { FaLinkedin } from 'react-icons/fa';

export const ActionButtons = ({ gaButton }) => (
  <Grid container spacing={2}>
    <Grid item>
      <Button 
        variant="contained" 
        onClick={() => gaButton('button_see_nonprofit_projects', 'see projects')} 
        style={{ fontSize: '15px' }} 
        color="primary" 
        href="/nonprofits"
      >
        See Nonprofit Projects
      </Button>
    </Grid>
    <Grid item>
      <Button 
        variant="contained" 
        onClick={() => gaButton('button_mentorship', 'Learn about mentorship')} 
        style={{ fontSize: '15px' }} 
        color="primary" 
        href="/about/mentors"
      >
        Learn about Mentorship
      </Button>
    </Grid>
    <Grid item>
      <Button 
        variant="contained" 
        onClick={() => gaButton('button_judging', 'Learn about judging')} 
        style={{ fontSize: '15px' }} 
        color="primary" 
        href="/about/judges"
      >
        Judging Information
      </Button>
    </Grid>
    <Grid item>
      <Button 
        variant="contained" 
        onClick={() => gaButton('button_sponsorship', 'Learn about sponsorship')} 
        style={{ fontSize: '15px' }} 
        color="primary" 
        href="/hack/2024_fall/sponsor"
      >
        Sponsor Opportunities
      </Button>
    </Grid>
    <Grid item>
      <Button 
        variant="contained" 
        onClick={() => gaButton('button_ohack_org', 'Visit ohack.org')} 
        style={{ fontSize: '15px' }} 
        color="primary" 
        href="https://www.ohack.org/about" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        More at ohack.org
      </Button>
    </Grid>
  </Grid>
);

export const FoundersSection = ({ cofounders }) => (
  <>
    <Typography variant="h3" gutterBottom>
      Co-Founders
    </Typography>
    <Grid container spacing={2}>
      {cofounders.map((member, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                {member[0]}
                <a href={member[1]} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin size={32} style={{ marginLeft: '10px', marginTop: '15px' }} />
                </a>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </>
);

export const BoardSection = ({ board_members }) => (
  <>
    <Typography variant="h3" mt={"50px"} gutterBottom>
      Board Members
    </Typography>
    <Grid container spacing={2}>
      {board_members.map((member, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                {member.split(',')[0]}
              </Typography>
              <Typography variant="h6" style={{ marginTop: 5 }} color="textSecondary" component="p">
                {member.split(',').slice(1).join(',')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </>
);

export const BootcampSection = () => (
  <>
    <Typography variant="h3" style={{ marginTop: 50 }} gutterBottom>
      Thinking about a coding bootcamp?
    </Typography>
    <Typography variant="h4">
      We have coding bootcamp and senior capstone projects for you!
    </Typography>
    <Box sx={{ position: 'relative', width: '100%', height: 'auto', margin: '20px 0' }}>
      <Image
        src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp"
        alt="Coding Bootcamp Projects"
        width={4032}
        height={3024}
        layout="responsive"
        priority={false}
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRsdHh4iJSAlICUiJygmKCgoJiknLS4tJyYoLSkuKTEwMTAxKDQ0Njk5Ozs5MTH/2wBDAR"
      />
    </Box>
    <Box my={2}>
      <Typography variant="body1" paragraph style={{ fontSize: '15px' }}>
        If you are part of a coding bootcamp and want to build your portfolio, you should consider writing code for charity with Opportunity Hack. Opportunity Hack is a social good hackathon that connects you with nonprofit organizations that need your tech skills and solutions. 
        By participating in Opportunity Hack, you will not only make a positive impact on the world, but also demonstrate your creativity, problem-solving, and collaboration abilities to prospective employers.
        Take a look at our nonprofit projects and join us in our mission to harness the power of code for social good.
      </Typography>
    </Box>
  </>
);

export const PledgeSection = ({ pledge }) => (
  <>
    <Typography variant="h3" style={{ marginTop: 50 }} gutterBottom>
      Our Community Pledge
    </Typography>
    {pledge.map((pledgeItem, i) => (
      <Box key={i} my={2}>
        <Typography variant="h4">
          {pledgeItem.split(':')[0]}
        </Typography>
        <Typography variant="body1" paragraph style={{ fontSize: '15px' }}>
          {pledgeItem.split(':')[1]}
        </Typography>
      </Box>
    ))}
    <Typography variant="body1" paragraph style={{ fontSize: '15px' }}>
      Together, we are Opportunity Hack. Together, we code for social good, for change.
    </Typography>
  </>
);

export const VideoSection = () => (
  <Box sx={{ position: 'relative', width: '100%', maxWidth: 560, margin: '20px auto' }}>
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
      <iframe
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        src="https://www.youtube.com/embed/Ia_xsX-318E"
        title="About Opportunity Hack"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </Box>
);
