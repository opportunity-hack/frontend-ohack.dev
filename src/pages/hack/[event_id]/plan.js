import dynamic from "next/dynamic";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Container,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  EditNote,
  LockOutlined,
  OpenInNew,
  Visibility,
} from "@mui/icons-material";
import { usePlanningBoard } from "../../../hooks/use-planning-board";
import PlanningPublicNotice from "../../../components/Planning/PlanningPublicNotice";

const PlanningBoard = dynamic(
  () => import("../../../components/Planning/PlanningBoard"),
  { ssr: false }
);

const PlanningCardDialog = dynamic(
  () => import("../../../components/Planning/PlanningCardDialog"),
  { ssr: false }
);

export default function PlanPage({ eventData, initialBoard }) {
  const router = useRouter();
  const eventId = router.query.event_id;

  const {
    board,
    loading,
    error,
    canWrite,
    canComment,
    createList,
    createCard,
    updateCard,
    archiveCard,
    moveCard,
    createComment,
    deleteComment,
    createLabel,
    updateLabel,
    updateEditors,
    updateConfig,
    seedTemplate,
    slackNotify,
    refetch,
  } = usePlanningBoard(eventId);

  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedCardComments, setSelectedCardComments] = useState([]);

  const title = eventData?.title || eventId || "Hackathon";
  const planning = board?.planning || {};
  const enabled = planning.enabled;

  // Board not enabled yet
  if (!loading && board && !enabled) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Head>
          <title>{`${title} Planning | Opportunity Hack`}</title>
        </Head>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={NextLink} href="/hack" underline="hover">Events</Link>
          <Link component={NextLink} href={`/hack/${eventId}`} underline="hover">{title}</Link>
          <Typography color="text.primary">Planning</Typography>
        </Breadcrumbs>
        <Alert severity="info">
          Planning hasn&apos;t been opened for this event yet.
          {canWrite && (
            <Button size="small" sx={{ ml: 2 }} onClick={() => updateConfig({ enabled: true })}>
              Enable planning board
            </Button>
          )}
        </Alert>
      </Container>
    );
  }

  async function handleCardClick(card) {
    setSelectedCard(card);
    // Fetch comments for the card
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/planning/${eventId}/cards/${card.id}/comments`
      );
      const data = await res.json();
      setSelectedCardComments(data.comments || []);
    } catch {
      setSelectedCardComments([]);
    }
  }

  return (
    <>
      <Head>
        <title>{`${title} Planning Board | Opportunity Hack`}</title>
        <meta
          name="description"
          content={`Planning board for ${title} — track progress, sponsors, volunteers, and the run of show.`}
        />
      </Head>

      <Box
        sx={{
          // Trello-style focused workspace: fills the viewport so the board
          // scrolls horizontally as one unit without the page footer pulling
          // attention away. Calculated below the global NavBar (64px).
          position: "fixed",
          top: 64,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#1e88e5", // board background — Trello-style accent
        }}
      >
        {/* Board header bar */}
        <Box
          sx={{
            bgcolor: "primary.dark",
            color: "white",
            py: 1.75,
            px: 2.5,
            flexShrink: 0,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Button
              component={NextLink}
              href={`/hack/${eventId}`}
              startIcon={<ArrowBack />}
              size="small"
              sx={{ color: "white" }}
            >
              {title}
            </Button>

            <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
              Planning Board
            </Typography>

            <Tooltip title={canWrite ? "You can edit this board" : "Read-only view"}>
              <Chip
                icon={canWrite ? <EditNote /> : <Visibility />}
                label={canWrite ? "Editor" : "Viewer"}
                size="small"
                sx={{ color: "white", borderColor: "rgba(255,255,255,0.5)", border: "1px solid" }}
              />
            </Tooltip>

            {planning.slack?.channel && (
              <Button
                size="small"
                variant="outlined"
                sx={{ color: "white", borderColor: "rgba(255,255,255,0.5)" }}
                href={`https://opportunityhack.slack.com/channels/${planning.slack.channel}`}
                target="_blank"
                rel="noopener noreferrer"
                endIcon={<OpenInNew />}
              >
                Join Slack
              </Button>
            )}
          </Stack>
        </Box>

        {/* Public notice — compact strip above the board */}
        <Box sx={{ flexShrink: 0, px: 2, pt: 1 }}>
          <PlanningPublicNotice compact />
        </Box>

        {/* Board area — fills remaining height, scrolls horizontally as one unit */}
        <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 8 }}>
              <CircularProgress sx={{ color: "white" }} />
            </Box>
          )}

          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {!loading && !error && board && (
            <>
              {canWrite && !planning.template_seeded && (
                <Box sx={{ p: 2 }}>
                  <Alert
                    severity="info"
                    action={
                      <Button size="small" onClick={seedTemplate}>
                        Apply template
                      </Button>
                    }
                  >
                    Start with the OHack default template to get lists and cards pre-populated.
                  </Alert>
                </Box>
              )}

              <PlanningBoard
                board={board}
                canWrite={canWrite}
                onCardClick={handleCardClick}
                createCard={createCard}
                updateCard={updateCard}
                moveCard={moveCard}
                createList={createList}
              />
            </>
          )}
        </Box>
      </Box>

      {selectedCard && (
        <PlanningCardDialog
          card={selectedCard}
          comments={selectedCardComments}
          labels={board?.labels || []}
          canWrite={canWrite}
          canComment={canComment}
          eventId={eventId}
          onClose={() => setSelectedCard(null)}
          onUpdate={(updates) => updateCard(selectedCard.id, updates, selectedCard.updated_at)}
          onArchive={() => {
            archiveCard(selectedCard.id);
            setSelectedCard(null);
          }}
          onCreateComment={(body) => createComment(selectedCard.id, body)}
          onDeleteComment={deleteComment}
          onCreateLabel={createLabel}
        />
      )}
    </>
  );
}

export async function getStaticProps({ params }) {
  const API = process.env.NEXT_PUBLIC_API_SERVER_URL;
  try {
    const [eventRes, boardRes] = await Promise.all([
      fetch(`${API}/api/messages/hackathon/${params.event_id}`),
      fetch(`${API}/api/planning/${params.event_id}`),
    ]);
    const eventData = eventRes.ok ? await eventRes.json() : null;
    const initialBoard = boardRes.ok ? await boardRes.json() : null;
    return {
      props: { eventData, initialBoard },
      revalidate: 60,
    };
  } catch {
    return { props: { eventData: null, initialBoard: null }, revalidate: 60 };
  }
}

export async function getStaticPaths() {
  const API = process.env.NEXT_PUBLIC_API_SERVER_URL;
  try {
    const res = await fetch(`${API}/api/messages/hackathon/all`);
    const hackathons = await res.json();
    const paths = hackathons.map((event) => ({
      params: { event_id: event.event_id || event.id || "unknown" },
    }));
    return { paths, fallback: "blocking" };
  } catch {
    return { paths: [], fallback: "blocking" };
  }
}
