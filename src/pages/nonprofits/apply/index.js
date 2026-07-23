'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';
import ReCaptchaProvider from '../../../components/ReCaptchaProvider';
import {
  TextField, Button, FormControlLabel, Checkbox, Alert, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CodeIcon from '@mui/icons-material/Code';
import CloudIcon from '@mui/icons-material/Cloud';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SupportIcon from '@mui/icons-material/Support';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import * as ga from '../../../lib/ga';
import ScrollTracker from '../../../components/ScrollTracker';
import JourneyTracker, { JourneyTypes } from '../../../components/JourneyTracker';
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow, Stat } from '../../../components/design/refined';

// Debounce utility
const debounce = (func, delay) => {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Bot detection utilities
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  const disposableDomains = [
    "tempmail.com","throwaway.email","guerrillamail.com","mailinator.com",
    "10minutemail.com","trashmail.com","temp-mail.org","fakeinbox.com",
  ];
  const domain = email.split("@")[1]?.toLowerCase();
  return !disposableDomains.includes(domain);
};

const isValidTextInput = (text, fieldName, minLength = 2) => {
  if (!text || text.trim().length < minLength) return false;
  const trimmedText = text.trim();
  const maxLength = fieldName === 'idea' ? 2000 : 100;
  if (trimmedText.length > maxLength) return false;
  const consonantPattern = /[bcdfghjklmnpqrstvwxyz]{10,}/i;
  if (consonantPattern.test(trimmedText)) return false;
  const words = trimmedText.split(/\s+/);
  for (const word of words) {
    if (word.length > 15) {
      const uppercaseCount = (word.match(/[A-Z]/g) || []).length;
      const lowercaseCount = (word.match(/[a-z]/g) || []).length;
      if (uppercaseCount >= 4 && lowercaseCount >= 4) {
        let caseChanges = 0;
        for (let i = 1; i < word.length; i++) {
          const prevIsUpper = /[A-Z]/.test(word[i - 1]);
          const currIsUpper = /[A-Z]/.test(word[i]);
          if (prevIsUpper !== currIsUpper) caseChanges++;
        }
        if (caseChanges > word.length * 0.3) return false;
      }
    }
  }
  if (trimmedText.length > 8 && !/[aeiou]/i.test(trimmedText)) return false;
  if ((fieldName === 'name' || fieldName === 'organization') && trimmedText.length > 25) {
    if (!trimmedText.includes(' ')) return false;
  }
  if (fieldName !== 'idea') {
    const repetitivePattern = /(.{3,})\1{2,}/;
    if (repetitivePattern.test(trimmedText.replace(/\s/g, ''))) return false;
  }
  if (fieldName !== 'idea' && trimmedText.length <= 30) {
    const uniqueChars = new Set(trimmedText.toLowerCase().replace(/\s/g, ''));
    const charDiversityRatio = uniqueChars.size / Math.max(1, trimmedText.replace(/\s/g, '').length);
    if (charDiversityRatio < 0.25 && trimmedText.replace(/\s/g, '').length > 15) return false;
  }
  return true;
};

const BENEFITS = [
  { icon: <CodeIcon />, title: 'Free professional development', description: 'Skilled developers build your solution during our hackathons — zero development costs for you.' },
  { icon: <GroupWorkIcon />, title: 'Passionate tech volunteers', description: 'Work with experienced professionals who care about social impact and want to help nonprofits succeed.' },
  { icon: <CloudIcon />, title: 'Hosting support included', description: 'We cover hosting costs up to $20/month plus $250 for one-time setup — you focus on your mission.' },
  { icon: <SupportIcon />, title: 'Ongoing maintenance', description: 'Quarterly check-ins and volunteer network for urgent needs — we stay with you after launch.' },
  { icon: <SecurityIcon />, title: 'Open source & yours forever', description: 'MIT licensed code means you own it, can modify it, and use it however you need — no vendor lock-in.' },
  { icon: <MonetizationOnIcon />, title: '50% profit sharing', description: 'If we successfully sell your solution to others, you receive 50% of profits — free to use, potential revenue.' },
];

