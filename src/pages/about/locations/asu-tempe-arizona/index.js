import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Paper,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  CardMedia,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import {
  LocationOnRounded,
  LocalParkingRounded,
  FlightRounded,
  HotelRounded,
  DirectionsCarRounded,
  ShareRounded,
  LinkRounded,
  PhoneRounded,
  NavigationRounded,
  AccessTimeRounded,
  InfoRounded,
  LocalTaxiRounded,
  TrainRounded,
  DirectionsBusRounded,
  RestaurantRounded,
  LocalGasStationRounded,
} from '@mui/icons-material';

const LOCATIONS = {
  "engineering-center-g-wing": {
    name: "Engineering Center G-Wing",
    address: "501 E Tyler Mall, Tempe, AZ 85281",
    description: "Main event venue - ECG Building, Room 101",
    coordinates: { lat: 33.4255, lng: -111.9400 },
    features: ["WiFi", "Power outlets", "Air conditioning", "Accessible entrance"],
    googleMapsUrl: "https://maps.app.goo.gl/z9hD7YoFxfFFLstC8",
    gallery: [
      {
        src: "https://cdn.ohack.dev/ohack.dev/2024_hackathon_5.webp",
        caption: "Hackers collaborating in ASU ECG 101 Generator lab during an Opportunity Hack event",
        alt: "Hackathon participants working together in ECG 101 Generator lab"
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_1.webp",
        caption: "Exterior view of the Engineering Center G-Wing - our main event building",
        alt: "ASU Engineering Center G-Wing exterior view"
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_2.webp",
        caption: "Inside the G-Wing Generator Lab - spacious collaborative workspace for hackathon teams",
        alt: "Interior of G-Wing Generator Lab workspace"
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_3.webp",
        caption: "Volunteers and participants working together in the Generator Lab during a hackathon event",
        alt: "Volunteers collaborating in the Generator Lab"
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_4.webp",
        caption: "Workshop room across the courtyard - additional meeting space for breakout sessions",
        alt: "Workshop room across the courtyard from G-Wing"
      },
      {
        src: "https://cdn.ohack.dev/ohack.dev/locations/asu_5.webp",
        caption: "Food and refreshment station in the main Generator Lab - keeping hackers energized!",
        alt: "Food table setup in the G-Wing Generator Lab"
      }
    ],
    video: "https://www.youtube.com/embed/a521Ch2N52c",
    tourUrl: null,
  },
  "hayden-library": {
    name: "Hayden Library",
    address: "300 E Orange St., Tempe, AZ 85281",
    description: "Hayden Library - a recently renovated ($90M) historic ASU landmark with collaborative study spaces, Makerspace, and nearly double the original student space",
    coordinates: { lat: 33.4242, lng: -111.9428 },
    features: ["WiFi", "Power outlets", "Air conditioning", "Accessible entrance", "Study rooms", "Makerspace"],
    googleMapsUrl: "https://share.google/1aouzYHBuPe5OgnsQ",
    gallery: [
      {
        src: "https://tours.asu.edu/sites/g/files/litvpz1481/files/tours/tempe-hayden-hero.jpg",
        caption: "Exterior view of Hayden Library - a historic ASU landmark named after Charles Trumbull Hayden, founder of Tempe",
        alt: "Hayden Library exterior at ASU Tempe campus"
      },
      {
        src: "https://tours.asu.edu/sites/g/files/litvpz1481/files/interior/tempe-hayden-interior-3.jpg",
        caption: "Renovated interior of Hayden Library with modern collaborative study spaces",
        alt: "Hayden Library interior collaborative study area"
      },
      {
        src: "https://tours.asu.edu/sites/g/files/litvpz1481/files/interior/tempe-hayden-interior-5.jpg",
        caption: "Open study areas inside the renovated Hayden Library",
        alt: "Hayden Library open study spaces"
      },
      {
        src: "https://tours.asu.edu/sites/g/files/litvpz1481/files/interior/tempe-hayden-interior-2.jpg",
        caption: "Hayden Library interior spaces - modernized with enhanced facilities for students and visitors",
        alt: "Hayden Library modernized interior"
      },
    ],
    video: null,
    tourUrl: "https://tours.asu.edu/tempe/hayden-library",
  },
};

