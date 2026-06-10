import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  AlternateEmail as ThreadsIcon,
  OpenInNew as OpenInNewIcon,
  PhotoLibrary as PhotoLibraryIcon,
} from "@mui/icons-material";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";

const InstagramEmbed = dynamic(
  () => import("react-social-media-embed").then((m) => m.InstagramEmbed),
  { ssr: false }
);

const PLATFORM_META = {
  linkedin: {
    label: "LinkedIn",
    icon: LinkedInIcon,
    color: "#0a66c2",
  },
  instagram: {
    label: "Instagram",
    icon: InstagramIcon,
    color: "#e4405f",
  },
  threads: {
    label: "Threads",
    icon: ThreadsIcon,
    color: "#000000",
  },
};

const SocialPostCard = ({ post }) => {
  const meta = PLATFORM_META[post.platform] || PLATFORM_META.linkedin;
  const Icon = meta.icon;
  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea
        component="a"
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        <Box
          sx={{
            backgroundColor: meta.color,
            color: "#fff",
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Icon />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {meta.label} post
          </Typography>
        </Box>
        <CardContent sx={{ flex: 1 }}>
          {post.caption ? (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {post.caption}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              View this {meta.label} post about the event.
            </Typography>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ wordBreak: "break-all", display: "block" }}
          >
            {post.url}
          </Typography>
        </CardContent>
      </CardActionArea>
      <Box sx={{ p: 1.5, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          endIcon={<OpenInNewIcon />}
          component="a"
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open post
        </Button>
      </Box>
    </Card>
  );
};

const MediaPage = ({ eventData }) => {
  const router = useRouter();
  const { event_id } = router.query;
  const [carouselIndex, setCarouselIndex] = useState(0);

  const photos = useMemo(() => {
    const list = Array.isArray(eventData?.event_photos) ? eventData.event_photos : [];
    return list.filter((p) => p && typeof p.url === "string" && p.url);
  }, [eventData]);

  const socialPosts = useMemo(() => {
    const list = Array.isArray(eventData?.social_posts) ? eventData.social_posts : [];
    return list.filter(
      (p) => p && PLATFORM_META[p.platform] && typeof p.url === "string" && p.url
    );
  }, [eventData]);

  const instagramPosts = socialPosts.filter((p) => p.platform === "instagram");
  const otherSocialPosts = socialPosts.filter((p) => p.platform !== "instagram");
  const activePhoto = photos[carouselIndex] || photos[0] || null;

  if (router.isFallback) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography>Loading event…</Typography>
      </Container>
    );
  }

  if (!eventData) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" align="center">Event not found</Typography>
      </Container>
    );
  }

  const eventTitle = eventData.title || `Event ${event_id}`;
  const pageUrl = `https://ohack.dev/hack/${event_id}/media`;
  const description = `Photos and social media coverage from ${eventTitle}, an Opportunity Hack event.`;

  const ogImage =
    photos[0]?.url || eventData.image_url || "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp";

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `${eventTitle} – Media & Social`,
      url: pageUrl,
      description,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://ohack.dev/" },
        { "@type": "ListItem", position: 2, name: "Hackathons", item: "https://ohack.dev/hack" },
        { "@type": "ListItem", position: 3, name: eventTitle, item: `https://ohack.dev/hack/${event_id}` },
        { "@type": "ListItem", position: 4, name: "Media", item: pageUrl },
      ],
    },
  ];

  if (photos.length > 0) {
    structuredData.push({
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      name: `${eventTitle} – Photo Gallery`,
      url: pageUrl,
      image: photos.map((p) => p.url),
    });
  }

  const hasContent = photos.length > 0 || socialPosts.length > 0;

  return (
    <>
      <Head>
        <title>{`${eventTitle} – Photos & Social Media | Opportunity Hack`}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${eventTitle} – Photos & Social Media`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${eventTitle} – Photos & Social Media`} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        {structuredData.map((sd, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(sd) }}
          />
        ))}
      </Head>

      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 12 }, pb: 6 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            component={NextLink}
            href={`/hack/${event_id}`}
            sx={{ textTransform: "none" }}
          >
            Back to event
          </Button>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {photos.length > 0 && (
              <Chip
                icon={<PhotoLibraryIcon />}
                label={`${photos.length} photo${photos.length === 1 ? "" : "s"}`}
                size="small"
              />
            )}
            {socialPosts.length > 0 && (
              <Chip label={`${socialPosts.length} social post${socialPosts.length === 1 ? "" : "s"}`} size="small" />
            )}
          </Stack>
        </Stack>

        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" color="text.secondary">
            Event recap
          </Typography>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
            {eventTitle}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Photos and social media coverage from this hackathon.
          </Typography>
        </Box>

        {!hasContent && (
          <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
            <PhotoLibraryIcon sx={{ fontSize: 56, color: "text.secondary", mb: 1 }} />
            <Typography variant="h6" gutterBottom>
              No photos yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Check back after the event for photos and highlights.
            </Typography>
            <Button component={NextLink} href={`/hack/${event_id}`} variant="contained">
              Back to event
            </Button>
          </Paper>
        )}

        {photos.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
              Photo gallery
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1, md: 2 },
                backgroundColor: "#000",
                "& .carousel .slide": {
                  backgroundColor: "transparent",
                },
                "& .carousel .slider-wrapper": {
                  borderRadius: 1,
                  pb: photos.length > 1 ? 5 : 0,
                },
                "& .carousel .control-dots": {
                  bottom: photos.length > 1 ? 16 : 0,
                  margin: 0,
                },
                "& .carousel .thumbs-wrapper": {
                  margin: photos.length > 1 ? "12px 0 0" : 0,
                },
              }}
            >
              <Carousel
                showArrows
                showIndicators={photos.length > 1}
                showThumbs={photos.length > 1}
                showStatus={false}
                infiniteLoop
                useKeyboardArrows
                selectedItem={carouselIndex}
                onChange={(idx) => setCarouselIndex(idx)}
                dynamicHeight={false}
              >
                {photos.map((photo, idx) => (
                  <Box key={`${photo.url}-${idx}`} sx={{ backgroundColor: "#000" }}>
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16 / 9",
                        backgroundColor: "#000",
                      }}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || `${eventTitle} photo ${idx + 1}`}
                        loading={idx === 0 ? "eager" : "lazy"}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Carousel>
              {(activePhoto?.caption || activePhoto?.credit) && (
                <Box sx={{ px: { xs: 1, md: 0.5 }, pt: 2, color: "#fff", textAlign: "center" }}>
                  {activePhoto.caption && (
                    <Typography variant="body2">{activePhoto.caption}</Typography>
                  )}
                  {activePhoto.credit && (
                    <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.5 }}>
                      Photo: {activePhoto.credit}
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {socialPosts.length > 0 && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
              On social media
            </Typography>

            {otherSocialPosts.length > 0 && (
              <Grid container spacing={2} sx={{ mb: instagramPosts.length > 0 ? 4 : 0 }}>
                {otherSocialPosts.map((post, idx) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${post.url}-${idx}`}>
                    <SocialPostCard post={post} />
                  </Grid>
                ))}
              </Grid>
            )}

            {instagramPosts.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Instagram
                </Typography>
                <Grid container spacing={2}>
                  {instagramPosts.map((post, idx) => (
                    <Grid
                      size={{ xs: 12, sm: 6, md: 4 }}
                      key={`${post.url}-${idx}`}
                      sx={{ display: "flex", justifyContent: "center" }}
                    >
                      <Box sx={{ width: "100%", maxWidth: 360 }}>
                        <InstagramEmbed url={post.url} width="100%" />
                        {post.caption && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", textAlign: "center", mt: 1 }}
                          >
                            {post.caption}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ mt: 6, textAlign: "center" }}>
          <Link component={NextLink} href={`/hack/${event_id}`} underline="hover">
            ← Back to {eventTitle}
          </Link>
        </Box>
      </Container>
    </>
  );
};

export async function getStaticProps({ params }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`
    );
    const data = await res.json();
    return {
      props: { eventData: data || null },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching hackathon data:", error);
    return {
      props: { eventData: null },
      revalidate: 60,
    };
  }
}

export async function getStaticPaths() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/all`
    );
    const hackathons = await res.json();
    const paths = hackathons.map((event) => ({
      params: {
        event_id: event.event_id || event.id || event._id || "unknown-event",
      },
    }));
    return { paths, fallback: true };
  } catch (error) {
    console.error("Error fetching hackathon paths:", error);
    return { paths: [], fallback: true };
  }
}

export default MediaPage;
