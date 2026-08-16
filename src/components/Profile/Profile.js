import React, { useState, useEffect, useMemo } from 'react';
import { useAuthInfo } from '@propelauth/react';
import {
  FormControl,
  TextField,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Grid,
  Box,
  CircularProgress,
  Skeleton,
  Tabs,
  Tab
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Link from "next/link";
import useProfileApi from "../../hooks/use-profile-api.js";
import usePrivacySettings from "../../hooks/use-privacy-settings.js";
import BadgesSection from "./Sections/BadgesSection";
import HackathonsSection from "./Sections/HackathonsSection";
import FeedbackSection from "./Sections/FeedbackSection";
import HeartsRewardsTab from "./Sections/HeartsRewardsTab";
import HeartsStatusStrip from "./HeartsStatusStrip";
import PrivacyToggle from "../../components/PrivacyToggle/PrivacyToggle";
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LoginOrRegister from '../LoginOrRegister/LoginOrRegister2';
import PersonIcon from '@mui/icons-material/Person';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GitHubIcon from '@mui/icons-material/GitHub';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LanguageIcon from '@mui/icons-material/Language';
import PortfolioTab from './Portfolio/PortfolioTab';
import ShareableGitHubContributions from './ShareableGitHubContributions';
import RaffleEntries from './RaffleEntries';
import CertificatesSection from './Sections/CertificatesSection';
import CustomSelect from './CustomSelect';
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";
import { initFacebookPixel, trackEvent, set } from '../../lib/ga';
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from "../design/refined";
import Head from "next/head";
import Moment from "react-moment";
import { useRouter } from 'next/router';


function getCertRepoName(url) {
  if (!url) return "Certificate";
  return url.replace(/\/$/, "").split("/").pop();
}

function formatCertDate(isoDate) {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return isoDate;
  }
}