const DEFAULT_LOCATION = "engineering-center-g-wing";

const EventLocationPage = () => {
  const router = useRouter();
  const locationSlug = LOCATIONS[router.query.location] ? router.query.location : DEFAULT_LOCATION;
  const activeLocation = LOCATIONS[locationSlug];

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [mapDialog, setMapDialog] = useState({ open: false, title: '', src: '' });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Mobile-friendly address handler - uses actual Google Maps links from PDF
  const handleAddressClick = (address, name, googleMapsUrl = null) => {
    if (googleMapsUrl) {
      // Use the specific Google Maps URL provided in the PDF
      window.open(googleMapsUrl, '_blank');
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
      window.open(`maps://maps.google.com/maps?q=${encodedAddress}`, '_blank');
    } else if (isAndroid) {
      // Android - Use Google Maps
      window.open(`geo:0,0?q=${encodedAddress}`, '_blank');
    } else {
      // Desktop or unknown - Use Google Maps web
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
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
        showSnackbar('Section shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareData.url, 'Section link copied to clipboard!');
        }
      }
    } else {
      copyToClipboard(shareData.url, 'Section link copied to clipboard!');
    }
  };

  const copyToClipboard = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar(successMessage);
    } catch (err) {
      showSnackbar('Failed to copy to clipboard', 'error');
    }
  };

  const openMapDialog = (title, address) => {
    const encodedAddress = encodeURIComponent(address);
    const embedSrc = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'demo'}&q=${encodedAddress}`;
    setMapDialog({ open: true, title, src: embedSrc });
  };

  const handleLocationChange = (slug) => {
    router.push({ pathname: router.pathname, query: { location: slug } }, undefined, { shallow: true });
  };

  const parkingOptions = [
    {
      name: "Tyler Street Parking Structure",
      address: "Tyler Street, Tempe, AZ 85281",
      distance: "2-minute walk",
      cost: "Paid parking",
      description: "Closest parking structure to the venue",
      recommendation: "Best option for attendees",
      googleMapsUrl: "https://goo.gl/maps/wfJY28ULsgAVkY2q9" // ✅ Option 1 from PDF
    },
    {
      name: "Apache Blvd. Parking Structure", 
      address: "Apache Boulevard, Tempe, AZ 85281",
      distance: "5-minute walk",
      cost: "Paid parking",
      description: "Large parking structure with good availability",
      googleMapsUrl: "https://goo.gl/maps/f61DFDHySp1SY1xV7" // ✅ Option 2 from PDF
    },
    {
      name: "Rural Road Parking Structure",
      address: "Rural Road, Tempe, AZ 85281", 
      distance: "8-minute walk",
      cost: "Paid parking",
      description: "Additional option if other structures are full",
      googleMapsUrl: "https://goo.gl/maps/tcSmFFudoGu8dhh96" // ✅ Option 3 from PDF
    },
    {
      name: "ASU Maintenance Parking Lot",
      address: "Next to G-Wing, Tempe, AZ 85281",
      distance: "1-minute walk",
      cost: "Drop-off only",
      description: "Perfect for drop-off - closest to G-Wing entrance",
      recommendation: "Best for drop-off/pick-up",
      googleMapsUrl: "https://maps.app.goo.gl/75rWK8fZw6aNXWWr6" // ✅ Drop-off from PDF
    },
    {
      name: "Visitor Parking - South Apache",
      address: "South Side of Apache Blvd, Tempe, AZ 85281",
      distance: "10-minute walk", 
      cost: "Paid parking",
      description: "Visitor designated parking area",
      googleMapsUrl: "https://maps.app.goo.gl/9DYqL6srCg1bpLfq8" // ✅ Option 4 from PDF
    },
    {
      name: "Visitor Parking 27",
      address: "Visitor Parking 27, Tempe, AZ 85281",
      distance: "12-minute walk",
      cost: "1-hour parking only",
      description: "Limited time visitor parking option",
      googleMapsUrl: "https://goo.gl/maps/x2qiHZD27oZVtsFs5" // ✅ Option 5 from PDF
    }
  ];

  const hotels = [
    {
      name: "Graduate by Hilton Tempe",
      priceRange: "$143+/night",
      address: "225 E Apache Blvd, Tempe, AZ 85281",
      distance: "0.5 miles from venue",
      phone: "(480) 967-9431",
      features: ["Free WiFi", "Fitness center", "Restaurant", "Business center"],
      description: "Modern hotel with university-themed design, walking distance to ASU campus",
      googleMapsUrl: "https://maps.app.goo.gl/9w9tPW37CLwnYs4k9" // ✅ From PDF
    },
    {
      name: "The Westin Tempe",
      priceRange: "$182+/night", 
      address: "1333 S Rural Rd, Tempe, AZ 85281",
      distance: "1.2 miles from venue",
      phone: "(480) 929-3300",
      features: ["Luxury amenities", "Pool", "Spa", "Multiple dining options"],
      description: "Upscale hotel with premium amenities and services",
      googleMapsUrl: "https://maps.app.goo.gl/6wAEA8MD9qDm6Krt9" // ✅ From PDF
    },
    {
      name: "Tempe Mission Palms - Destination by Hyatt",
      priceRange: "$197+/night",
      address: "60 E 5th St, Tempe, AZ 85281", 
      distance: "1.8 miles from venue",
      phone: "(480) 894-1400",
      features: ["Resort-style pool", "Tennis court", "Restaurants", "Spa services"],
      description: "Resort-style hotel in downtown Tempe with full amenities",
      googleMapsUrl: "https://maps.app.goo.gl/ZhGyWFChEe78fM4E6" // ✅ From PDF
    },
    {
      name: "Residence Inn Tempe Downtown/University",
      priceRange: "$296+/night",
      address: "510 S Forest Ave, Tempe, AZ 85281",
      distance: "1.5 miles from venue", 
      phone: "(480) 967-2188",
      features: ["Extended stay suites", "Kitchen facilities", "Free breakfast", "Pet-friendly"],
      description: "Suite-style accommodations perfect for longer stays",
      googleMapsUrl: "https://maps.app.goo.gl/bWeaSzVX1PgmnXcd7" // ✅ From PDF
    }
  ];

  const transportationOptions = [
    {
      title: "Sky Harbor Airport (PHX)",
      distance: "10-minute drive",
      options: [
        "Rental car - Multiple agencies available",
        "Rideshare (Uber/Lyft) - $20-30 typical cost",
        "Phoenix Sky Train + Light Rail - Connect to ASU",
        "Hotel shuttle service - Check with your hotel"
      ]
    },
    {
      title: "Public Transit",
      distance: "Valley Metro Light Rail",
      options: [
        "ASU/Downtown Phoenix Light Rail stops at campus",
        "Multiple bus routes serve the university area", 
        "Day passes available for convenient travel",
        "Mobile ticketing through Valley Metro app"
      ]
    }
  ];

  return (
    <Container maxWidth="lg">
      <Head>
        <title>{activeLocation.name} - ASU Tempe Arizona Event Location | Opportunity Hack</title>
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
        <link rel="canonical" href="https://ohack.dev/about/locations/asu-tempe-arizona" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${activeLocation.name} - ASU Tempe Arizona Event Location | Opportunity Hack`} />
        <meta property="og:description" content={`Complete guide to Opportunity Hack events at ${activeLocation.name}, ASU Tempe campus. Find venue details, parking, hotels, and transportation options.`} />
        <meta property="og:url" content="https://ohack.dev/about/locations/asu-tempe-arizona" />
        <meta property="og:image" content="https://cdn.ohack.dev/ohack.dev/locations/asu-tempe-venue.webp" />
        <meta property="og:image:alt" content={`ASU Tempe ${activeLocation.name} - Opportunity Hack event venue`} />
        <meta property="og:site_name" content="Opportunity Hack" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${activeLocation.name} - ASU Tempe Arizona Event Location | Opportunity Hack`} />
        <meta name="twitter:description" content={`Complete guide to Opportunity Hack events at ${activeLocation.name}, ASU Tempe campus. Venue, parking, hotels, and transportation info.`} />
        <meta name="twitter:image" content="https://cdn.ohack.dev/ohack.dev/locations/asu-tempe-venue.webp" />
        <meta name="twitter:creator" content="@opportunityhack" />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Place",
            "name": `Opportunity Hack at ASU Tempe - ${activeLocation.name}`,
            "description": `Event venue for Opportunity Hack hackathons at ${activeLocation.name}, Arizona State University Tempe campus`,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": activeLocation.address.split(",")[0],
              "addressLocality": "Tempe",
              "addressRegion": "AZ",
              "postalCode": "85281",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": activeLocation.coordinates.lat,
              "longitude": activeLocation.coordinates.lng
            },
            "url": "https://ohack.dev/about/locations/asu-tempe-arizona",
            "sameAs": [
              "https://www.asu.edu",
              "https://ohack.dev"
            ]
          })}
        </script>
      </Head>

      <Box sx={{ padding: "2rem", fontSize: "1em" }}>
        {/* Hero Section */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
            mb: 2,
            mt: 10,
            textAlign: "center"
          }}
        >
          ASU Tempe, Arizona
        </Typography>

        <Typography
          variant="h5"
          component="h2"
          sx={{ 
            mb: 4, 
            color: "text.secondary", 
            fontWeight: 300,
            textAlign: "center",
            maxWidth: "800px",
            mx: "auto"
          }}
        >
          Your Complete Guide to Opportunity Hack Events at Arizona State University
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: "18px",
            mb: 4,
            maxWidth: "800px",
            mx: "auto",
            lineHeight: 1.7,
            textAlign: "center"
          }}
        >
          Welcome to one of our premier hackathon venues! Located in the heart of Tempe, just 10 minutes from Sky Harbor Airport,
          ASU provides the perfect environment for innovation and collaboration.
        </Typography>

        {/* Venue Selector */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            border: 2,
            borderColor: "primary.main",
            borderRadius: 2,
            textAlign: "center",
            maxWidth: "700px",
            mx: "auto",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            <LocationOnRounded sx={{ verticalAlign: "middle", mr: 0.5 }} />
            Select Your Venue ({Object.keys(LOCATIONS).length} locations)
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {Object.entries(LOCATIONS).map(([slug, loc]) => {
              const isActive = slug === locationSlug;
              return (
                <Grid item xs={12} sm={6} key={slug}>
                  <Paper
                    elevation={isActive ? 4 : 0}
                    onClick={() => handleLocationChange(slug)}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      border: 2,
                      borderColor: isActive ? "primary.main" : "grey.300",
                      bgcolor: isActive ? "primary.main" : "background.paper",
                      color: isActive ? "primary.contrastText" : "text.primary",
                      borderRadius: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {loc.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isActive ? "primary.contrastText" : "text.secondary",
                        opacity: isActive ? 0.9 : 1,
                      }}
                    >
                      {loc.address}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* Tax Deduction Information */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 5, 
            bgcolor: "success.light", 
            color: "white",
            textAlign: "center",
            borderRadius: 2
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "white", fontWeight: "bold" }}>
            💰 Tax Deduction for Volunteers
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 2, 
              color: "white",
              maxWidth: "700px",
              mx: "auto"
            }}
          >
            Traveling to support us? <br />
            You can typically deduct volunteer travel expenses from your taxes since Opportunity Hack is a 501c3 nonprofit organization.
          </Typography>
          <Typography variant="body2" sx={{ color: "white", mb: 2, fontWeight: "bold" }}>
            Our EIN: 84-5113049
          </Typography>
          <Button
            variant="contained"
            size="small"
            href="https://www.hrblock.com/tax-center/filing/adjustments-and-deductions/volunteer-work-tax-deductions/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              bgcolor: "white", 
              color: "success.main",
              '&:hover': { bgcolor: "grey.100" }
            }}
          >
            Learn More About Volunteer Tax Deductions
          </Button>
        </Paper>

        {/* Quick Info Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: "center", p: 2, height: "100%" }}>
              <FlightRounded color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Airport</Typography>
              <Typography variant="body2">10 min from PHX</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: "center", p: 2, height: "100%" }}>
              <LocalParkingRounded color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Parking</Typography>
              <Typography variant="body2">5 options available</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: "center", p: 2, height: "100%" }}>
              <HotelRounded color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Hotels</Typography>
              <Typography variant="body2">4+ nearby options</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ textAlign: "center", p: 2, height: "100%" }}>
              <AccessTimeRounded color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Transit</Typography>
              <Typography variant="body2">Light rail accessible</Typography>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        {/* Event Venue Section */}
        <Box id="venue" sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h3" component="h2">
              Event Venue
            </Typography>
            <Tooltip title="Share venue information">
              <IconButton onClick={() => handleShareSection("Event Venue", "#venue")}>
                <ShareRounded />
              </IconButton>
            </Tooltip>
          </Box>

          <Card sx={{ p: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {activeLocation.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {activeLocation.description}
                  </Typography>
                </Box>
                <LocationOnRounded color="primary" sx={{ fontSize: 32 }} />
              </Box>

              <Box
                onClick={() => handleAddressClick(activeLocation.address, activeLocation.name, activeLocation.googleMapsUrl)}
                sx={{
                  cursor: "pointer",
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  mb: 2,
                  '&:hover': { bgcolor: "grey.100" }
                }}
              >
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <NavigationRounded color="primary" />
                  {activeLocation.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tap to open in maps app
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>Venue Features:</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
                {activeLocation.features.map((feature, i) => (
                  <Chip key={i} label={feature} size="small" variant="outlined" />
                ))}
              </Box>

              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    variant="contained"
                    startIcon={<NavigationRounded />}
                    onClick={() => handleAddressClick(activeLocation.address, activeLocation.name, activeLocation.googleMapsUrl)}
                  >
                    Get Directions
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<ShareRounded />}
                    onClick={() => copyToClipboard(activeLocation.address, 'Address copied to clipboard!')}
                  >
                    Share Address
                  </Button>
                </Grid>
                {activeLocation.tourUrl && (
                  <Grid item>
                    <Button
                      variant="outlined"
                      startIcon={<LinkRounded />}
                      href={activeLocation.tourUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Virtual Tour
                    </Button>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Venue Gallery - Video & Photos (conditional) */}
          {(activeLocation.video || activeLocation.gallery.length > 0) && (
            <Box sx={{ mt: 5 }}>
              <Typography variant="h5" gutterBottom sx={{ textAlign: "center", mb: 3 }}>
                Venue Gallery
              </Typography>

              {/* Featured Video */}
              {activeLocation.video && (
                <Box sx={{ mb: 4, textAlign: "center" }}>
                  <Box sx={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    height: 0,
                    overflow: 'hidden',
                    maxWidth: '800px',
                    margin: '0 auto',
                    borderRadius: 2,
                    boxShadow: 3
                  }}>
                    <iframe
                      src={activeLocation.video}
                      title={`${activeLocation.name} Venue Tour - Opportunity Hack Location`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2, fontStyle: "italic" }}
                  >
                    Video tour of the ASU {activeLocation.name} venue
                  </Typography>
                </Box>
              )}

              {/* Photo Gallery */}
              {activeLocation.gallery.length > 0 && (
                <Grid container spacing={3}>
                  {activeLocation.gallery.map((photo, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card
                        sx={{
                          height: "100%",
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 6
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="240"
                          image={photo.src}
                          alt={photo.alt}
                          sx={{ objectFit: "cover" }}
                        />
                        <CardContent>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.5,
                              fontSize: "0.95rem"
                            }}
                          >
                            {photo.caption}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Transportation Section */}
        <Box id="transportation" sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h3" component="h2">
              Getting Here
            </Typography>
            <Tooltip title="Share transportation information">
              <IconButton onClick={() => handleShareSection("Transportation", "#transportation")}>
                <ShareRounded />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={4}>
            {transportationOptions.map((transport, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: "100%", p: 2 }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {index === 0 ? <FlightRounded color="primary" /> : <TrainRounded color="primary" />}
                      {transport.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      {transport.distance}
                    </Typography>
                    <List dense>
                      {transport.options.map((option, i) => (
                        <ListItem key={i}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <DirectionsCarRounded fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={option} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Parking Section */}
        <Box id="parking" sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h3" component="h2">
              Parking Options
            </Typography>
            <Tooltip title="Share parking information">
              <IconButton onClick={() => handleShareSection("Parking", "#parking")}>
                <ShareRounded />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={3}>
            {parkingOptions.map((parking, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  sx={{ 
                    height: "100%", 
                    border: parking.recommendation ? 2 : 0,
                    borderColor: parking.recommendation ? "primary.main" : "transparent"
                  }}
                >
                  <CardContent>
                    {parking.recommendation && (
                      <Chip 
                        label={parking.recommendation} 
                        color="primary" 
                        size="small" 
                        sx={{ mb: 2 }}
                      />
                    )}
                    <Typography variant="h6" gutterBottom>
                      {parking.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {parking.description}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <AccessTimeRounded fontSize="small" />
                        {parking.distance}
                      </Typography>
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <LocalParkingRounded fontSize="small" />
                        {parking.cost}
                      </Typography>
                    </Box>

                    <Button
                      variant="outlined" 
                      size="small"
                      startIcon={<NavigationRounded />}
                      onClick={() => handleAddressClick(parking.address, parking.name, parking.googleMapsUrl)}
                      fullWidth
                    >
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Hotels Section */}
        <Box id="hotels" sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h3" component="h2">
              Recommended Hotels
            </Typography>
            <Tooltip title="Share hotel information">
              <IconButton onClick={() => handleShareSection("Hotels", "#hotels")}>
                <ShareRounded />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography 
            variant="body1" 
            sx={{ mb: 4, color: "text.secondary", fontStyle: "italic" }}
          >
            Prices shown are estimates and may vary by date. Book early for the best rates!
          </Typography>

          <Grid container spacing={3}>
            {hotels.map((hotel, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Typography variant="h6">
                        {hotel.name}
                      </Typography>
                      <Chip label={hotel.priceRange} color="primary" />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {hotel.description}
                    </Typography>

                    <Box 
                      onClick={() => handleAddressClick(hotel.address, hotel.name, hotel.googleMapsUrl)}
                      sx={{ 
                        cursor: "pointer", 
                        p: 1, 
                        bgcolor: "grey.50", 
                        borderRadius: 1,
                        my: 2,
                        '&:hover': { bgcolor: "grey.100" }
                      }}
                    >
                      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <LocationOnRounded fontSize="small" />
                        {hotel.address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {hotel.distance} • Tap for directions
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <PhoneRounded fontSize="small" />
                      <a href={`tel:${hotel.phone}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {hotel.phone}
                      </a>
                    </Typography>

                    <Typography variant="subtitle2" gutterBottom>Amenities:</Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
                      {hotel.features.map((feature, i) => (
                        <Chip key={i} label={feature} size="small" variant="outlined" />
                      ))}
                    </Box>

                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<NavigationRounded />}
                          onClick={() => handleAddressClick(hotel.address, hotel.name, hotel.googleMapsUrl)}
                          fullWidth
                        >
                          Directions
                        </Button>
                      </Grid>
                      <Grid item xs={6}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PhoneRounded />}
                          href={`tel:${hotel.phone}`}
                          fullWidth
                        >
                          Call
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Local Area Information */}
        <Box id="local-area" sx={{ mb: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h3" component="h2">
              Local Area Information
            </Typography>
            <Tooltip title="Share local area information">
              <IconButton onClick={() => handleShareSection("Local Area", "#local-area")}>
                <ShareRounded />
              </IconButton>
            </Tooltip>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", p: 3, height: "100%" }}>
                <RestaurantRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>Dining Options</Typography>
                <Typography variant="body2" color="text.secondary">
                  Mill Avenue and ASU campus offer numerous restaurants, cafes, and food courts within walking distance.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", p: 3, height: "100%" }}>
                <LocalGasStationRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>Gas & Services</Typography>
                <Typography variant="body2" color="text.secondary">
                  Multiple gas stations and convenience stores nearby for any last-minute needs.
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: "center", p: 3, height: "100%" }}>
                <InfoRounded color="primary" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h6" gutterBottom>Campus Resources</Typography>
                <Typography variant="body2" color="text.secondary">
                  ASU campus provides additional amenities including libraries, student centers, and recreational facilities.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action */}
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "primary.light", color: "white" }}>
          <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
            Ready for Your Hackathon Experience?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: "600px", mx: "auto", color: "white" }}>
            Join us at ASU Tempe for an amazing hackathon experience! Check out our upcoming events and get involved.
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                variant="contained"
                size="large"
                href="/hack"
                sx={{ 
                  bgcolor: "white", 
                  color: "primary.main",
                  '&:hover': { bgcolor: "grey.100" }
                }}
              >
                Find Events
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                size="large"
                href="/volunteer"
                sx={{ 
                  borderColor: "white", 
                  color: "white",
                  '&:hover': { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                Get Involved
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Map Dialog */}
      <Dialog
        open={mapDialog.open}
        onClose={() => setMapDialog({ ...mapDialog, open: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{mapDialog.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ height: "400px", width: "100%" }}>
            <iframe
              src={mapDialog.src}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMapDialog({ ...mapDialog, open: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventLocationPage;

export const getStaticProps = async () => {
  const title = "ASU Tempe Arizona Event Location | Opportunity Hack";
  const description = "Complete guide to Opportunity Hack events at Arizona State University Tempe campus. Find venue details, parking information, nearby hotels, and transportation options for judges, mentors, volunteers, and hackers.";
  
  return {
    props: {
      title,
      description,
      openGraphData: [
        {
          name: "title",
          property: "title", 
          content: title,
          key: "title"
        },
        {
          name: "og:title",
          property: "og:title",
          content: title,
          key: "ogtitle"
        },
        {
          name: "description",
          property: "description",
          content: description,
          key: "description"
        },
        {
          name: "og:description", 
          property: "og:description",
          content: description,
          key: "ogdescription"
        },
        {
          name: "og:type",
          property: "og:type",
          content: "website",
          key: "ogtype"
        },
        {
          name: "og:url",
          property: "og:url", 
          content: "https://ohack.dev/about/locations/asu-tempe-arizona",
          key: "ogurl"
        },
        {
          name: "og:image",
          property: "og:image",
          content: "https://cdn.ohack.dev/ohack.dev/locations/asu-tempe-venue.webp", 
          key: "ogimage"
        },
        {
          name: "twitter:card",
          property: "twitter:card",
          content: "summary_large_image",
          key: "twittercard"
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Opportunity Hack at ASU Tempe",
        "description": "Event venue for Opportunity Hack hackathons at Arizona State University Tempe campus",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "501 E Tyler Mall",
          "addressLocality": "Tempe",
          "addressRegion": "AZ", 
          "postalCode": "85281",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 33.4255,
          "longitude": -111.9400
        },
        "url": "https://ohack.dev/about/locations/asu-tempe-arizona"
      }
    },
  };
};