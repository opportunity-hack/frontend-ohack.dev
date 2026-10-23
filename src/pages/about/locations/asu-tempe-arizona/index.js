import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { Snackbar, SnackbarContent } from "@mui/material";
import {
  LocationOnRounded,
  LocalParkingRounded,
  FlightRounded,
  ShareRounded,
  PhoneRounded,
  NavigationRounded,
  AccessTimeRounded,
  InfoRounded,
  TrainRounded,
  RestaurantRounded,
  LocalGasStationRounded,
} from "@mui/icons-material";
import { serializeJsonLd } from "../../../../lib/jsonLd";
import {
  RefinedRoot,
  Eyebrow,
  Stat,
  Arrow,
} from "../../../../components/design/refined";
import { CtaBand } from "../../../../components/design/RefinedPage";

const LOCATIONS = {
  "engineering-center-g-wing": {
    name: "Engineering Center G-Wing",
    address: "501 E Tyler Mall, Tempe, AZ 85281",
    description: "Main event venue - ECG Building, Room 101",
    coordinates: { lat: 33.4255, lng: -111.94 },
    features: [
      "WiFi",
      "Power outlets",
      "Air conditioning",
      "Accessible entrance",
    ],
    googleMapsUrl: "https://maps.app.goo.gl/z9hD7YoFxfFFLstC8",
    gallery: [
      {
        src: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp",
        caption:
          "Hackers collaborating in ASU ECG 101 Generator lab during an Opportunity Hack event",
        alt: "Hackathon participants working together in ECG 101 Generator lab",
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_1.webp",
        caption:
          "Exterior view of the Engineering Center G-Wing - our main event building",
        alt: "ASU Engineering Center G-Wing exterior view",
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_2.webp",
        caption:
          "Inside the G-Wing Generator Lab - spacious collaborative workspace for hackathon teams",
        alt: "Interior of G-Wing Generator Lab workspace",
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_3.webp",
        caption:
          "Volunteers and participants working together in the Generator Lab during a hackathon event",
        alt: "Volunteers collaborating in the Generator Lab",
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_4.webp",
        caption:
          "Workshop room across the courtyard - additional meeting space for breakout sessions",
        alt: "Workshop room across the courtyard from G-Wing",
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_5.webp",
        caption:
          "Food and refreshment station in the main Generator Lab - keeping hackers energized!",
        alt: "Food table setup in the G-Wing Generator Lab",
      },
    ],
    video: "https://www.youtube.com/embed/a521Ch2N52c",
    tourUrl: null,
  },
  "hayden-library": {
    name: "Hayden Library",
    address: "300 E Orange St., Tempe, AZ 85281",
    description:
      "Hayden Library - a recently renovated ($90M) historic ASU landmark with collaborative study spaces, Makerspace, and nearly double the original student space",
    coordinates: { lat: 33.4242, lng: -111.9428 },
    features: [
      "WiFi",
      "Power outlets",
      "Air conditioning",
      "Accessible entrance",
      "Study rooms",
      "Makerspace",
    ],
    googleMapsUrl: "https://share.google/1aouzYHBuPe5OgnsQ",
    gallery: [
      {
        src: "https://tours.asu.edu/sites/g/files/litvpz1481/files/tours/tempe-hayden-hero.jpg",
        caption:
          "Exterior view of Hayden Library - a historic ASU landmark named after Charles Trumbull Hayden, founder of Tempe",
        alt: "Hayden Library exterior at ASU Tempe campus",
      },
      {
        src: "https://tours.asu.edu/sites/g/files/litvpz1481/files/interior/tempe-hayden-interior-3.jpg",
        caption:
          "Renovated interior of Hayden Library with modern collaborative study spaces",
        alt: "Hayden Library interior collaborative study area",
      },
      {
        src: "https://tours.asu.edu/sites/g/files/litvpz1481/files/interior/tempe-hayden-interior-5.jpg",
        caption: "Open study areas inside the renovated Hayden Library",
        alt: "Hayden Library open study spaces",
      },
      {
        src: "https://tours.asu.edu/sites/g/files/litvpz1481/files/interior/tempe-hayden-interior-2.jpg",
        caption:
          "Hayden Library interior spaces - modernized with enhanced facilities for students and visitors",
        alt: "Hayden Library modernized interior",
      },
    ],
    video: null,
    tourUrl: "https://tours.asu.edu/tempe/hayden-library",
  },
};

const DEFAULT_LOCATION = "engineering-center-g-wing";