const PROCESS_STEPS = [
  { num: '01', icon: <AccessTimeIcon />, title: 'Apply in 5 minutes', description: 'Submit your project idea through our simple form below. No technical knowledge needed.' },
  { num: '02', icon: <CheckCircleOutlineIcon />, title: 'We review & respond', description: 'Our team reviews your application within 7 days and helps refine your project scope.' },
  { num: '03', icon: <CodeIcon />, title: 'Hackathon development', description: 'Skilled volunteers build your solution during a weekend hackathon event.' },
  { num: '04', icon: <TrendingUpIcon />, title: 'Launch & support', description: 'For winning teams we deploy the solution and provide ongoing quarterly check-ins.' },
];

const FAQS = [
  { question: 'Do I need to be a registered 501(c)(3) nonprofit?', answer: "No! While we prioritize registered nonprofits, we welcome all social good projects. Whether you're a community group, social enterprise, or individual with a mission-driven idea, we want to hear from you." },
  { question: "What if I'm not technical — can I still apply?", answer: "Absolutely! No technical expertise required. Our team will work with you to understand your needs and translate them into a technical solution. We'll guide you through the entire process in plain language." },
  { question: 'What types of projects do you accept?', answer: 'We accept a wide range: data management systems, volunteer coordination tools, donation tracking, event management platforms, community engagement apps, and more. If technology can help your mission, we want to help.' },
  { question: 'How much does this cost?', answer: "Zero upfront costs! Development is completely free. We cover initial hosting ($20/month + $250 one-time setup). As your project grows you may need to cover additional hosting costs, but we'll help you manage those." },
  { question: 'What happens after the hackathon?', answer: "We don't just build and leave! You get quarterly check-ins for maintenance, access to our volunteer network for urgent needs, and ongoing support to ensure your solution continues serving your mission." },
  { question: 'Can I see examples of past projects?', answer: "Yes! Check out our success stories page to see real nonprofits we've helped, including Matthews Crossing Food Bank (estimated $150K in savings), Zuri's Circle (improved community engagement), and many more." },
];

