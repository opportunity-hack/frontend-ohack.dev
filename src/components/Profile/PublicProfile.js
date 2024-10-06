import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import FeedbackIcon from "@mui/icons-material/Feedback";
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";

const PublicProfile = () => {
  const router = useRouter();
  const { userid } = router.query;
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userid) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/${userid}`
          );
          if (response.ok) {
            const data = await response.json();
            setUserInfo(data);
          } else {
            console.error("Failed to fetch user info");
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserInfo();
  }, [userid]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div className="content-layout">
      <Head>
        <title>
          Profile for {userInfo?.name || userid} - Opportunity Hack Developer
          Portal
        </title>
      </Head>
      <Box sx={{ position: "relative", mt: 5}}>
        <Typography variant="h4" component="h1" gutterBottom>
          Public Profile
        </Typography>
        <Chip
          label="Under Construction"
          color="warning"
          sx={{ position: "absolute", top: 0, right: 0 }}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Image
          src="https://media.giphy.com/media/3o7btQ0NH6Kl8CxCfK/giphy.gif"
          alt="Under Construction"
          width={200}
          height={200}
        />
      </Box>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              src={userInfo?.profile_image}
              alt={userInfo?.name}
              sx={{ width: 100, height: 100, mr: 2 }}
            />
            <Box>
              <Typography variant="h5" component="h2">
                {userInfo?.name || "Anonymous User"}
                <VerifiedUserIcon
                  color="success"
                  fontSize="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                {userInfo?.nickname || "No nickname set"}
              </Typography>
              {userInfo?.github && (
                <Typography variant="body2">
                  GitHub:{" "}
                  <Link
                    href={`https://github.com/${userInfo.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {userInfo.github}
                  </Link>
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              <EmojiEventsIcon sx={{ mr: 1 }} />
              Achievements
            </Typography>
            <Typography variant="body1">
              This user's achievements will be displayed here once implemented.
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FeedbackIcon />}
              component={Link}
              href={`/feedback/${userid}`}
            >
              Send Feedback to {userInfo?.name || "User"}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Box sx={{ mt: 4 }}>
        <HelpUsBuildOHack
          github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/8"
          github_name="Issue #8"
        />
      </Box>
    </div>
  );
};

export default PublicProfile;