function normalizeLinkedInUrl(raw) {
  const s = (raw || "").trim();
  if (!s) return "";
  const inMatch = s.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?#\s]+)\/?/i);
  if (inMatch) return `https://www.linkedin.com/in/${inMatch[1]}/`;
  if (!s.includes(".") && !s.includes("/")) return `https://www.linkedin.com/in/${s}/`;
  const relMatch = s.match(/^\/?in\/([^/?#\s]+)/i);
  if (relMatch) return `https://www.linkedin.com/in/${relMatch[1]}/`;
  return s;
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `profile-tab-${index}`,
    'aria-controls': `profile-tabpanel-${index}`,
  };
}

function PanelHeader({ eyebrow, title, children }) {
  return (
    <header style={{ marginBottom: 24 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="ohx-display" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", margin: "8px 0 6px" }}>
        {title}
      </h2>
      {children && (
        <p className="ohx-muted" style={{ margin: 0, maxWidth: "60ch" }}>{children}</p>
      )}
    </header>
  );
}

export default function Profile() {
  const { isLoggedIn, user } = useAuthInfo();
  const { badges, hackathons, profile, feedback_url, update_profile_metadata, isLoading } =
    useProfileApi({});
  const { privacySettings, togglePrivacySetting, isLoading: privacyLoading } = usePrivacySettings();
  const theme = useTheme();
  const [githubHistory, setGithubHistory] = useState([]);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [userCerts, setUserCerts] = useState([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState({});
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeTab, setActiveTab] = useState(0);

  const [role, setRole] = React.useState("");
  const [expertise, setExpertise] = React.useState([]);
  const [education, setEducation] = React.useState("");
  const [shirtSize, setShirtSize] = React.useState("");
  const [linkedInUrl, setLinkedInUrl] = React.useState("");
  const [instagramUrl, setInstagramUrl] = React.useState("");
  const [why, setWhy] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [lastGithubUpdate, setLastGithubUpdate] = React.useState(0);
  const [lastCompanyUpdate, setLastCompanyUpdate] = React.useState(0);
  const [lastWhyUpdate, setLastWhyUpdate] = React.useState(0);
  const [company, setCompany] = React.useState("");
  const [streetAddress, setStreetAddress] = React.useState("");
  const [streetAddress2, setStreetAddress2] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [postalCode, setPostalCode] = React.useState("");
  const [country, setCountry] = React.useState("United States");
  const [lastAddressUpdate, setLastAddressUpdate] = React.useState(0);
  const [wantStickers, setWantStickers] = React.useState(false);

  const formTheme = useMemo(
    () => createTheme(theme, {
      palette: {
        primary:   { main: "#1B3A6B", dark: "#0E2547", light: "#E8EDF5", contrastText: "#fff" },
        secondary: { main: "#E2552E", contrastText: "#fff" },
      },
      shape: { borderRadius: 8 },
    }),
    [theme]
  );

  React.useEffect(() => {
    if (!profile) return;
    setInstagramUrl(profile?.instagram_url);
    setLinkedInUrl(profile?.linkedin_url);
    setRole(profile?.role);
    setEducation(profile?.education);
    setShirtSize(profile?.shirt_size || "");
    setWhy(profile?.why);
    setGithub(profile?.github);
    setCompany(profile?.company);
    setStreetAddress(profile?.street_address || "");
    setStreetAddress2(profile?.street_address_2 || "");
    setCity(profile?.city || "");
    setState(profile?.state || "");
    setPostalCode(profile?.postal_code || "");
    setCountry(profile?.country || "United States");
    setWantStickers(profile?.want_stickers || false);
    if (profile?.expertise) setExpertise(profile?.expertise);
    initFacebookPixel();
    if (user && user.email) set(user.email);
  }, [profile]);

  useEffect(() => {
    const hashTabMap = {
      '#basic': 0, '#impact': 1, '#github': 2,
      '#swag': 3, '#volunteer': 4, '#giveaways': 5,
      '#portfolio': 6,
      // Tab 1 was renamed Impact -> Hearts (Aug 2026). '#hearts' is the
      // canonical hash now; '#impact' stays as a legacy alias for old links.
      '#hearts': 1,
    };
    if (router.asPath.includes('#')) {
      const hash = `#${router.asPath.split('#')[1]}`;
      if (hashTabMap[hash] !== undefined) setActiveTab(hashTabMap[hash]);
    }
  }, [router.asPath]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const tabNames = ['basic', 'hearts', 'github', 'swag', 'volunteer', 'giveaways', 'portfolio'];
    trackEvent({ action: 'profile_tab_change', params: { event_label: tabNames[newValue], page: 'profile' } });
    const tabHashMap = { 0: 'basic', 1: 'hearts', 2: 'github', 3: 'swag', 4: 'volunteer', 5: 'giveaways', 6: 'portfolio' };
    router.push(`/profile#${tabHashMap[newValue]}`, undefined, { shallow: true });
  };

  useEffect(() => {
    if (github) {
      const url = `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/profile/github/${github}`;
      setIsGithubLoading(true);
      fetch(url)
        .then((r) => r.json())
        .then((data) => { setGithubHistory(data.github_history || []); })
        .catch((err) => { console.error("Error fetching GitHub history", err); })
        .finally(() => { setIsGithubLoading(false); });
    }
  }, [github]);

  // TODO(refined): add a backend GET /api/certificates?github=<username> so we don't fetch all certs and filter client-side
  useEffect(() => {
    if (!github) { setUserCerts([]); return; }
    setCertsLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/certificates/recent`)
      .then((r) => r.json())
      .then((data) => {
        const all = data.certs || [];
        const mine = all.filter((c) =>
          (c.author_email || "").toLowerCase().includes(`+${github.toLowerCase()}@`)
        );
        setUserCerts(mine);
      })
      .catch(() => { setUserCerts([]); })
      .finally(() => { setCertsLoading(false); });
  }, [github]);

  const expertiseOptions = [
    { value: "Software Engineering", label: "Software Engineering" },
    { value: "Software Engineering: Front-end", label: "Software Engineering: Front-end (CSS/JS, Node, Angular, React, etc)" },
    { value: "Software Engineering: Back-end", label: "Software Engineering: Back-end (Java, Python, Ruby, etc)" },
    { value: "Software Engineering: Mobile", label: "Software Engineering: Mobile (iOS, Android)" },
    { value: "Software Engineering: Data Science & Machine Learning", label: "Software Engineering: Data Science & Machine Learning" },
    { value: "DevOps", label: "DevOps: AWS, Fly.io, Google Cloud, Heroku" },
    { value: "GitHub ninja", label: "GitHub ninja" },
    { value: "Product Management", label: "Product Management" },
    { value: "Project Manager", label: "Project Manager" },
    { value: "User Experience", label: "User Experience" },
    { value: "Data Science", label: "Data Science" },
    { value: "Data Analysis", label: "Data Analysis" },
    { value: "Nonprofit Mindset", label: "Nonprofit Mindset" },
    { value: "Marketing", label: "Marketing" },
    { value: "Business", label: "Business" },
    { value: "Finance", label: "Finance" },
  ];

  const roleOptions = [
    { value: "", label: "Select a role" },
    { value: "hacker_in_school", label: "Hacker (In School)" },
    { value: "hacker_pro", label: "Hacker (working in industry)" },
    { value: "mentor", label: "Mentor" },
    { value: "volunteer", label: "Volunteer" },
    { value: "judge", label: "Judge" },
    { value: "nonprofit", label: "Nonprofit" },
    { value: "sponsor", label: "Sponsor" },
    { value: "organizer", label: "Organizer" },
  ];

  const educationOptions = [
    { value: "", label: "Select a level of education" },
    { value: "high-school", label: "High School" },
    { value: "some-college", label: "Some College" },
    { value: "completed-undergraduate-school", label: "Completed Undergraduate" },
    { value: "some-graduate-school", label: "Some Graduate School" },
    { value: "completed-graduate-school", label: "Completed Graduate School" },
    { value: "coding-bootcamp", label: "Some Coding Bootcamp" },
    { value: "completed-coding-bootcamp", label: "Completed Coding Bootcamp" },
    { value: "other", label: "Other" },
  ];

  const shirtSizeOptions = [
    { value: "", label: "Select a shirt size" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "x-large", label: "X-Large" },
    { value: "xx-large", label: "XX-Large" },
    { value: "xxx-large", label: "XXX-Large" },
  ];

  const countryOptions = [
    { value: "United States", label: "United States" },
    { value: "Canada", label: "Canada" },
    { value: "Mexico", label: "Mexico" },
    { value: "United Kingdom", label: "United Kingdom" },
    { value: "Australia", label: "Australia" },
    { value: "India", label: "India" },
    { value: "Other", label: "Other" },
  ];

  const onRoleChange = (event) => {
    setIsSaving({...isSaving, role: true});
    const onComplete = () => { setIsSaving({...isSaving, role: false}); };
    update_profile_metadata({ role: event.target.value }, onComplete);
    setRole(event.target.value);
  };

  const handleExpertiseChange = (event) => {
    const { target: { value } } = event;
    const toSet = typeof value === "string" ? value.split(",") : value;
    setExpertise(toSet);
    update_profile_metadata({ expertise: toSet }, () => {});
  };

  const handleEducationChange = (event) => {
    setIsSaving({...isSaving, education: true});
    const onComplete = () => { setIsSaving({...isSaving, education: false}); };
    update_profile_metadata({ education: event.target.value }, onComplete);
    setEducation(event.target.value);
  };

  const handleShirtSizeChange = (event) => {
    setIsSaving({...isSaving, shirtSize: true});
    const onComplete = () => { setIsSaving({...isSaving, shirtSize: false}); };
    update_profile_metadata({ shirt_size: event.target.value }, onComplete);
    setShirtSize(event.target.value);
  };

  const handleCompanyChange = (event) => {
    setCompany(event.target.value);
    clearTimeout(lastCompanyUpdate);
    setLastCompanyUpdate(
      setTimeout(() => { update_profile_metadata({ company: event.target.value }, () => {}); }, 2000)
    );
  };

  const handleGithubChange = (event) => {
    setGithub(event.target.value);
    clearTimeout(lastGithubUpdate);
    setLastGithubUpdate(
      setTimeout(() => { update_profile_metadata({ github: event.target.value }, () => {}); }, 2000)
    );
  };

  const handleWhyChange = (event) => {
    setWhy(event.target.value);
    clearTimeout(lastWhyUpdate);
    setLastWhyUpdate(
      setTimeout(() => { update_profile_metadata({ why: event.target.value }, () => {}); }, 2000)
    );
  };

  const handleLinkedInChange = (event) => { setLinkedInUrl(event.target.value); };

  const handleLinkedInBlur = () => {
    const normalized = normalizeLinkedInUrl(linkedInUrl);
    if (normalized !== linkedInUrl) setLinkedInUrl(normalized);
    update_profile_metadata({ linkedin_url: normalized }, () => {});
  };

  const handleInstagramChange = (event) => {
    setInstagramUrl(event.target.value);
    update_profile_metadata({ instagram_url: event.target.value }, () => {});
  };

  const handleAddressChange = (field, setter) => (event) => {
    setter(event.target.value);
    clearTimeout(lastAddressUpdate);
    setLastAddressUpdate(
      setTimeout(() => {
        update_profile_metadata({
          street_address: field === "street_address" ? event.target.value : streetAddress,
          street_address_2: field === "street_address_2" ? event.target.value : streetAddress2,
          city: field === "city" ? event.target.value : city,
          state: field === "state" ? event.target.value : state,
          postal_code: field === "postal_code" ? event.target.value : postalCode,
          country: field === "country" ? event.target.value : country,
        }, () => {});
      }, 2000)
    );
  };

  const handleStickersChange = (event) => {
    const checked = event.target.checked;
    setWantStickers(checked);
    update_profile_metadata({ want_stickers: checked }, () => {});
  };

  const LoadingOverlay = ({ field, children }) => {
    if (isSaving[field]) {
      return (
        <Box sx={{ position: 'relative' }}>
          {children}
          <Box sx={{ position: 'absolute', top: 0, right: 10, height: '100%', display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={20} />
          </Box>
        </Box>
      );
    }
    return children;
  };

  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>Your profile — Opportunity Hack</title>
          <RefinedFonts />
        </Head>
        <RefinedRoot>
          <section className="ohx-wrap" style={{ paddingTop: "clamp(120px,16vh,180px)", paddingBottom: 120 }}>
            <Eyebrow>Your profile</Eyebrow>
            <h1 className="ohx-display" style={{ fontSize: "clamp(2rem,4vw,3rem)", marginTop: 14 }}>
              Sign in to manage your profile
            </h1>
            <p className="ohx-lead" style={{ marginTop: 14, marginBottom: 28 }}>
              Your Opportunity Hack profile tracks your impact, badges, and hackathon history.
            </p>
            <LoginOrRegister introText="Ready to join us?" previousPage="/profile" />
          </section>
        </RefinedRoot>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Your profile — Opportunity Hack</title>
        <meta name="robots" content="noindex" />
        <RefinedFonts />
      </Head>
      <RefinedRoot>
        <ThemeProvider theme={formTheme}>

          {/* Masthead */}
          <section className="ohx-wrap" style={{ paddingTop: "clamp(100px,12vh,148px)", paddingBottom: 32 }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Skeleton variant="circular" width={80} height={80} />
                <Box>
                  <Skeleton variant="text" width={280} height={56} />
                  <Skeleton variant="text" width={200} height={20} />
                  <Skeleton variant="text" width={160} height={20} />
                </Box>
              </Box>
            ) : (
              <>
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  gap: { xs: 2, sm: 3 },
                }}>
                  <img
                    src={user?.pictureUrl}
                    alt={`${user?.firstName} ${user?.lastName}`}
                    width={isMobile ? 64 : 80}
                    height={isMobile ? 64 : 80}
                    style={{ borderRadius: '50%', border: '1px solid var(--line)', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Eyebrow>Your profile</Eyebrow>
                    <h1 className="ohx-display" style={{ fontSize: isMobile ? "1.7rem" : "clamp(2rem,4vw,3rem)", margin: "8px 0 4px" }}>
                      {user?.firstName} {user?.lastName}{' '}
                      <VerifiedUserIcon sx={{ color: '#1B3A6B', verticalAlign: 'middle' }} fontSize={isMobile ? "medium" : "large"} />
                    </h1>
                    <p style={{ margin: '0 0 2px', color: 'var(--muted)', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>
                      {user?.email}
                    </p>
                    <p style={{ margin: 0, color: 'var(--faint)', fontSize: '0.9rem' }}>
                      Member since <Moment fromNow>{user?.createdAt * 1000}</Moment>
                    </p>
                  </Box>
                </Box>

                <Box sx={{
                  mt: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  gap: 2,
                  flexWrap: 'wrap',
                }}>
                  <Link href={profile?.profile_url || '#'} className="ohx-btn ohx-btn--primary">
                    View public profile <Arrow />
                  </Link>
                  <HeartsStatusStrip
                    history={profile?.history}
                    onOpenHearts={() => {
                      setActiveTab(1);
                      router.push('/profile#hearts', undefined, { shallow: true });
                    }}
                  />
                </Box>
              </>
            )}
          </section>

          {/* Sticky tab bar */}
          <Box sx={{
            position: 'sticky',
            top: 64,
            zIndex: 5,
            backgroundColor: 'var(--paper)',
            borderBottom: '1px solid var(--line)',
          }}>
            <Box className="ohx-wrap">
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                textColor="primary"
                indicatorColor="secondary"
                aria-label="profile sections"
                sx={{
                  minHeight: 56,
                  '& .MuiTabs-indicator': { height: 3 },
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontFamily: 'var(--body)',
                    fontWeight: 600,
                    color: 'var(--muted)',
                    minHeight: 56,
                    '&.Mui-selected': { color: 'var(--brand)' },
                  },
                }}
              >
                <Tab icon={<PersonIcon />} label={isMobile ? undefined : "Basic Info"} title="Basic Info" {...a11yProps(0)} />
                <Tab icon={<FavoriteIcon />} label={isMobile ? undefined : "Hearts"} title="Hearts" {...a11yProps(1)} />
                <Tab icon={<GitHubIcon />} label={isMobile ? undefined : "GitHub"} title="GitHub" {...a11yProps(2)} />
                <Tab icon={<LocalShippingIcon />} label={isMobile ? undefined : "Swag & Shipping"} title="Swag & Shipping" {...a11yProps(3)} />
                <Tab icon={<VolunteerActivismIcon />} label={isMobile ? undefined : "Volunteer History"} title="Volunteer History" {...a11yProps(4)} />
                <Tab icon={<CardGiftcardIcon />} label={isMobile ? undefined : "Giveaway Entries"} title="Giveaway Entries" {...a11yProps(5)} />
                <Tab icon={<LanguageIcon />} label={isMobile ? undefined : "Portfolio"} title="Portfolio" {...a11yProps(6)} />
              </Tabs>
            </Box>
          </Box>

          {/* Tab panels */}
          <Box className="ohx-wrap" sx={{ py: { xs: 3, sm: 5 } }}>

            {/* Tab 0 — Basic Info */}
            <TabPanel value={activeTab} index={0}>
              <PanelHeader eyebrow="Basic info" title="Tell us about yourself">
                Tell us more about yourself and why you're here with Opportunity Hack.
              </PanelHeader>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3, color: 'var(--muted)', fontSize: '0.9rem' }}>
                <span>Visibility:</span>
                <span>🔒 Private — only you</span>
                <span>🔓 Public — shows on your{' '}
                  <Link href={profile?.profile_url || '#'} className="ohx-link">public profile</Link>
                </span>
              </Box>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={56} />
                  ) : (
                    <LoadingOverlay field="role">
                      <CustomSelect label="What hat are you currently wearing?" value={role} onChange={onRoleChange} options={roleOptions} id="role-select" />
                      <Box sx={{ mt: 0.75 }}>
                        <PrivacyToggle field="role" isPrivate={privacySettings.role !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                      </Box>
                    </LoadingOverlay>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <TextField id="github" onChange={handleGithubChange} label="GitHub username (not email)" value={github || ""} fullWidth variant="outlined" InputLabelProps={{ shrink: Boolean(github) }} />
                  </FormControl>
                  <Box sx={{ mt: 0.75 }}>
                    <PrivacyToggle field="github" isPrivate={privacySettings.github !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={56} />
                  ) : (
                    <LoadingOverlay field="education">
                      <CustomSelect label="Level of Education" value={education} onChange={handleEducationChange} options={educationOptions} id="education-select" />
                      <Box sx={{ mt: 0.75 }}>
                        <PrivacyToggle field="education" isPrivate={privacySettings.education !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                      </Box>
                    </LoadingOverlay>
                  )}
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <TextField id="company" onChange={handleCompanyChange} label="Company (if working)" value={company || ""} fullWidth variant="outlined" InputLabelProps={{ shrink: Boolean(company) }} />
                  </FormControl>
                  <Box sx={{ mt: 0.75 }}>
                    <PrivacyToggle field="company" isPrivate={privacySettings.company !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <TextField
                      id="linkedin"
                      onChange={handleLinkedInChange}
                      onBlur={handleLinkedInBlur}
                      label="LinkedIn Profile URL"
                      value={linkedInUrl || ""}
                      fullWidth
                      variant="outlined"
                      placeholder="gregvannoni or linkedin.com/in/gregvannoni"
                      InputLabelProps={{ shrink: true }}
                      helperText="Enter your username, linkedin.com/in/… or a full URL — we'll format it automatically"
                    />
                  </FormControl>
                  <Box sx={{ mt: 0.75 }}>
                    <PrivacyToggle field="linkedin_url" isPrivate={privacySettings.linkedin_url !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <TextField id="instagram" onChange={handleInstagramChange} label="Instagram Profile URL" value={instagramUrl || ""} fullWidth variant="outlined" InputLabelProps={{ shrink: Boolean(instagramUrl) }} />
                  </FormControl>
                  <Box sx={{ mt: 0.75 }}>
                    <PrivacyToggle field="instagram_url" isPrivate={privacySettings.instagram_url !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <TextField id="why" onChange={handleWhyChange} label="Why are you here with us at OHack?" value={why || ""} multiline rows={2} fullWidth variant="outlined" InputLabelProps={{ shrink: Boolean(why) }} />
                  </FormControl>
                  <Box sx={{ mt: 0.75 }}>
                    <PrivacyToggle field="why" isPrivate={privacySettings.why !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={80} />
                  ) : (
                    <LoadingOverlay field="expertise">
                      <CustomSelect label="Areas of Expertise" value={expertise} onChange={handleExpertiseChange} options={expertiseOptions} id="expertise-select" multiple />
                      <Box sx={{ mt: 0.75 }}>
                        <PrivacyToggle field="expertise" isPrivate={privacySettings.expertise !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                      </Box>
                    </LoadingOverlay>
                  )}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 1 — Hearts (rewards status; was "Impact") */}
            <TabPanel value={activeTab} index={1}>
              <PanelHeader eyebrow="Hearts & rewards" title="Your rewards status">
                Hearts are how we recognize the impact you create for nonprofits —
                they unlock real rewards as you climb tiers.
              </PanelHeader>
              <HeartsRewardsTab
                profile={profile}
                isLoading={isLoading}
                onOpenGiveaways={() => {
                  setActiveTab(5);
                  router.push('/profile#giveaways', undefined, { shallow: true });
                }}
              />
            </TabPanel>

            {/* Tab 2 — GitHub Contributions & Certificates */}
            <TabPanel value={activeTab} index={2}>
              <PanelHeader eyebrow="GitHub" title="GitHub Contributions & Certificates">
                Your code contributions to nonprofits through Opportunity Hack, and the certificates recognizing them.
              </PanelHeader>
              {!github ? (
                <p className="ohx-muted" style={{ fontSize: '0.95rem' }}>
                  Set your GitHub username on the{' '}
                  <button
                    onClick={() => { setActiveTab(0); router.push('/profile#basic', undefined, { shallow: true }); }}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--brand)', fontWeight: 600, textDecoration: 'underline', fontSize: 'inherit' }}
                  >
                    Basic Info tab
                  </button>
                  {' '}to see your certificates here.
                </p>
              ) : certsLoading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                // TODO(refined): CertificatesSection internals use Paper — upgrade to .ohx-card treatment when time allows
                <CertificatesSection
                  certificates={userCerts.map((c) => ({
                    id: c.file_id,
                    title: getCertRepoName(c.repository_url),
                    issued_date: formatCertDate(c.date),
                    certificate_url: c.certificate_url,
                  }))}
                  mode="private"
                />
              )}
              {github && (
                <Box sx={{ mt: 3 }}>
                  {isLoading || isGithubLoading ? (
                    <Skeleton variant="rectangular" height={180} />
                  ) : (
                    <div className="ohx-card" style={{ padding: 24 }}>
                      <ShareableGitHubContributions githubHistory={githubHistory} userName={github} />
                    </div>
                  )}
                </Box>
              )}
              <Box sx={{ mt: 3 }}>
                <Link href="/cert" className="ohx-link">
                  Browse all GitHub certificates <Arrow />
                </Link>
              </Box>
            </TabPanel>

            {/* Tab 3 — Swag & Shipping */}
            <TabPanel value={activeTab} index={3}>
              <PanelHeader eyebrow="Swag & shipping" title="Swag & Shipping Information">
                We occasionally send swag to our active members. Please provide your shipping details if you'd like to receive some OHack goodies!
              </PanelHeader>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  {isLoading ? (
                    <Skeleton variant="rectangular" height={56} />
                  ) : (
                    <LoadingOverlay field="shirtSize">
                      <CustomSelect label="T-Shirt Size" value={shirtSize} onChange={handleShirtSizeChange} options={shirtSizeOptions} id="shirt-size-select" />
                    </LoadingOverlay>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    control={<Checkbox checked={wantStickers} onChange={handleStickersChange} color="primary" />}
                    label="I'd like to receive OHack stickers too!"
                  />
                </Grid>
              </Grid>

              <h3 className="ohx-display" style={{ fontSize: "clamp(1.3rem,2.2vw,1.7rem)", margin: "32px 0 16px" }}>
                Shipping Address
              </h3>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <TextField id="street_address" label="Street Address" value={streetAddress || ""} onChange={handleAddressChange("street_address", setStreetAddress)} fullWidth variant="outlined" InputLabelProps={{ shrink: Boolean(streetAddress) }} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <TextField id="street_address_2" label="Apartment, suite, etc. (optional)" value={streetAddress2 || ""} onChange={handleAddressChange("street_address_2", setStreetAddress2)} fullWidth variant="outlined" InputLabelProps={{ shrink: Boolean(streetAddress2) }} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <TextField id="city" label="City" value={city || ""} onChange={handleAddressChange("city", setCity)} fullWidth variant="outlined" InputLabelProps={{ shrink: Boolean(city) }} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <TextField id="state" label="State/Province" value={state || ""} onChange={handleAddressChange("state", setState)} fullWidth variant="outlined" InputLabelProps={{ shrink: Boolean(state) }} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl fullWidth>
                    <TextField id="postal_code" label="Postal/ZIP Code" value={postalCode || ""} onChange={handleAddressChange("postal_code", setPostalCode)} fullWidth variant="outlined" InputLabelProps={{ shrink: Boolean(postalCode) }} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <CustomSelect label="Country" value={country} onChange={handleAddressChange("country", setCountry)} options={countryOptions} id="country-select" />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 4 — Volunteer History */}
            <TabPanel value={activeTab} index={4}>
              <PanelHeader eyebrow="Volunteer history" title="Your Volunteer History" />

              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <h3 className="ohx-display" style={{ fontSize: "clamp(1.3rem,2.2vw,1.7rem)", margin: 0 }}>Badges</h3>
                  <PrivacyToggle field="badges" isPrivate={privacySettings.badges !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                </Box>
                {isLoading ? <Skeleton variant="rectangular" height={100} /> : <BadgesSection badges={badges} mode="private" />}
              </Box>

              <hr className="ohx-rule" />

              <Box sx={{ mb: 4, mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <h3 className="ohx-display" style={{ fontSize: "clamp(1.3rem,2.2vw,1.7rem)", margin: 0 }}>Hackathons</h3>
                  <PrivacyToggle field="hackathon_history" isPrivate={privacySettings.hackathon_history !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                </Box>
                <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 16, fontSize: '0.95rem' }}>
                  We've tried our best to keep track of each time you've volunteered, mentored, or judged a hackathon. If anything is missing, please let us know on Slack!
                </p>
                {isLoading ? <Skeleton variant="rectangular" height={150} /> : <HackathonsSection hackathons={hackathons} mode="private" />}
              </Box>

              <hr className="ohx-rule" />

              <Box sx={{ mb: 4, mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <h3 className="ohx-display" style={{ fontSize: "clamp(1.3rem,2.2vw,1.7rem)", margin: 0 }}>Feedback Exchange</h3>
                  <PrivacyToggle field="feedback" isPrivate={privacySettings.feedback !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                </Box>
                <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 16, fontSize: '0.95rem' }}>
                  Feedback you've given and received from the community.
                </p>
                <FeedbackSection feedbackUrl={feedback_url} history={profile?.history} showCta={false} />
              </Box>

              <hr className="ohx-rule" />

              <Box sx={{ mb: 4, mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <h3 className="ohx-display" style={{ fontSize: "clamp(1.3rem,2.2vw,1.7rem)", margin: 0 }}>Praises Received</h3>
                  <PrivacyToggle field="praises" isPrivate={privacySettings.praises !== 'public'} onToggle={togglePrivacySetting} size="small" disabled={privacyLoading} />
                </Box>
                <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 8, fontSize: '0.95rem' }}>
                  Praises sent to you in Slack appear on your public profile when set to public.
                  View all praises on the{' '}
                  <Link href="/praise" className="ohx-link">community praise board</Link>.
                </p>
              </Box>

              <hr className="ohx-rule" />

              <Box sx={{ mt: 4 }}>
                <h3 className="ohx-display" style={{ fontSize: "clamp(1.3rem,2.2vw,1.7rem)", marginBottom: 12 }}>Summer Internships</h3>
                <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 16, fontSize: '0.95rem' }}>
                  These are distinctly different than hackathons as they span over a couple months.
                </p>
                <HelpUsBuildOHack
                  github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/8"
                  github_name="Issue #8"
                />
              </Box>
            </TabPanel>

            {/* Tab 5 — Giveaway Entries */}
            <TabPanel value={activeTab} index={5}>
              <PanelHeader eyebrow="Giveaways" title="Giveaway Entries" />

              <div className="ohx-card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 className="ohx-display" style={{ fontSize: "clamp(1.3rem,2.2vw,1.7rem)", marginBottom: 16 }}>
                  Your Entries
                </h3>
                {isLoading ? (
                  <Skeleton variant="rectangular" height={180} />
                ) : (
                  <RaffleEntries profile={profile} githubHistory={githubHistory} />
                )}
              </div>

              <h3 className="ohx-display" style={{ fontSize: "clamp(1.3rem,2.2vw,1.7rem)", margin: "0 0 16px" }}>
                How to Earn More Entries
              </h3>
              <Box component="ul" sx={{ pl: 2, color: 'var(--muted)' }}>
                <Box component="li" sx={{ mb: 1 }}>Contribute to Opportunity Hack projects on GitHub</Box>
                <Box component="li" sx={{ mb: 1 }}>Participate in hackathons as a hacker, mentor, or judge</Box>
                <Box component="li" sx={{ mb: 1 }}>Complete your profile information</Box>
                <Box component="li">Refer other volunteers to join Opportunity Hack</Box>
              </Box>
            </TabPanel>

            {/* Tab 6 — Portfolio */}
            <TabPanel value={activeTab} index={6}>
              <PanelHeader eyebrow="Portfolio" title="Your public portfolio">
                One shareable page with your demo videos, certificates, GitHub work, praise, and hearts —
                private by default, yours to publish.
              </PanelHeader>
              <PortfolioTab
                profile={profile}
                update_profile_metadata={update_profile_metadata}
                privacySettings={privacySettings}
                togglePrivacySetting={togglePrivacySetting}
                privacyLoading={privacyLoading}
                isLoading={isLoading}
              />
            </TabPanel>

          </Box>
        </ThemeProvider>
      </RefinedRoot>
    </>
  );
}