function Apply({ title, description, openGraphData }) {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({ name: '', email: '', organization: '', idea: '', isNonProfit: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastTrackedValues, setLastTrackedValues] = useState({ name: '', email: '', organization: '', idea: '', isNonProfit: false });
  const [formStartTime, setFormStartTime] = useState(null);
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [honeypot, setHoneypot] = useState('');
  const formInteractionStartTime = useRef(null);
  const submissionAttemptsRef = useRef(0);
  const lastSubmissionTimeRef = useRef(0);
  const formSectionRef = useRef(null);
  const [viewedSections, setViewedSections] = useState(new Set());

  useEffect(() => {
    ga.initFacebookPixel();
    setFormStartTime(new Date());
    const pageMetadata = { page_type: 'application_form', form_type: 'nonprofit_application', referrer: document.referrer || 'direct' };
    ga.trackJourneyStep(JourneyTypes.NONPROFIT.name, JourneyTypes.NONPROFIT.steps.VIEW_APPLY, pageMetadata);
    ga.trackStructuredEvent(ga.EventCategory.FORM, ga.EventAction.VIEW, 'nonprofit_application', null, pageMetadata);
    ga.trackForm('nonprofit_application', ga.EventAction.START, null, null);
    return () => {
      if (!submitSuccess && formStartTime) {
        const timeSpent = Math.round((new Date() - formStartTime) / 1000);
        ga.trackForm('nonprofit_application', 'abandon', null, timeSpent);
      }
    };
  }, []);

  const trackSectionView = useCallback((sectionName) => {
    if (!viewedSections.has(sectionName)) {
      setViewedSections(prev => new Set([...prev, sectionName]));
      ga.trackContentEngagement('page_section', sectionName, 'view', { page_type: 'nonprofit_application' });
    }
  }, [viewedSections]);

  const trackFormField = useCallback((fieldName, fieldValue, interactionType = 'change') => {
    ga.trackForm('nonprofit_application', interactionType, fieldName, typeof fieldValue === 'string' ? fieldValue.length : fieldValue);
  }, []);

  const debouncedTrackFieldChange = useCallback(
    debounce((fieldName, fieldValue) => {
      if (fieldValue !== lastTrackedValues[fieldName]) {
        trackFormField(fieldName, fieldValue);
        setLastTrackedValues(prev => ({ ...prev, [fieldName]: fieldValue }));
      }
    }, 800),
    [lastTrackedValues, trackFormField]
  );

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const fieldValue = name === 'isNonProfit' ? checked : value;
    if (!formInteractionStartTime.current) formInteractionStartTime.current = Date.now();
    if (fieldErrors[name]) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    if (formError) setFormError(null);
    setFormData(prev => ({ ...prev, [name]: fieldValue }));
    debouncedTrackFieldChange(name, fieldValue);
  };

  const handleIdeaChange = useCallback((e) => {
    const value = e.target.value;
    if (!formInteractionStartTime.current) formInteractionStartTime.current = Date.now();
    if (fieldErrors.idea) setFieldErrors(prev => { const n = { ...prev }; delete n.idea; return n; });
    if (formError) setFormError(null);
    setFormData(prev => ({ ...prev, idea: value }));
    const significantThresholds = [20, 50, 100, 200];
    const previousLength = formData.idea.length;
    const currentLength = value.length;
    const previousThreshold = significantThresholds.findIndex(t => previousLength < t);
    const currentThreshold = significantThresholds.findIndex(t => currentLength < t);
    if (previousThreshold !== currentThreshold && currentThreshold !== -1) {
      ga.trackForm('nonprofit_application', 'milestone', 'idea_length', significantThresholds[currentThreshold]);
    } else {
      debouncedTrackFieldChange('idea', value);
    }
  }, [formData.idea, debouncedTrackFieldChange, fieldErrors, formError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFieldErrors({});
    ga.trackForm('nonprofit_application', 'submit_attempt', null, null);
    try {
      if (honeypot) {
        setFormError('Something went wrong. Please try again.');
        setIsSubmitting(false);
        ga.trackError('bot_detection', 'honeypot_filled', 'nonprofit_application');
        return;
      }
      if (formInteractionStartTime.current) {
        const timeTaken = Date.now() - formInteractionStartTime.current;
        if (timeTaken < 3000) {
          setFormError('Please take your time filling out the form.');
          setIsSubmitting(false);
          ga.trackError('bot_detection', 'submission_too_quick', 'nonprofit_application');
          return;
        }
      }
      const now = Date.now();
      if (now - lastSubmissionTimeRef.current < 10000) {
        setFormError('Please wait a moment before submitting again.');
        setIsSubmitting(false);
        return;
      }
      if (submissionAttemptsRef.current >= 3) {
        setFormError('Too many attempts. Please refresh the page and try again.');
        setIsSubmitting(false);
        return;
      }
      const errors = {};
      if (!isValidEmail(formData.email)) errors.email = 'Please enter a valid email address';
      if (!isValidTextInput(formData.name, 'name', 2)) errors.name = 'Please enter a valid name (at least 2 characters, no random strings)';
      if (formData.organization && !isValidTextInput(formData.organization, 'organization', 2)) errors.organization = 'Please enter a valid organization name (no random strings)';
      if (!isValidTextInput(formData.idea, 'idea', 10)) errors.idea = 'Please provide a meaningful description of your idea (at least 10 characters)';
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setFormError('Please fix the errors in the form before submitting.');
        setIsSubmitting(false);
        ga.trackError('form_validation', 'invalid_fields', 'nonprofit_application');
        return;
      }
      if (!executeRecaptcha) {
        setFormError('reCAPTCHA not ready. Please try again in a moment.');
        setIsSubmitting(false);
        return;
      }
      const token = await executeRecaptcha('nonprofit_application_submit');
      if (!token) throw new Error('Failed to obtain reCAPTCHA token');
      submissionAttemptsRef.current += 1;
      lastSubmissionTimeRef.current = Date.now();
      const formDataWithToken = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        organization: formData.organization.trim(),
        idea: formData.idea.trim(),
        isNonProfit: formData.isNonProfit,
        token,
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/submit-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDataWithToken),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Network response was not ok');
      }
      const timeToComplete = formStartTime ? Math.round((new Date() - formStartTime) / 1000) : null;
      ga.trackForm('nonprofit_application', ga.EventAction.COMPLETE, null, timeToComplete);
      ga.trackJourneyStep(JourneyTypes.NONPROFIT.name, JourneyTypes.NONPROFIT.steps.SUBMIT_APPLICATION, {
        organization_provided: !!formData.organization,
        is_nonprofit: formData.isNonProfit,
        idea_length: formData.idea.length,
        time_to_complete: timeToComplete,
      });
      if (formData.email) ga.set(formData.email);
      setFormData({ name: '', email: '', organization: '', idea: '', isNonProfit: false });
      formInteractionStartTime.current = null;
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      ga.trackError('form_submission_error', error.message, 'nonprofit_application');
      setFormError(error.message || 'An error occurred while submitting the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    ga.trackStructuredEvent(ga.EventCategory.NAVIGATION, ga.EventAction.CLICK, 'scroll_to_form_cta', null, { cta_location: 'hero' });
    setTimeout(() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        {openGraphData.map((og) => (
          <meta key={og.key} name={og.name} property={og.property} content={og.content} />
        ))}
        <link rel="canonical" href="https://www.ohack.dev/nonprofits/apply" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Nonprofit and Social Good Project Application - Opportunity Hack",
            "description": "Submit your nonprofit project or social good idea for free software development support. Opportunity Hack connects innovators with skilled volunteers to create tech solutions for social impact.",
            "url": "https://www.ohack.dev/nonprofits/apply",
            "potentialAction": {
              "@type": "ApplyAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://www.ohack.dev/nonprofits/apply",
                "actionPlatform": ["http://schema.org/DesktopWebPlatform","http://schema.org/MobileWebPlatform"]
              },
              "result": { "@type": "CreativeWork", "name": "Nonprofit Project Application" }
            }
          }
        `}</script>
        <RefinedFonts />
      </Head>

      <JourneyTracker journey={JourneyTypes.NONPROFIT.name} step={JourneyTypes.NONPROFIT.steps.START_APPLICATION} />
      <ScrollTracker pageType="nonprofit_application" />

      <RefinedRoot>

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section
          className="ohx-wrap"
          style={{ paddingTop: 'clamp(104px, 13vh, 156px)', paddingBottom: 'clamp(28px, 5vh, 48px)' }}
        >
          <Eyebrow><span className="rise" style={{ display: 'inline-block' }}>Nonprofits · Apply</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: '18ch', animationDelay: '60ms' }}>
            Turn your vision <em className="ohx-italic">into impact.</em>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: '150ms' }}>
            Get free professional software development for your social impact project.
            We'll respond within 7 days — no technical expertise required.
          </p>

          {submitSuccess ? (
            <div
              className="rise ohx-card"
              style={{ marginTop: 32, padding: '28px 24px', borderLeft: '4px solid var(--brand)', background: 'var(--surface-2)', animationDelay: '230ms' }}
            >
              <p className="ohx-eyebrow" style={{ color: 'var(--brand)', marginBottom: 8 }}>Application received</p>
              <h2 className="ohx-display" style={{ fontSize: '1.4rem', marginBottom: 12 }}>Thank You for Applying!</h2>
              <p className="ohx-muted" style={{ margin: 0 }}>
                Our team will review your submission and respond within 7 days.
                Check your email (including spam folder) for our response from an @ohack.org address.
              </p>
            </div>
          ) : (
            <div className="rise" style={{ marginTop: 30, display: 'flex', flexWrap: 'wrap', gap: 14, animationDelay: '230ms' }}>
              <button className="ohx-btn ohx-btn--primary" onClick={scrollToForm}>
                Apply now — it&apos;s free <Arrow />
              </button>
              <a href="/about/success-stories" className="ohx-btn ohx-btn--ghost">See success stories</a>
            </div>
          )}

          {/* Stat strip */}
          <div
            className="rise"
            style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 'clamp(24px, 5vw, 48px)', animationDelay: '320ms', borderTop: '1px solid var(--line)', paddingTop: 32 }}
            onMouseEnter={() => trackSectionView('impact_stats')}
          >
            <Stat value="50+" label="Nonprofits helped" />
            <Stat value="200+" label="Volunteer developers" />
            <Stat value="$500K+" label="Value delivered" />
            <Stat value="10+" label="Years of impact" />
          </div>
        </section>

        {/* ── BENEFITS ─────────────────────────────────────────────── */}
        <section
          style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
          onMouseEnter={() => trackSectionView('key_benefits')}
        >
          <div className="ohx-wrap" style={{ paddingTop: 'clamp(48px, 7vh, 80px)', paddingBottom: 'clamp(48px, 7vh, 80px)' }}>
            <Eyebrow>What you get</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10, maxWidth: '24ch' }}>
              Everything to bring your solution to life
            </h2>
            <p className="ohx-muted" style={{ margin: '0 0 32px', maxWidth: '52ch' }}>
              Free development, hosting support, and a network of passionate volunteers — at no cost to you.
            </p>
            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {BENEFITS.map(({ icon, title, description }, i) => (
                <div key={i} className="ohx-card" style={{ padding: '24px 22px', background: 'var(--surface)' }}>
                  <span style={{ color: 'var(--brand)', display: 'block', marginBottom: 10 }}>{icon}</span>
                  <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.1rem', fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{title}</h3>
                  <p className="ohx-muted" style={{ margin: 0, fontSize: '0.96rem', lineHeight: 1.6 }}>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
        <section
          className="ohx-wrap"
          style={{ paddingTop: 'clamp(48px, 7vh, 80px)', paddingBottom: 'clamp(48px, 7vh, 80px)' }}
          onMouseEnter={() => trackSectionView('testimonials')}
        >
          <Eyebrow>Real results</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 32 }}>Real nonprofits, real outcomes</h2>
          <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="ohx-card" style={{ padding: '28px 24px', borderLeft: '3px solid var(--brand)' }}>
              <p style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--ink)', margin: '0 0 18px' }}>
                "Matthews Crossing Data Manager has transformed our operations. It's allowed us to redirect valuable volunteer time from paperwork to serving our community. The automated reports have given us new insights to better serve the 80,000 people we help each year."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>MC</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.93rem' }}>Matthews Crossing Food Bank</p>
                  <p className="ohx-faint" style={{ margin: 0, fontSize: '0.83rem' }}>Estimated $150K in time savings</p>
                </div>
              </div>
            </div>
            <div className="ohx-card" style={{ padding: '28px 24px', borderLeft: '3px solid var(--accent)' }}>
              <p style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--ink)', margin: '0 0 18px' }}>
                "Zuri's Dashboard has revolutionized how we interact with our community. It's not just about collecting emails anymore; it's about understanding our impact. This technology allows us to focus on what truly matters — helping families, the elderly, and the homeless."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>ZC</div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.93rem' }}>Zuri&apos;s Circle</p>
                  <p className="ohx-faint" style={{ margin: 0, fontSize: '0.83rem' }}>Streamlined event management and community engagement</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <a
              href="/about/success-stories"
              className="ohx-link"
              onClick={() => ga.trackStructuredEvent(ga.EventCategory.NAVIGATION, ga.EventAction.CLICK, 'view_success_stories', null, { source: 'nonprofit_application' })}
            >
              Read more success stories <Arrow />
            </a>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
        <section
          style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}
          onMouseEnter={() => trackSectionView('process_overview')}
        >
          <div className="ohx-wrap" style={{ paddingTop: 'clamp(48px, 7vh, 80px)', paddingBottom: 'clamp(48px, 7vh, 80px)' }}>
            <Eyebrow>How it works</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 10 }}>A simple four-step process</h2>
            <p className="ohx-muted" style={{ margin: '0 0 36px', maxWidth: '52ch' }}>From application to launch, we guide you every step of the way.</p>
            <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {PROCESS_STEPS.map(({ num, icon, title, description }) => (
                <div key={num} className="ohx-card" style={{ padding: '24px 22px', background: 'var(--surface)' }}>
                  <span style={{ fontFamily: 'var(--display)', fontSize: '2rem', color: 'var(--line)', fontWeight: 500, display: 'block', lineHeight: 1 }}>{num}</span>
                  <span style={{ color: 'var(--brand)', display: 'block', margin: '10px 0 8px' }}>{icon}</span>
                  <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.05rem', fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{title}</h3>
                  <p className="ohx-muted" style={{ margin: 0, fontSize: '0.93rem', lineHeight: 1.6 }}>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────── */}
        <section
          className="ohx-wrap"
          style={{ paddingTop: 'clamp(48px, 7vh, 80px)', paddingBottom: 'clamp(48px, 7vh, 80px)' }}
          onMouseEnter={() => trackSectionView('faq')}
        >
          <Eyebrow>Questions</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 32 }}>Common questions answered</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 760 }}>
            {FAQS.map((faq, index) => (
              <Accordion
                key={index}
                disableGutters
                elevation={0}
                sx={{
                  border: '1px solid var(--line)',
                  borderRadius: '8px !important',
                  '&:not(:last-child)': { marginBottom: '4px' },
                  '&::before': { display: 'none' },
                  backgroundColor: 'var(--surface)',
                }}
                onChange={(e, expanded) => {
                  if (expanded) ga.trackStructuredEvent(ga.EventCategory.CONTENT, 'expand', `faq_${index}`, null, { question: faq.question });
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ fontFamily: 'var(--body)', fontWeight: 600, fontSize: '1rem', color: 'var(--ink)', px: 2.5, py: 1.5 }}
                >
                  {faq.question}
                </AccordionSummary>
                <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0, color: 'var(--muted)', fontSize: '0.96rem', lineHeight: 1.65 }}>
                  {faq.answer}
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </section>

        {/* ── APPLICATION FORM ─────────────────────────────────────── */}
        <section
          ref={formSectionRef}
          className="ohx-wrap"
          style={{ paddingTop: 'clamp(32px, 5vh, 64px)', paddingBottom: 'clamp(48px, 7vh, 80px)', scrollMarginTop: 90 }}
          onMouseEnter={() => trackSectionView('application_form')}
        >
          {/* Trust signals */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 36 }}>
            {['Trusted by 50+ nonprofits', 'Secure & confidential', '10+ years of service', 'Completely free'].map((t) => (
              <span key={t} className="ohx-tag">{t}</span>
            ))}
          </div>

          <Eyebrow>Ready to get started?</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 6 }}>Apply now — it&apos;s free</h2>
          <p className="ohx-muted" style={{ margin: '0 0 32px' }}>Takes less than 5 minutes · Response within 7 days · Completely free</p>

          <div className="ohx-card" style={{ padding: 'clamp(24px, 4vw, 48px)', maxWidth: 760 }}>
            {!submitSuccess ? (
              <form onSubmit={handleSubmit}>
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                {formError && <Alert severity="error" sx={{ mb: 3 }}>{formError}</Alert>}

                <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                  <TextField
                    fullWidth label="Your Name *" name="name"
                    value={formData.name} onChange={handleChange}
                    required disabled={isSubmitting}
                    error={!!fieldErrors.name} helperText={fieldErrors.name || ''}
                    onFocus={() => trackFormField('name', formData.name, 'focus')}
                  />
                  <TextField
                    fullWidth label="Email Address *" name="email" type="email"
                    value={formData.email} onChange={handleChange}
                    required disabled={isSubmitting}
                    error={!!fieldErrors.email} helperText={fieldErrors.email || ''}
                    onFocus={() => trackFormField('email', formData.email, 'focus')}
                  />
                </div>

                <div style={{ marginTop: 20 }}>
                  <TextField
                    fullWidth label="Organization Name" name="organization"
                    value={formData.organization} onChange={handleChange}
                    disabled={isSubmitting}
                    error={!!fieldErrors.organization}
                    helperText={fieldErrors.organization || "Optional — leave blank if you're an individual"}
                    onFocus={() => trackFormField('organization', formData.organization, 'focus')}
                  />
                </div>

                <div style={{ marginTop: 20 }}>
                  <TextField
                    fullWidth label="Your Project Idea or Problem to Solve *"
                    name="idea" multiline rows={6}
                    value={formData.idea} onChange={handleIdeaChange}
                    required disabled={isSubmitting}
                    error={!!fieldErrors.idea}
                    helperText={fieldErrors.idea || 'Tell us about your challenge. What would you like to accomplish? Who would it help? No need to be technical — just describe your vision in your own words.'}
                    onFocus={() => trackFormField('idea', formData.idea, 'focus')}
                  />
                </div>

                <div style={{ marginTop: 16 }}>
                  <FormControlLabel
                    control={<Checkbox checked={formData.isNonProfit} onChange={handleChange} name="isNonProfit" disabled={isSubmitting} sx={{ color: 'var(--brand)', '&.Mui-checked': { color: 'var(--brand)' } }} />}
                    label={<span style={{ fontSize: '0.93rem', color: 'var(--muted)' }}>I represent a registered 501(c)(3) nonprofit organization (optional — we accept all social good projects)</span>}
                  />
                </div>

                <div style={{ marginTop: 28 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    fullWidth
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{
                      background: 'var(--brand)',
                      color: '#fff',
                      fontFamily: 'var(--body)',
                      fontWeight: 600,
                      fontSize: '1rem',
                      borderRadius: '4px',
                      padding: '0.95em 1.5em',
                      textTransform: 'none',
                      boxShadow: 'none',
                      '&:hover': { background: 'var(--brand-ink)', boxShadow: 'none' },
                      '&.Mui-disabled': { background: 'var(--line)', color: 'var(--faint)' },
                    }}
                  >
                    {isSubmitting ? 'Submitting your application…' : 'Submit your project application'}
                  </Button>
                  <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--faint)', marginTop: 12 }}>
                    By submitting, you agree to our terms. We'll respond within 7 days.
                  </p>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'var(--brand)', mb: 2 }} />
                <h3 style={{ fontFamily: 'var(--display)', fontSize: '1.5rem', fontWeight: 500, margin: '0 0 12px' }}>Thank You for Applying!</h3>
                <p className="ohx-muted" style={{ margin: '0 0 8px' }}>We've received your application and will review it carefully. You'll hear from us within 7 days.</p>
                <p className="ohx-faint" style={{ margin: 0, fontSize: '0.9rem' }}>Check your email (including spam folder) for our response.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── CONTACT CTA BAND ─────────────────────────────────────── */}
        <section style={{ background: 'var(--brand)', color: '#fff' }}>
          <div className="ohx-wrap" style={{ paddingTop: 'clamp(40px, 6vh, 64px)', paddingBottom: 'clamp(40px, 6vh, 64px)', textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)', fontWeight: 500, margin: '0 0 12px', color: '#fff' }}>
              Questions? We&apos;re here to help.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 24px', maxWidth: '50ch', marginInline: 'auto' }}>
              Not sure if your project is a good fit? Reach out and let&apos;s discuss how we can bring your vision to life.
            </p>
            <a
              href="/contact"
              className="ohx-btn ohx-btn--ghost"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={() => ga.trackStructuredEvent(ga.EventCategory.NAVIGATION, ga.EventAction.CLICK, 'contact_us', null, { source: 'nonprofit_application' })}
            >
              Contact us <Arrow />
            </a>
          </div>
        </section>

        {/* ── VIDEO ────────────────────────────────────────────────── */}
        <section
          className="ohx-wrap"
          style={{ paddingTop: 'clamp(48px, 7vh, 80px)', paddingBottom: 'clamp(48px, 7vh, 80px)' }}
          onMouseEnter={() => trackSectionView('video')}
        >
          <Eyebrow>See it in action</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 24 }}>See Opportunity Hack in action</h2>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, border: '1px solid var(--line)' }}>
            <iframe
              src="https://www.youtube.com/embed/Ia_xsX-318E"
              title="Opportunity Hack: Connecting Nonprofits with Tech Solutions"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              onLoad={() => ga.trackContentEngagement('video', 'intro_video', 'load', { page: 'nonprofit_application' })}
            />
          </div>
        </section>

      </RefinedRoot>
    </>
  );
}

export default function ApplyWithRecaptcha(props) {
  return (
    <ReCaptchaProvider>
      <Apply {...props} />
    </ReCaptchaProvider>
  );
}

export async function getStaticProps() {
  return {
    props: {
      title: "Apply for Opportunity Hack - Free Tech Solutions for Nonprofits",
      description: "Submit your nonprofit project for Opportunity Hack anytime. Get free software development support, connect with skilled tech volunteers, and benefit from 50% profit sharing on successful solutions.",
      openGraphData: [
        { name: "og:title", property: "og:title", content: "Apply Now: Opportunity Hack - Free Tech Solutions for Nonprofits", key: "ogtitle" },
        { name: "og:description", property: "og:description", content: "Submit your nonprofit project for Opportunity Hack! Get free software development, connect with skilled volunteers, and enjoy 50% profit sharing on successful solutions.", key: "ogdescription" },
        { name: "title", property: "title", content: "Apply Now: Opportunity Hack - Free Tech Solutions for Nonprofits", key: "title" },
        { name: "author", property: "author", content: "Opportunity Hack", key: "author" },
        { name: "image", property: "og:image", content: "https://www.ohack.dev/OHack_NonProfit_Application.png", key: "ognameimage" },
        { property: "og:image:width", content: "1200", key: "ogimagewidth" },
        { property: "og:image:height", content: "630", key: "ogimageheight" },
        { name: "url", property: "url", content: "https://www.ohack.dev/nonprofits/apply", key: "url" },
        { name: "org:url", property: "org:url", content: "https://www.ohack.dev/nonprofits/apply", key: "ogurl" },
        { name: "twitter:card", property: "twitter:card", content: "summary_large_image", key: "twittercard" },
        { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
        { name: "twitter:title", property: "twitter:title", content: "Apply Now: Opportunity Hack - Free Tech Solutions for Nonprofits", key: "twittertitle" },
        { name: "twitter:description", property: "twitter:description", content: "Submit your nonprofit project anytime! Get free software development, connect with skilled volunteers, and enjoy 50% profit sharing on successful solutions.", key: "twitterdesc" },
        { name: "twitter:image", property: "twitter:image", content: "https://www.ohack.dev/OHack_NonProfit_Application.png", key: "twitterimage" },
        { name: "twitter:image:alt", property: "twitter:image:alt", content: "Opportunity Hack logo for nonprofit applications", key: "twitterimagealt" },
        { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
      ],
    },
  };
}
