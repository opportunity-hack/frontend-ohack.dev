import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import HearingIcon from '@mui/icons-material/Hearing';
import PublicIcon from '@mui/icons-material/Public';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import { RefinedRoot, RefinedFonts, Eyebrow, Arrow } from '../../../components/design/refined';

const CORE_VALUES = [
  {
    icon: <EmojiPeopleIcon />,
    title: 'Be a good person',
    body: 'Treat others with kindness, respect, and empathy. Your actions should contribute positively to the hackathon community and beyond.',
  },
  {
    icon: <HearingIcon />,
    title: 'Listen to others',
    body: 'Value diverse perspectives. Practice active listening and stay open to ideas and feedback from all participants, regardless of background or experience level.',
  },
  {
    icon: <PublicIcon />,
    title: 'Help humanity move forward',
    body: 'Focus on solutions that have a positive impact on society. Consider the ethical implications of your work and strive to contribute to the greater good.',
  },
  {
    icon: <AccessibilityNewIcon />,
    title: 'Embrace diversity & inclusion',
    body: 'Celebrate the diversity of our participants. Ensure everyone, regardless of ability or background, has an equal opportunity to participate and contribute.',
  },
];

const ACCOMMODATIONS = [
  'If you require specific accommodations (assistive technologies, sign language interpreters, mobility assistance, dietary needs), let us know during registration or via our contact page. We\'ll do our best to accommodate you.',
  'All venues we select are wheelchair accessible, and we provide quiet spaces for participants who need a break from the main event area.',
  'We offer live captioning via YouTube streaming or video uploads to Slack for most presentations, and can provide materials in alternative formats on request.',
  'Our mentors and staff can assist with a range of needs. Don’t hesitate to ask for help or clarification at any time during the event.',
];

const EXPECTED = [
  'Be inclusive and respectful of all participants, regardless of age, gender, sexual orientation, disability, physical appearance, race, ethnicity, or religion.',
  'Collaborate openly and share knowledge generously. Everyone is here to learn and grow.',
  'Communicate thoughtfully and constructively. Critique ideas, not people.',
  'Be mindful of your surroundings and fellow participants. Alert organizers if you notice a dangerous situation or someone in distress.',
  'Respect the venues, tools, and equipment provided for the hackathon.',
];

const UNACCEPTABLE = [
  'Harassment, discrimination, or intimidation in any form',
  'Offensive verbal comments',
  'Deliberate intimidation, stalking, or following',
  'Photography or recording without consent',
  'Sustained disruption of talks or other events',
  'Inappropriate physical contact or unwelcome sexual attention',
];