const PARKING_OPTIONS = [
  {
    name: "Tyler Street Parking Structure",
    address: "Tyler Street, Tempe, AZ 85281",
    distance: "2-minute walk",
    cost: "Paid parking",
    description: "Closest parking structure to the venue",
    recommendation: "Best option for attendees",
    googleMapsUrl: "https://goo.gl/maps/wfJY28ULsgAVkY2q9", // Option 1 from PDF
  },
  {
    name: "Apache Blvd. Parking Structure",
    address: "Apache Boulevard, Tempe, AZ 85281",
    distance: "5-minute walk",
    cost: "Paid parking",
    description: "Large parking structure with good availability",
    googleMapsUrl: "https://goo.gl/maps/f61DFDHySp1SY1xV7", // Option 2 from PDF
  },
  {
    name: "Rural Road Parking Structure",
    address: "Rural Road, Tempe, AZ 85281",
    distance: "8-minute walk",
    cost: "Paid parking",
    description: "Additional option if other structures are full",
    googleMapsUrl: "https://goo.gl/maps/tcSmFFudoGu8dhh96", // Option 3 from PDF
  },
  {
    name: "ASU Maintenance Parking Lot",
    address: "Next to G-Wing, Tempe, AZ 85281",
    distance: "1-minute walk",
    cost: "Drop-off only",
    description: "Perfect for drop-off - closest to G-Wing entrance",
    recommendation: "Best for drop-off/pick-up",
    googleMapsUrl: "https://maps.app.goo.gl/75rWK8fZw6aNXWWr6", // Drop-off from PDF
  },
  {
    name: "Visitor Parking - South Apache",
    address: "South Side of Apache Blvd, Tempe, AZ 85281",
    distance: "10-minute walk",
    cost: "Paid parking",
    description: "Visitor designated parking area",
    googleMapsUrl: "https://maps.app.goo.gl/9DYqL6srCg1bpLfq8", // Option 4 from PDF
  },
  {
    name: "Visitor Parking 27",
    address: "Visitor Parking 27, Tempe, AZ 85281",
    distance: "12-minute walk",
    cost: "1-hour parking only",
    description: "Limited time visitor parking option",
    googleMapsUrl: "https://goo.gl/maps/x2qiHZD27oZVtsFs5", // Option 5 from PDF
  },
];

const HOTELS = [
  {
    name: "Graduate by Hilton Tempe",
    priceRange: "$143+/night",
    address: "225 E Apache Blvd, Tempe, AZ 85281",
    distance: "0.5 miles from venue",
    phone: "(480) 967-9431",
    features: ["Free WiFi", "Fitness center", "Restaurant", "Business center"],
    description:
      "Modern hotel with university-themed design, walking distance to ASU campus",
    googleMapsUrl: "https://maps.app.goo.gl/9w9tPW37CLwnYs4k9",
  },
  {
    name: "The Westin Tempe",
    priceRange: "$182+/night",
    address: "1333 S Rural Rd, Tempe, AZ 85281",
    distance: "1.2 miles from venue",
    phone: "(480) 929-3300",
    features: ["Luxury amenities", "Pool", "Spa", "Multiple dining options"],
    description: "Upscale hotel with premium amenities and services",
    googleMapsUrl: "https://maps.app.goo.gl/6wAEA8MD9qDm6Krt9",
  },
  {
    name: "Tempe Mission Palms - Destination by Hyatt",
    priceRange: "$197+/night",
    address: "60 E 5th St, Tempe, AZ 85281",
    distance: "1.8 miles from venue",
    phone: "(480) 894-1400",
    features: [
      "Resort-style pool",
      "Tennis court",
      "Restaurants",
      "Spa services",
    ],
    description: "Resort-style hotel in downtown Tempe with full amenities",
    googleMapsUrl: "https://maps.app.goo.gl/ZhGyWFChEe78fM4E6",
  },
  {
    name: "Residence Inn Tempe Downtown/University",
    priceRange: "$296+/night",
    address: "510 S Forest Ave, Tempe, AZ 85281",
    distance: "1.5 miles from venue",
    phone: "(480) 967-2188",
    features: [
      "Extended stay suites",
      "Kitchen facilities",
      "Free breakfast",
      "Pet-friendly",
    ],
    description: "Suite-style accommodations perfect for longer stays",
    googleMapsUrl: "https://maps.app.goo.gl/bWeaSzVX1PgmnXcd7",
  },
];

