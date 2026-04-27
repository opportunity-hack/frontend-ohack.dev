import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import NextLink from "next/link";
import { Box, Button, Container, Paper, Stack, Typography } from "@mui/material";

export default function EventUploadRedirect() {
  const router = useRouter();
  const { event_id } = router.query;

  useEffect(() => {
    if (!event_id) return;
    const timer = setTimeout(() => {
      router.replace(`/hack/${event_id}/media`);
    }, 1500);
    return () => clearTimeout(timer);
  }, [event_id, router]);

  return (
    <>
      <Head>
        <title>Upload moved | Opportunity Hack</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Container maxWidth="sm" sx={{ pt: { xs: 10, md: 14 }, pb: 6 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            This page has moved
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Event photo uploads now happen in the admin panel. Hackers and visitors can
            view event photos on the gallery page.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            {event_id && (
              <Button
                component={NextLink}
                href={`/hack/${event_id}/media`}
                variant="contained"
              >
                View event gallery
              </Button>
            )}
            <Button
              component={NextLink}
              href={event_id ? `/hack/${event_id}` : "/hack"}
              variant="outlined"
            >
              Back to event
            </Button>
            <Button
              component={NextLink}
              href="/admin/hackathons"
              variant="text"
            >
              Admin: manage hackathons
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