const CodeOfConduct = () => {
  return (
    <>
      <Head>
        <title>Code of Conduct - Opportunity Hack</title>
        <meta name="description" content="Code of Conduct for Opportunity Hack hackathon participants, focusing on being a good person, listening to others, and helping humanity move forward." />
        <meta name="keywords" content="Opportunity Hack, hackathon, code of conduct, ethics, inclusivity, respect" />
        <RefinedFonts />
      </Head>
      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: 'clamp(104px, 13vh, 156px)', paddingBottom: 'clamp(28px, 5vh, 44px)' }}>
          <Eyebrow><span className="rise" style={{ display: 'inline-block' }}>Community standards</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: '14ch', animationDelay: '60ms' }}>
            Code of <span className="ohx-italic">Conduct</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: '150ms', maxWidth: '58ch' }}>
            At Opportunity Hack, we believe in the power of technology to create positive change.
            This is our commitment to an inclusive, respectful, and collaborative environment where
            everyone can help move humanity forward.
          </p>
          <hr className="ohx-rule rise" style={{ marginTop: 44, animationDelay: '240ms' }} />
        </section>

        {/* CORE VALUES */}
        <section className="ohx-wrap" style={{ paddingBottom: 'clamp(40px, 6vh, 64px)' }}>
          <Eyebrow>What we stand for</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 28 }}>Our core values</h2>
          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {CORE_VALUES.map((v) => (
              <div key={v.title} className="ohx-card" style={{ padding: '26px', borderLeft: '3px solid var(--brand)' }}>
                <span style={{ color: 'var(--brand)', display: 'inline-flex', fontSize: '1.8rem' }} aria-hidden="true">{v.icon}</span>
                <h3 className="ohx-display" style={{ fontSize: '1.25rem', marginTop: 14 }}>{v.title}</h3>
                <p className="ohx-muted" style={{ margin: '10px 0 0', fontSize: '0.95rem', lineHeight: 1.6 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ACCOMMODATIONS */}
        <section style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div className="ohx-wrap" style={{ paddingTop: 'clamp(48px, 7vh, 80px)', paddingBottom: 'clamp(48px, 7vh, 80px)' }}>
            <Eyebrow>For everyone</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 12 }}>Accommodations & accessibility</h2>
            <p className="ohx-muted" style={{ marginTop: 0, marginBottom: 28, maxWidth: '60ch' }}>
              Opportunity Hack is committed to an accessible, inclusive environment. We work to
              accommodate a range of needs so everyone can fully participate.
            </p>
            <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {ACCOMMODATIONS.map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8 }}>
                  <span className="ohx-display" style={{ color: 'var(--accent)', fontSize: '1.1rem', lineHeight: 1.5, flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</span>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.6 }}>{text}</p>
                </div>
              ))}
            </div>
            <p className="ohx-faint" style={{ marginTop: 24, marginBottom: 0, fontSize: '0.9rem' }}>
              We’re continuously improving our accessibility. If you have suggestions or feedback,{' '}
              <Link className="ohx-link" href="/contact">let us know</Link>.
            </p>
          </div>
        </section>

        {/* EXPECTED + UNACCEPTABLE */}
        <section className="ohx-wrap" style={{ paddingTop: 'clamp(48px, 7vh, 80px)', paddingBottom: 'clamp(40px, 6vh, 64px)' }}>
          <div style={{ display: 'grid', gap: 'clamp(32px, 5vw, 56px)', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {/* Expected */}
            <div>
              <Eyebrow>What we expect</Eyebrow>
              <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 20 }}>Expected behavior</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {EXPECTED.map((text, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span aria-hidden="true" style={{ color: 'var(--brand)', fontWeight: 700, lineHeight: 1.6, flexShrink: 0 }}>+</span>
                    <span style={{ fontSize: '0.97rem', lineHeight: 1.6 }}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Unacceptable */}
            <div>
              <Eyebrow>Zero tolerance</Eyebrow>
              <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 20 }}>Unacceptable behavior</h2>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {UNACCEPTABLE.map((text, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span aria-hidden="true" style={{ color: 'var(--accent)', fontWeight: 700, lineHeight: 1.5, flexShrink: 0 }}>&times;</span>
                    <span style={{ fontSize: '0.97rem', lineHeight: 1.6 }}>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* REPORTING */}
        <section className="ohx-wrap" style={{ paddingBottom: 'clamp(40px, 6vh, 64px)' }}>
          <div className="ohx-card" style={{ padding: 'clamp(24px, 4vw, 40px)', borderTop: '3px solid var(--accent)' }}>
            <Eyebrow style={{ color: 'var(--accent)' }}>Reporting</Eyebrow>
            <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 16, fontSize: 'clamp(1.5rem, 2.6vw, 2.1rem)' }}>
              A safe and welcoming environment for all
            </h2>
            <p className="ohx-muted" style={{ margin: '0 0 14px', maxWidth: '64ch' }}>
              If you experience or witness unacceptable behavior, or have any other concerns, please
              report it to the hackathon organizers immediately. All reports are handled with discretion.
            </p>
            <p className="ohx-muted" style={{ margin: '0 0 20px', maxWidth: '64ch' }}>
              Organizers may take any action they deem appropriate, including warning the offender or
              expulsion from the hackathon.
            </p>
            <Link href="/contact" className="ohx-btn" style={{ display: 'inline-flex' }}>Contact us <Arrow /></Link>
          </div>
        </section>

        {/* REMEMBER + CTA */}
        <section style={{ background: 'var(--brand)', color: '#fff' }}>
          <div className="ohx-wrap" style={{ paddingTop: 'clamp(48px, 7vh, 88px)', paddingBottom: 'clamp(48px, 7vh, 88px)' }}>
            <p className="ohx-display" style={{ color: '#fff', fontSize: 'clamp(1.4rem, 2.6vw, 2rem)', maxWidth: '24ch', lineHeight: 1.25 }}>
              You’re not just coding — you’re contributing to a better future.
            </p>
            <p style={{ margin: '16px 0 32px', maxWidth: '54ch', color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem' }}>
              Let’s build an environment where everyone feels empowered to make a positive impact.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/sponsor" className="ohx-btn" style={{ background: '#fff', color: 'var(--brand)' }}>Become a sponsor <Arrow /></Link>
              <Link href="/about/mentors" className="ohx-btn ohx-btn--ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>Learn about mentoring</Link>
              <Link href="/about/judges" className="ohx-btn ohx-btn--ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}>Become a judge</Link>
            </div>
            <p style={{ margin: '40px 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', maxWidth: '70ch' }}>
              This Code of Conduct is adapted from the best practices of various tech communities and
              hackathons. We are committed to revisiting and refining these guidelines so they best
              serve our community.
            </p>
          </div>
        </section>
      </RefinedRoot>
    </>
  );
};

export default CodeOfConduct;
