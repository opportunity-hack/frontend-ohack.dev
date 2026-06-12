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
import { alpha } from "@mui/material/styles";
import {
  ArrowBack as ArrowBackIcon,
  Article as ArticleIcon,
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
  { ssr: false },
);

const PLATFORM_META = {
  linkedin: {
    label: "LinkedIn",
    cardTitle: "LinkedIn post",
    emptyDescription: "View this LinkedIn post about the event.",
    buttonLabel: "Open post",
    icon: LinkedInIcon,
    color: "#0a66c2",
  },
  instagram: {
    label: "Instagram",
    cardTitle: "Instagram post",
    emptyDescription: "View this Instagram post about the event.",
    buttonLabel: "Open post",
    icon: InstagramIcon,
    color: "#e4405f",
  },
  threads: {
    label: "Threads",
    cardTitle: "Threads post",
    emptyDescription: "View this Threads post about the event.",
    buttonLabel: "Open post",
    icon: ThreadsIcon,
    color: "#000000",
  },
  article: {
    label: "News article",
    cardTitle: "News article",
    emptyDescription: "Read this news article about the event.",
    buttonLabel: "Read article",
    icon: ArticleIcon,
    color: "#7a4d21",
  },
};

const SocialPostCard = ({ post }) => {
  const meta = PLATFORM_META[post.platform] || PLATFORM_META.linkedin;
  const Icon = meta.icon;
  return (
    <Card
      variant="outlined"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardActionArea
        component="a"
        href={post.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
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
            {meta.cardTitle}
          </Typography>
        </Box>
        <CardContent sx={{ flex: 1 }}>
          {post.caption ? (
            <Typography variant="body2" sx={{ mb: 1 }}>
              {post.caption}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {meta.emptyDescription}
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
          {meta.buttonLabel}
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
    const list = Array.isArray(eventData?.event_photos)
      ? eventData.event_photos
      : [];
    return list.filter((p) => p && typeof p.url === "string" && p.url);
  }, [eventData]);

  const socialPosts = useMemo(() => {
    const list = Array.isArray(eventData?.social_posts)
      ? eventData.social_posts
      : [];
    return list.filter(
      (p) =>
        p && PLATFORM_META[p.platform] && typeof p.url === "string" && p.url,
    );
  }, [eventData]);

  const instagramPosts = socialPosts.filter((p) => p.platform === "instagram");
  const otherSocialPosts = socialPosts.filter(
    (p) => p.platform !== "instagram",
  );
  const activePhoto = photos[carouselIndex] || photos[0] || null;
  const activePhotoNumber =
    photos.length > 0 ? Math.min(carouselIndex + 1, photos.length) : 0;
  const activePhotoCaption = activePhoto?.caption?.trim() || "";
  const activePhotoCredit = activePhoto?.credit?.trim() || "";

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
        <Typography variant="h4" align="center">
          Event not found
        </Typography>
      </Container>
    );
  }

  const eventTitle = eventData.title || `Event ${event_id}`;
  const pageUrl = `https://www.ohack.dev/hack/${event_id}/media`;
  const description = `Photos and social media coverage from ${eventTitle}, an Opportunity Hack event.`;

  const ogImage =
    photos[0]?.url ||
    eventData.image_url ||
    "https://cdn.ohack.dev/ohack.dev/2023_hackathon_2.webp";

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
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.ohack.dev/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Hackathons",
          item: "https://www.ohack.dev/hack",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: eventTitle,
          item: `https://www.ohack.dev/hack/${event_id}`,
        },
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
        <meta
          property="og:title"
          content={`${eventTitle} – Photos & Social Media`}
        />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${eventTitle} – Photos & Social Media`}
        />
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
              <Chip
                label={`${socialPosts.length} social/news link${socialPosts.length === 1 ? "" : "s"}`}
                size="small"
              />
            )}
          </Stack>
        </Stack>

        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" color="text.secondary">
            Event recap
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            {eventTitle}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Photos and social media coverage from this hackathon.
          </Typography>
        </Box>

        {!hasContent && (
          <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
            <PhotoLibraryIcon
              sx={{ fontSize: 56, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="h6" gutterBottom>
              No photos yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Check back after the event for photos and highlights.
            </Typography>
            <Button
              component={NextLink}
              href={`/hack/${event_id}`}
              variant="contained"
            >
              Back to event
            </Button>
          </Paper>
        )}

        {photos.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Photo gallery
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1, md: 2 },
                backgroundColor: "#05070a",
                color: "#fff",
                borderColor: alpha("#fff", 0.12),
                overflow: "hidden",
                "& .carousel .slide": {
                  backgroundColor: "transparent",
                },
                "& .carousel.carousel-slider .control-arrow": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  top: "50%",
                  width: { xs: 40, md: 48 },
                  height: { xs: 40, md: 48 },
                  marginTop: 0,
                  transform: "translateY(-50%)",
                  borderRadius: "999px",
                  backgroundColor: alpha("#000", 0.42),
                  backdropFilter: "blur(6px)",
                  opacity: 1,
                  transition:
                    "background-color 160ms ease, transform 160ms ease",
                  zIndex: 2,
                },
                "& .carousel.carousel-slider .control-arrow:hover": {
                  backgroundColor: alpha("#000", 0.62),
                },
                "& .carousel.carousel-slider .control-prev.control-arrow": {
                  left: { xs: 8, md: 16 },
                },
                "& .carousel.carousel-slider .control-next.control-arrow": {
                  right: { xs: 8, md: 16 },
                },
                "& .carousel .slider-wrapper": {
                  borderRadius: 1,
                  pb: photos.length > 1 ? 5 : 0,
                },
                "& .carousel .control-dots": {
                  display: photos.length > 1 ? "block" : "none",
                  bottom: 16,
                  margin: 0,
                },
                "& .carousel .control-dots .dot": {
                  width: 10,
                  height: 10,
                  margin: "0 6px",
                  boxShadow: "none",
                  backgroundColor: alpha("#fff", 0.45),
                },
                "& .carousel .control-dots .dot.selected, & .carousel .control-dots .dot:hover":
                  {
                    backgroundColor: "#fff",
                  },
              }}
            >
              <Carousel
                showArrows
                showIndicators={photos.length > 1}
                showThumbs={false}
                showStatus={false}
                infiniteLoop
                useKeyboardArrows
                selectedItem={carouselIndex}
                onChange={(idx) => setCarouselIndex(idx)}
                dynamicHeight={false}
              >
                {photos.map((photo, idx) => (
                  <Box
                    key={`${photo.url}-${idx}`}
                    sx={{ backgroundColor: "#000" }}
                  >
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

              {photos.length > 1 && (
                <Box
                  sx={{
                    display: { xs: "none", md: "block" },
                    px: { md: 0.5 },
                    pt: 2,
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      display: "block",
                      mb: 1,
                      color: alpha("#fff", 0.68),
                      letterSpacing: "0.08em",
                    }}
                  >
                    Browse photos
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      overflowX: "auto",
                      pb: 1,
                      pr: 0.5,
                      scrollbarWidth: "thin",
                      scrollSnapType: "x proximity",
                    }}
                  >
                    {photos.map((photo, idx) => {
                      const isActive = idx === carouselIndex;

                      return (
                        <Box
                          key={`${photo.url}-thumb-${idx}`}
                          component="button"
                          type="button"
                          onClick={() => setCarouselIndex(idx)}
                          aria-label={`View photo ${idx + 1}`}
                          aria-current={isActive ? "true" : undefined}
                          sx={{
                            flex: "0 0 auto",
                            width: 112,
                            border: `1px solid ${isActive ? alpha("#fff", 0.88) : alpha("#fff", 0.18)}`,
                            borderRadius: 1.5,
                            p: 0,
                            overflow: "hidden",
                            backgroundColor: alpha(
                              "#fff",
                              isActive ? 0.08 : 0.03,
                            ),
                            boxShadow: isActive
                              ? `0 0 0 1px ${alpha("#fff", 0.26)}`
                              : "none",
                            cursor: "pointer",
                            scrollSnapAlign: "start",
                            transition:
                              "border-color 160ms ease, background-color 160ms ease, transform 160ms ease",
                            "&:hover": {
                              borderColor: alpha("#fff", 0.52),
                              backgroundColor: alpha("#fff", 0.06),
                              transform: "translateY(-1px)",
                            },
                            "&:focus-visible": {
                              outline: `2px solid ${alpha("#fff", 0.92)}`,
                              outlineOffset: 2,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              aspectRatio: "16 / 10",
                              backgroundColor: "#000",
                            }}
                          >
                            <img
                              src={photo.url}
                              alt={
                                photo.caption ||
                                `${eventTitle} thumbnail ${idx + 1}`
                              }
                              loading="lazy"
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Box sx={{ px: { xs: 1, md: 0.5 }, pt: 2 }}>
                <Box
                  aria-live="polite"
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 2,
                    border: `1px solid ${alpha("#fff", 0.12)}`,
                    background:
                      "linear-gradient(180deg, rgba(20,24,32,0.86) 0%, rgba(8,10,15,0.98) 100%)",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", md: "center" }}
                    justifyContent="space-between"
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          display: "block",
                          mb: 0.5,
                          color: alpha("#fff", 0.72),
                          letterSpacing: "0.08em",
                        }}
                      >
                        Photo {activePhotoNumber} of {photos.length}
                      </Typography>
                      <Typography
                        variant={activePhotoCaption ? "h6" : "body1"}
                        component="p"
                        sx={{
                          fontSize: activePhotoCaption
                            ? { xs: "1rem", sm: "1.125rem" }
                            : undefined,
                          fontWeight: activePhotoCaption ? 600 : 500,
                          lineHeight: 1.45,
                          color: alpha("#fff", activePhotoCaption ? 1 : 0.88),
                          overflowWrap: "anywhere",
                        }}
                      >
                        {activePhotoCaption ||
                          `Event gallery image from ${eventTitle}`}
                      </Typography>
                    </Box>
                    {activePhoto?.url && (
                      <Button
                        component="a"
                        href={activePhoto.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        endIcon={<OpenInNewIcon fontSize="small" />}
                        sx={{
                          flexShrink: 0,
                          color: "#fff",
                          borderColor: alpha("#fff", 0.28),
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#fff",
                            backgroundColor: alpha("#fff", 0.08),
                          },
                        }}
                      >
                        Open full photo
                      </Button>
                    )}
                  </Stack>

                  {activePhotoCredit && (
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      sx={{
                        mt: 1.75,
                        pt: 1.5,
                        borderTop: `1px solid ${alpha("#fff", 0.1)}`,
                      }}
                    >
                      <Typography
                        variant="overline"
                        sx={{
                          color: alpha("#fff", 0.7),
                          letterSpacing: "0.08em",
                          lineHeight: 1.2,
                        }}
                      >
                        Photo credit
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: alpha("#fff", 0.94),
                          fontWeight: 500,
                          lineHeight: 1.5,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {activePhotoCredit}
                      </Typography>
                    </Stack>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        )}

        {socialPosts.length > 0 && (
          <Box>
            <Divider sx={{ mb: 3 }} />
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              On social media and in the news
            </Typography>

            {otherSocialPosts.length > 0 && (
              <Grid
                container
                spacing={2}
                sx={{ mb: instagramPosts.length > 0 ? 4 : 0 }}
              >
                {otherSocialPosts.map((post, idx) => (
                  <Grid
                    size={{ xs: 12, sm: 6, md: 4 }}
                    key={`${post.url}-${idx}`}
                  >
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
                            sx={{
                              display: "block",
                              textAlign: "center",
                              mt: 1,
                            }}
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
          <Link
            component={NextLink}
            href={`/hack/${event_id}`}
            underline="hover"
          >
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
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${params.event_id}`,
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
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/all`,
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