const TRANSPORTATION_OPTIONS = [
  {
    title: "Sky Harbor Airport (PHX)",
    distance: "10-minute drive",
    icon: <FlightRounded />,
    options: [
      "Rental car - Multiple agencies available",
      "Rideshare (Uber/Lyft) - $20-30 typical cost",
      "Phoenix Sky Train + Light Rail - Connect to ASU",
      "Hotel shuttle service - Check with your hotel",
    ],
  },
  {
    title: "Public Transit",
    distance: "Valley Metro Light Rail",
    icon: <TrainRounded />,
    options: [
      "ASU/Downtown Phoenix Light Rail stops at campus",
      "Multiple bus routes serve the university area",
      "Day passes available for convenient travel",
      "Mobile ticketing through Valley Metro app",
    ],
  },
];

const LOCAL_AREA = [
  {
    title: "Dining options",
    description:
      "Mill Avenue and ASU campus offer numerous restaurants, cafes, and food courts within walking distance.",
    icon: <RestaurantRounded />,
  },
  {
    title: "Gas & services",
    description:
      "Multiple gas stations and convenience stores nearby for any last-minute needs.",
    icon: <LocalGasStationRounded />,
  },
  {
    title: "Campus resources",
    description:
      "ASU campus provides additional amenities including libraries, student centers, and recreational facilities.",
    icon: <InfoRounded />,
  },
];

const SECTION_PAD = {
  paddingTop: "clamp(48px, 7vh, 80px)",
  paddingBottom: "clamp(48px, 7vh, 80px)",
};
const BAND = {
  background: "var(--surface-2)",
  borderTop: "1px solid var(--line)",
  borderBottom: "1px solid var(--line)",
};
const TAG_ROW = { display: "flex", flexWrap: "wrap", gap: 6 };
const META_LINE = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: "0.9rem",
  margin: 0,
};
const SMALL_GHOST = { fontSize: "11px", padding: "0.75em 1.1em" };

// --- Module-scope presentational bits (no remounts on parent re-render) ---

// Section header with the "share this section" action kept from the old page.
const SectionHeading = ({ eyebrow, title, shareLabel, onShare }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 16,
      flexWrap: "wrap",
      marginBottom: 24,
    }}
  >
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="ohx-display" style={{ marginTop: 8 }}>
        {title}
      </h2>
    </div>
    <button
      type="button"
      className="ohx-btn ohx-btn--ghost"
      style={SMALL_GHOST}
      onClick={onShare}
      aria-label={`Share ${shareLabel}`}
    >
      <ShareRounded sx={{ fontSize: 15 }} aria-hidden="true" /> Share
    </button>
  </div>
);

// Tappable address block: opens the maps app (handler kept verbatim).
const AddressButton = ({ address, hint, onClick, compact = false }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      display: "block",
      width: "100%",
      textAlign: "left",
      background: "var(--surface-2)",
      border: "1px solid var(--line)",
      borderRadius: 6,
      padding: compact ? "10px 12px" : "14px 16px",
      cursor: "pointer",
      font: "inherit",
      color: "inherit",
    }}
  >
    <span
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 600,
        fontSize: compact ? "0.92rem" : "1rem",
      }}
    >
      <NavigationRounded
        sx={{ fontSize: 18, color: "var(--brand)" }}
        aria-hidden="true"
      />
      {address}
    </span>
    <span
      className="ohx-faint"
      style={{ display: "block", marginTop: 4, fontSize: 12.5 }}
    >
      {hint}
    </span>
  </button>
);

// next/image for our CDN; plain <img> (explicit dimensions, lazy) for the
// ASU tours host, which isn't in next.config.js remotePatterns.
const GalleryImage = ({ src, alt }) => {
  const isCdn = src.startsWith("https://cdn.ohack.dev/");
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 3",
        background: "var(--surface-2)",
        overflow: "hidden",
      }}
    >
      {isCdn ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 700px) 100vw, 360px"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          width={800}
          height={600}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}
    </div>
  );
};

