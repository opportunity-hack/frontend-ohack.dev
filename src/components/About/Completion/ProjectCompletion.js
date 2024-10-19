import React, { useEffect } from "react";
import {
  TitleContainer,
  LayoutContainer,
  ProjectsContainer,
} from "../../../styles/nonprofit/styles";
import Head from "next/head";
import Image from "next/image";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Divider,
} from "@mui/material";
import LoginOrRegister from "../../LoginOrRegister/LoginOrRegister";
import Button from "@mui/material/Button";
import { InstagramEmbed } from "react-social-media-embed";
import TaskIcon from "@mui/icons-material/Task";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CodeIcon from "@mui/icons-material/Code";
import CloudIcon from "@mui/icons-material/Cloud";
import BuildIcon from "@mui/icons-material/Build";
import Link from "next/link";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";

const style = { fontSize: "15px" };

const trackOnClickButtonClickWithGoogleAndFacebook = (buttonName) => {
  trackEvent("click_project_completion_button", buttonName);
};

const ProjectCompletion = () => {
  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <LayoutContainer key="projectcompletion" container>
      <Head>
        <title>
          Definition of Done: Opportunity Hack Project Completion Checklist
        </title>
      </Head>

      <TitleContainer container>
        <Typography variant="h3" component="h1">
          Project Completion and Definition of Done
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" style={style} paragraph>
              In software engineering, the definition of done is a checklist of
              requirements that need to be met before a project can be
              considered finished. This page outlines the checklist for
              completing an Opportunity Hack project, ensuring both the
              development team and the nonprofit partner are aligned on
              expectations.
            </Typography>
            <Button
              onClick={() =>
                trackOnClickButtonClickWithGoogleAndFacebook(
                  "example_statement_of_work_prize"
                )
              }
              variant="contained"
              color="primary"
              href="https://www.instagram.com/p/CVicxFMPiqo/"
              target="_blank"
              sx={{ mb: 2 }}
            >
              Example statement of work prize
            </Button>

            <Box sx={{ my: 3 }}>
              <Image
                src="https://cdn.ohack.dev/ohack.dev/definition-of-done-65b90f271348b.webp"
                width={971 / 2}
                height={971 / 2}
                layout="responsive"
                alt="A happy dog completing an Opportunity Hack project for social good"
              />
              <Typography variant="caption" align="center" display="block">
                A happy dog completing an Opportunity Hack project for social
                good
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <InstagramEmbed
              url="https://www.instagram.com/p/CoBFS8hvcnB/"
              maxWidth={328}
              height={500}
            />
          </Grid>
        </Grid>
      </TitleContainer>

      <ProjectsContainer>
        <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Our Definition of Done
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <TaskIcon /> Deployed
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  Code must be deployed to a production environment (e.g., AWS,
                  fly.io, Google Cloud) so it can be used by others. It should
                  not remain only on local development machines.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <TaskIcon /> Nonprofit Signoff
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  The nonprofit partner must agree that the software meets
                  their requirements and is usable for their needs.
                  <Link
                    href="https://docs.google.com/document/d/1_B5uRZ7bOwYRfhK9SiSQ9uYUhaU9jmmhyO9LhDvFY1Q/edit#bookmark=id.c05tj14rfvg6"
                    target="_blank"
                  >
                    <Button
                      onClick={() =>
                        trackOnClickButtonClickWithGoogleAndFacebook(
                          "example_nonprofit_signoff"
                        )
                      }
                    >
                      View Example
                    </Button>
                  </Link>
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <TaskIcon /> Login Details for Testing
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  Provide any necessary login credentials for the deployed
                  application to facilitate testing.  These can be shared over Slack or email and should be able to be changed after the project is complete.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <TaskIcon /> Code Updated
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  Ensure all code is updated in the designated GitHub repository
                  for your hackathon project. This includes any documentation, README files, and code comments. Everything should be in a single repository for easy access.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <TaskIcon /> Tasks Closed
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  All GitHub tasks and issues should be closed or addressed if
                  you are using them for project management.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <TaskIcon /> Sensitive Information Security
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  Environment variables and sensitive configuration should not
                  be in GitHub. Share this information securely via a separate
                  document. This can be a Google Doc, a password manager, or another secure method.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <TaskIcon /> Documentation
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  Provide comprehensive documentation (video or written)
                  explaining how to use and maintain the application. This should include how to deploy the application, how to update the code, and how to change any configuration settings.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h4" gutterBottom sx={{ mt: 4, mb: 3 }}>
          Important Information for Project Teams and Nonprofits
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <CodeIcon /> Open-Source Solution
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  All code developed during Opportunity Hack is open-sourced
                  under the MIT license. This allows free use, modification, and
                  distribution, even for commercial purposes. 
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <CloudIcon /> Hosting Costs
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  Opportunity Hack covers initial hosting costs up to $15/month
                  and up to $250 to cover one-time costs. Nonprofits may need to
                  cover additional expenses as the project grows. 
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <BuildIcon /> Ongoing Support
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  We offer quarterly check-ins for maintenance and updates. For
                  urgent needs between these periods, we'll attempt to find
                  volunteers through our network.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 2, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="h3" gutterBottom>
                  <MonetizationOnIcon /> Profit Sharing
                </Typography>
                <Typography variant="body1" sx={{ fontSize: "1.25rem" }}>
                  If the solution generates profit, 50% will be shared with the
                  nonprofit organization. This encourages sustainability and
                  continued development. 
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4 }}>
          <InstagramEmbed
            url="https://www.instagram.com/p/CVicxFMPiqo/"
            maxWidth={328}
            height={500}
          />
        </Box>

        <LoginOrRegister
          introText="Ready to join us in creating impactful solutions?"
          previousPage={"/about/completion"}
        />
      </ProjectsContainer>
    </LayoutContainer>
  );
};

export default ProjectCompletion;