const EventLocationPage = () => {
  const router = useRouter();
  const locationSlug = LOCATIONS[router.query.location]
    ? router.query.location
    : DEFAULT_LOCATION;
  const activeLocation = LOCATIONS[locationSlug];

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Mobile-friendly address handler - uses actual Google Maps links from PDF
  const handleAddressClick = (address, name, googleMapsUrl = null) => {
    if (googleMapsUrl) {
      // Use the specific Google Maps URL provided in the PDF
      window.open(googleMapsUrl, "_blank");
      showSnackbar(`Opening ${name} in maps`);
      return;
    }

    // Fallback to generic address search if no specific URL provided
    const encodedAddress = encodeURIComponent(address);

    // Try to detect the user's platform
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      // iOS - Try Apple Maps first, fallback to Google Maps
      window.open(`maps://maps.google.com/maps?q=${encodedAddress}`, "_blank");
    } else if (isAndroid) {
      // Android - Use Google Maps
      window.open(`geo:0,0?q=${encodedAddress}`, "_blank");
    } else {
      // Desktop or unknown - Use Google Maps web
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
        "_blank",
      );
    }

    showSnackbar(`Opening ${name} in maps app`);
  };

  // Section sharing functionality
  const handleShareSection = async (sectionTitle, sectionUrl) => {
    const shareData = {
      title: `${sectionTitle} - ASU Tempe Location | Opportunity Hack`,
      text: `Check out ${sectionTitle} for Opportunity Hack at ASU Tempe`,
      url: `${window.location.origin}${window.location.pathname}${sectionUrl}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        showSnackbar("Section shared successfully!");
      } catch (err) {
        if (err.name !== "AbortError") {
          copyToClipboard(shareData.url, "Section link copied to clipboard!");
        }
      }
    } else {
      copyToClipboard(shareData.url, "Section link copied to clipboard!");
    }
  };

  const copyToClipboard = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar(successMessage);
    } catch (err) {
      showSnackbar("Failed to copy to clipboard", "error");
    }
  };

  const handleLocationChange = (slug) => {
    router.push(
      { pathname: router.pathname, query: { location: slug } },
      undefined,
      { shallow: true },
    );
  };

  const openActiveInMaps = () =>
    handleAddressClick(
      activeLocation.address,
      activeLocation.name,
      activeLocation.googleMapsUrl,
    );

  return (
    <>
      <Head>
        <title>{`${activeLocation.name} - ASU Tempe Arizona Event Location | Opportunity Hack`}</title>
        <meta
          name="description"
          content={`Complete guide to Opportunity Hack events at ${activeLocation.name}, Arizona State University Tempe campus. ${activeLocation.address}. Find venue details, parking information, nearby hotels, and transportation options.`}
        />
        <meta
          name="keywords"
          content={`ASU Tempe, Arizona State University, Opportunity Hack location, hackathon venue, parking, hotels near ASU, Tempe Arizona events, ${activeLocation.name}`}
        />
        <meta name="author" content="Opportunity Hack" />
        <meta name="robots" content="index, follow" />
        <link
          rel="canonical"
          href="https://www.ohack.dev/about/locations/asu-tempe-arizona"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={`${activeLocation.name} - ASU Tempe Arizona Event Location | Opportunity Hack`}
        />
        <meta
          property="og:description"
          content={`Complete guide to Opportunity Hack events at ${activeLocation.name}, ASU Tempe campus. Find venue details, parking, hotels, and transportation options.`}
        />
        <meta
          property="og:url"
          content="https://www.ohack.dev/about/locations/asu-tempe-arizona"
        />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/locations/asu-tempe-venue.webp"
        />
        <meta
          property="og:image:alt"
          content={`ASU Tempe ${activeLocation.name} - Opportunity Hack event venue`}
        />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${activeLocation.name} - ASU Tempe Arizona Event Location | Opportunity Hack`}
        />
        <meta
          name="twitter:description"
          content={`Complete guide to Opportunity Hack events at ${activeLocation.name}, ASU Tempe campus. Venue, parking, hotels, and transportation info.`}
        />
        <meta
          name="twitter:image"
          content="https://cdn.ohack.dev/ohack.dev/locations/asu-tempe-venue.webp"
        />
        <meta name="twitter:creator" content="@opportunityhack" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "Place",
              name: `Opportunity Hack at ASU Tempe - ${activeLocation.name}`,
              description: `Event venue for Opportunity Hack hackathons at ${activeLocation.name}, Arizona State University Tempe campus`,
              address: {
                "@type": "PostalAddress",
                streetAddress: activeLocation.address.split(",")[0],
                addressLocality: "Tempe",
                addressRegion: "AZ",
                postalCode: "85281",
                addressCountry: "US",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: activeLocation.coordinates.lat,
                longitude: activeLocation.coordinates.lng,
              },
              url: "https://www.ohack.dev/about/locations/asu-tempe-arizona",
              sameAs: ["https://www.asu.edu", "https://www.ohack.dev"],
            }),
          }}
        />
      </Head>

      <RefinedRoot>
        {/* HERO */}
        <section
          className="ohx-wrap"
          style={{
            paddingTop: "clamp(104px, 13vh, 156px)",
            paddingBottom: "clamp(28px, 5vh, 48px)",
          }}
        >
          <Eyebrow>
            <span className="rise" style={{ display: "inline-block" }}>
              Venue guide · Tempe, Arizona
            </span>
          </Eyebrow>
          <h1
            className="ohx-display rise"
            style={{ marginTop: 18, maxWidth: "16ch", animationDelay: "60ms" }}
          >
            Getting to Opportunity Hack at{" "}
            <span className="ohx-italic">ASU Tempe.</span>
          </h1>
          <p
            className="ohx-lead rise"
            style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "62ch" }}
          >
            Everything judges, mentors, volunteers, and hackers need for an
            event at Arizona State University: the venue, where to park, nearby
            hotels, and how to get here from Sky Harbor — ten minutes away.
          </p>
          <div
            className="rise"
            style={{
              marginTop: 30,
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              animationDelay: "230ms",
            }}
          >
            <button
              type="button"
              className="ohx-btn ohx-btn--primary"
              onClick={openActiveInMaps}
            >
              Get directions to {activeLocation.name} <Arrow />
            </button>
            <Link href="/hack" className="ohx-btn ohx-btn--ghost">
              See upcoming events
            </Link>
          </div>

          <hr className="ohx-rule" style={{ marginTop: 34 }} />
          <div
            className="rise"
            style={{
              marginTop: 26,
              display: "flex",
              flexWrap: "wrap",
              gap: "clamp(28px, 6vw, 64px)",
              animationDelay: "360ms",
            }}
          >
            <Stat value="10 min" label="From PHX airport" />
            <Stat
              value={String(PARKING_OPTIONS.length)}
              label="Parking options"
            />
            <Stat value={String(HOTELS.length)} label="Nearby hotels" />
            <Stat value="Light rail" label="Stops on campus" />
          </div>
        </section>

        {/* VENUE PICKER */}
        <section
          className="ohx-wrap"
          style={{ paddingBottom: "clamp(28px, 5vh, 48px)" }}
        >
          <Eyebrow>Choose your venue</Eyebrow>
          <div
            role="group"
            aria-label="Select a venue"
            style={{
              marginTop: 12,
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              maxWidth: 760,
            }}
          >
            {Object.entries(LOCATIONS).map(([slug, loc]) => {
              const isActive = slug === locationSlug;
              return (
                <button
                  key={slug}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => handleLocationChange(slug)}
                  className="ohx-card ohx-card--hover"
                  style={{
                    textAlign: "left",
                    padding: "16px 18px",
                    cursor: "pointer",
                    font: "inherit",
                    color: "inherit",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    borderColor: isActive ? "var(--brand)" : undefined,
                    boxShadow: isActive
                      ? "inset 0 0 0 1px var(--brand)"
                      : undefined,
                  }}
                >
                  <LocationOnRounded
                    sx={{
                      fontSize: 20,
                      color: isActive ? "var(--brand)" : "var(--faint)",
                      mt: "2px",
                    }}
                    aria-hidden="true"
                  />
                  <span>
                    <span
                      className="ohx-display"
                      style={{ display: "block", fontSize: "1.05rem" }}
                    >
                      {loc.name}
                    </span>
                    <span
                      className="ohx-faint"
                      style={{ display: "block", marginTop: 4, fontSize: 12.5 }}
                    >
                      {loc.address}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* VENUE */}
        <section id="venue" style={{ ...BAND, scrollMarginTop: 96 }}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <SectionHeading
              eyebrow="The venue"
              title={activeLocation.name}
              shareLabel="venue information"
              onShare={() => handleShareSection("Event Venue", "#venue")}
            />

            <div
              className="ohx-card"
              style={{ padding: "26px 28px", background: "var(--surface)" }}
            >
              <p
                className="ohx-muted"
                style={{
                  margin: "0 0 18px",
                  maxWidth: "70ch",
                  lineHeight: 1.6,
                }}
              >
                {activeLocation.description}
              </p>

              <AddressButton
                address={activeLocation.address}
                hint="Tap to open in your maps app"
                onClick={openActiveInMaps}
              />

              <p
                className="ohx-eyebrow"
                style={{ margin: "18px 0 8px", letterSpacing: "0.14em" }}
              >
                Venue features
              </p>
              <div style={TAG_ROW}>
                {activeLocation.features.map((feature) => (
                  <span key={feature} className="ohx-tag">
                    {feature}
                  </span>
                ))}
              </div>

              <div
                style={{
                  marginTop: 22,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="ohx-btn ohx-btn--primary"
                  onClick={openActiveInMaps}
                >
                  <NavigationRounded sx={{ fontSize: 16 }} aria-hidden="true" />{" "}
                  Get directions
                </button>
                <button
                  type="button"
                  className="ohx-btn ohx-btn--ghost"
                  onClick={() =>
                    copyToClipboard(
                      activeLocation.address,
                      "Address copied to clipboard!",
                    )
                  }
                >
                  Copy address
                </button>
                {activeLocation.tourUrl && (
                  <a
                    href={activeLocation.tourUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ohx-btn ohx-btn--ghost"
                  >
                    Virtual tour ↗
                  </a>
                )}
              </div>
            </div>

            {/* Gallery: video + photos */}
            {(activeLocation.video || activeLocation.gallery.length > 0) && (
              <div style={{ marginTop: 40 }}>
                <Eyebrow>Venue gallery</Eyebrow>

                {activeLocation.video && (
                  <figure style={{ margin: "16px 0 0" }}>
                    <div
                      style={{
                        position: "relative",
                        paddingBottom: "56.25%",
                        height: 0,
                        overflow: "hidden",
                        maxWidth: 820,
                        borderRadius: 10,
                        border: "1px solid var(--line)",
                        background: "var(--surface)",
                      }}
                    >
                      <iframe
                        src={activeLocation.video}
                        title={`${activeLocation.name} Venue Tour - Opportunity Hack Location`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          border: "none",
                        }}
                      />
                    </div>
                    <figcaption
                      className="ohx-faint"
                      style={{ marginTop: 10, fontSize: 13 }}
                    >
                      Video tour of the ASU {activeLocation.name} venue
                    </figcaption>
                  </figure>
                )}

                {activeLocation.gallery.length > 0 && (
                  <div
                    style={{
                      marginTop: activeLocation.video ? 28 : 16,
                      display: "grid",
                      gap: 18,
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(260px, 1fr))",
                    }}
                  >
                    {activeLocation.gallery.map((photo) => (
                      <figure
                        key={photo.src}
                        className="ohx-card"
                        style={{
                          margin: 0,
                          overflow: "hidden",
                          background: "var(--surface)",
                        }}
                      >
                        <GalleryImage src={photo.src} alt={photo.alt} />
                        <figcaption
                          className="ohx-muted"
                          style={{
                            padding: "12px 16px 14px",
                            fontSize: 13.5,
                            lineHeight: 1.5,
                          }}
                        >
                          {photo.caption}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* GETTING HERE */}
        <section
          id="transportation"
          className="ohx-wrap"
          style={{ ...SECTION_PAD, scrollMarginTop: 96 }}
        >
          <SectionHeading
            eyebrow="Getting here"
            title="From the airport or the light rail"
            shareLabel="transportation information"
            onShare={() =>
              handleShareSection("Transportation", "#transportation")
            }
          />
          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            }}
          >
            {TRANSPORTATION_OPTIONS.map((transport) => (
              <div
                key={transport.title}
                className="ohx-card"
                style={{ padding: "24px 26px" }}
              >
                <div
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <span
                    style={{
                      color: "var(--accent)",
                      display: "inline-flex",
                      marginTop: 2,
                    }}
                    aria-hidden="true"
                  >
                    {transport.icon}
                  </span>
                  <div>
                    <h3 className="ohx-display" style={{ fontSize: "1.15rem" }}>
                      {transport.title}
                    </h3>
                    <p
                      className="ohx-faint"
                      style={{ margin: "4px 0 0", fontSize: 12.5 }}
                    >
                      {transport.distance}
                    </p>
                  </div>
                </div>
                <ul
                  className="ohx-muted"
                  style={{
                    margin: "14px 0 0",
                    paddingLeft: 18,
                    fontSize: "0.92rem",
                    lineHeight: 1.6,
                  }}
                >
                  {transport.options.map((option) => (
                    <li key={option} style={{ marginBottom: 4 }}>
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Tax deduction callout */}
          <div
            className="ohx-card"
            style={{
              marginTop: 24,
              padding: "22px 26px",
              borderLeft: "3px solid var(--accent)",
            }}
          >
            <h3 className="ohx-display" style={{ fontSize: "1.1rem" }}>
              Traveling to support us? Your expenses may be tax-deductible.
            </h3>
            <p
              className="ohx-muted"
              style={{
                margin: "8px 0 12px",
                maxWidth: "70ch",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              }}
            >
              Opportunity Hack is a 501(c)(3) nonprofit, so volunteers can
              typically deduct travel expenses incurred while volunteering. Our
              EIN is <strong style={{ color: "var(--ink)" }}>84-5113049</strong>
              .
            </p>
            <a
              className="ohx-link"
              href="https://www.hrblock.com/tax-center/filing/adjustments-and-deductions/volunteer-work-tax-deductions/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about volunteer tax deductions <Arrow />
            </a>
          </div>
        </section>

        {/* PARKING */}
        <section id="parking" style={{ ...BAND, scrollMarginTop: 96 }}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <SectionHeading
              eyebrow="Parking"
              title="Where to park"
              shareLabel="parking information"
              onShare={() => handleShareSection("Parking", "#parking")}
            />
            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              }}
            >
              {PARKING_OPTIONS.map((parking) => (
                <div
                  key={parking.name}
                  className="ohx-card"
                  style={{
                    padding: "22px 24px",
                    background: "var(--surface)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {parking.recommendation && (
                    <span
                      className="ohx-tag ohx-tag--accent"
                      style={{ alignSelf: "flex-start", marginBottom: 10 }}
                    >
                      {parking.recommendation}
                    </span>
                  )}
                  <h3 className="ohx-display" style={{ fontSize: "1.1rem" }}>
                    {parking.name}
                  </h3>
                  <p
                    className="ohx-muted"
                    style={{
                      margin: "6px 0 12px",
                      fontSize: "0.92rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {parking.description}
                  </p>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <p className="ohx-muted" style={META_LINE}>
                      <AccessTimeRounded
                        sx={{ fontSize: 16 }}
                        aria-hidden="true"
                      />
                      {parking.distance}
                    </p>
                    <p className="ohx-muted" style={META_LINE}>
                      <LocalParkingRounded
                        sx={{ fontSize: 16 }}
                        aria-hidden="true"
                      />
                      {parking.cost}
                    </p>
                  </div>
                  <div style={{ marginTop: "auto", paddingTop: 16 }}>
                    <button
                      type="button"
                      className="ohx-btn ohx-btn--ghost"
                      style={SMALL_GHOST}
                      onClick={() =>
                        handleAddressClick(
                          parking.address,
                          parking.name,
                          parking.googleMapsUrl,
                        )
                      }
                    >
                      <NavigationRounded
                        sx={{ fontSize: 15 }}
                        aria-hidden="true"
                      />{" "}
                      Get directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOTELS */}
        <section
          id="hotels"
          className="ohx-wrap"
          style={{ ...SECTION_PAD, scrollMarginTop: 96 }}
        >
          <SectionHeading
            eyebrow="Stay nearby"
            title="Recommended hotels"
            shareLabel="hotel information"
            onShare={() => handleShareSection("Hotels", "#hotels")}
          />
          <p
            className="ohx-faint"
            style={{ margin: "-10px 0 24px", fontSize: 13.5 }}
          >
            Prices shown are estimates and may vary by date. Book early for the
            best rates.
          </p>
          <div
            style={{
              display: "grid",
              gap: 18,
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            }}
          >
            {HOTELS.map((hotel) => (
              <div
                key={hotel.name}
                className="ohx-card"
                style={{
                  padding: "22px 24px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "baseline",
                    flexWrap: "wrap",
                  }}
                >
                  <h3 className="ohx-display" style={{ fontSize: "1.1rem" }}>
                    {hotel.name}
                  </h3>
                  <span className="ohx-tag">{hotel.priceRange}</span>
                </div>
                <p
                  className="ohx-muted"
                  style={{
                    margin: "6px 0 14px",
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                  }}
                >
                  {hotel.description}
                </p>

                <AddressButton
                  compact
                  address={hotel.address}
                  hint={`${hotel.distance} · Tap for directions`}
                  onClick={() =>
                    handleAddressClick(
                      hotel.address,
                      hotel.name,
                      hotel.googleMapsUrl,
                    )
                  }
                />

                <p
                  className="ohx-muted"
                  style={{ ...META_LINE, marginTop: 12 }}
                >
                  <PhoneRounded sx={{ fontSize: 16 }} aria-hidden="true" />
                  <a
                    href={`tel:${hotel.phone}`}
                    style={{ color: "inherit", textDecoration: "none" }}
                  >
                    {hotel.phone}
                  </a>
                </p>

                <p
                  className="ohx-eyebrow"
                  style={{ margin: "14px 0 6px", letterSpacing: "0.14em" }}
                >
                  Amenities
                </p>
                <div style={TAG_ROW}>
                  {hotel.features.map((feature) => (
                    <span key={feature} className="ohx-tag">
                      {feature}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 18,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="ohx-btn ohx-btn--ghost"
                    style={SMALL_GHOST}
                    onClick={() =>
                      handleAddressClick(
                        hotel.address,
                        hotel.name,
                        hotel.googleMapsUrl,
                      )
                    }
                  >
                    <NavigationRounded
                      sx={{ fontSize: 15 }}
                      aria-hidden="true"
                    />{" "}
                    Directions
                  </button>
                  <a
                    href={`tel:${hotel.phone}`}
                    className="ohx-btn ohx-btn--ghost"
                    style={SMALL_GHOST}
                  >
                    <PhoneRounded sx={{ fontSize: 15 }} aria-hidden="true" />{" "}
                    Call
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LOCAL AREA */}
        <section id="local-area" style={{ ...BAND, scrollMarginTop: 96 }}>
          <div className="ohx-wrap" style={SECTION_PAD}>
            <SectionHeading
              eyebrow="Around campus"
              title="Local area information"
              shareLabel="local area information"
              onShare={() => handleShareSection("Local Area", "#local-area")}
            />
            <div
              style={{
                display: "grid",
                gap: 18,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              }}
            >
              {LOCAL_AREA.map((item) => (
                <div
                  key={item.title}
                  className="ohx-card"
                  style={{
                    padding: "22px 24px",
                    background: "var(--surface)",
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "var(--accent)",
                      display: "inline-flex",
                      marginTop: 2,
                    }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  <div>
                    <h3 className="ohx-display" style={{ fontSize: "1.1rem" }}>
                      {item.title}
                    </h3>
                    <p
                      className="ohx-muted"
                      style={{
                        margin: "6px 0 0",
                        fontSize: "0.92rem",
                        lineHeight: 1.55,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section
          className="ohx-wrap"
          style={{ paddingTop: 0, paddingBottom: "clamp(56px, 9vh, 104px)" }}
        >
          <CtaBand
            eyebrow="Ready for your hackathon weekend?"
            title="Join us at ASU Tempe"
            body="Check out our upcoming events and find a role — hacker, mentor, judge, or volunteer — that fits you."
            primary={{ href: "/hack", label: "Find events" }}
            secondary={{ href: "/volunteer", label: "Get involved" }}
          />
        </section>
      </RefinedRoot>

      {/* Feedback toast (MUI Portal — outside RefinedRoot, so literal colors) */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <SnackbarContent
          message={snackbar.message}
          sx={{
            bgcolor: snackbar.severity === "error" ? "#B04A36" : "#1B3A6B",
            color: "#fff",
            borderRadius: "6px",
            boxShadow: "0 12px 30px -16px rgba(22,24,29,0.5)",
          }}
        />
      </Snackbar>
    </>
  );
};

export default EventLocationPage;

export const getStaticProps = async () => {
  const title = "ASU Tempe Arizona Event Location | Opportunity Hack";
  const description =
    "Complete guide to Opportunity Hack events at Arizona State University Tempe campus. Find venue details, parking information, nearby hotels, and transportation options for judges, mentors, volunteers, and hackers.";

  return {
    props: {
      title,
      description,
      openGraphData: [
        {
          name: "title",
          property: "title",
          content: title,
          key: "title",
        },
        {
          name: "og:title",
          property: "og:title",
          content: title,
          key: "ogtitle",
        },
        {
          name: "description",
          property: "description",
          content: description,
          key: "description",
        },
        {
          name: "og:description",
          property: "og:description",
          content: description,
          key: "ogdescription",
        },
        {
          name: "og:type",
          property: "og:type",
          content: "website",
          key: "ogtype",
        },
        {
          name: "og:url",
          property: "og:url",
          content: "https://www.ohack.dev/about/locations/asu-tempe-arizona",
          key: "ogurl",
        },
        {
          name: "og:image",
          property: "og:image",
          content:
            "https://cdn.ohack.dev/ohack.dev/locations/asu-tempe-venue.webp",
          key: "ogimage",
        },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "summary_large_image",
          key: "twittercard",
        },
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        name: "Opportunity Hack at ASU Tempe",
        description:
          "Event venue for Opportunity Hack hackathons at Arizona State University Tempe campus",
        address: {
          "@type": "PostalAddress",
          streetAddress: "501 E Tyler Mall",
          addressLocality: "Tempe",
          addressRegion: "AZ",
          postalCode: "85281",
          addressCountry: "US",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 33.4255,
          longitude: -111.94,
        },
        url: "https://www.ohack.dev/about/locations/asu-tempe-arizona",
      },
    },
  };
};
