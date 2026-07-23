import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { DATA, ERAS, LESSONS } from "../../components/TwelveYearsReport/data";

// Chart components are heavy (chart.js + react-chartjs-2). Code-split them
// into a single chunk that only loads on this page, client-only — there's
// no server-rendered chart output anyway. Next.js requires `dynamic`
// options to be inline object literals (no variable reference), so we
// repeat them per chart.
const YearlyChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.YearlyChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const TeammateChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.TeammateChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const TeamSizeChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.TeamSizeChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const SourceChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.SourceChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const UniversitiesChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.UniversitiesChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const CitiesChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.CitiesChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const SpecialtyChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.SpecialtyChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const DomainChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.DomainChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const TimingChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.TimingChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const RepeatChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.RepeatChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);
const TechChart = dynamic(
    () => import("../../components/TwelveYearsReport/Charts").then((m) => m.TechChart),
    { ssr: false, loading: () => <ChartSkeleton /> },
);

function ChartSkeleton() {
    return (
        <div className="chart-skeleton">
            <div className="shimmer" />
            <style jsx>{`
                .chart-skeleton {
                    background: #1B1E25;
                    border: 1px solid #2A2D35;
                    padding: 24px;
                    height: 380px;
                    position: relative;
                    overflow: hidden;
                }
                .shimmer {
                    position: absolute;
                    inset: 24px;
                    background: linear-gradient(90deg, transparent, rgba(255, 90, 31, 0.06), transparent);
                    background-size: 200% 100%;
                    animation: sweep 1.6s ease-in-out infinite;
                }
                @keyframes sweep {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
}

function bold(text) {
    // Convert **bolded** segments in lesson body strings to <strong>
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
            <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
            <React.Fragment key={i}>{p}</React.Fragment>
        )
    );
}

export default function TwelveYearsReport() {
    const eventsByEra = ERAS.reduce((acc, era) => {
        acc[era.key] = DATA.timeline.filter((e) => e.era === era.key);
        return acc;
    }, {});

    return (
        <>
            <div className="report">
                <div className="wrap">
                    <header className="masthead">
                        <div className="kicker">A Field Report · 2014 → 2026</div>
                        <h1>
                            Twelve years of <em>Opportunity Hack</em>, in numbers.
                        </h1>
                        <p className="deck">
                            Across 21 hackathons on three continents, 4,076 hackers registered to build
                            technology for nonprofits — and 1,080 of them shipped. This is what their
                            data tells us about how social-good hackathons actually work.
                        </p>
                        <div className="audience">
                            <strong>Who this is for:</strong> people who run hackathons (and want patterns they
                            can use), corporate teams considering a hackathon-for-good as a community
                            initiative, and anyone curious about how a volunteer-run event grew from one
                            San Jose weekend into a multi-year, multi-format program. If you're thinking
                            about hosting your own hackathon — or sponsoring ours — start here.
                        </div>
                        <div className="meta">
                            <span><strong>21</strong> hackathons</span>
                            <span><strong>4,076</strong> registrants</span>
                            <span><strong>1,080</strong> shipped projects</span>
                            <span><strong>73</strong> countries</span>
                            <span><strong>12</strong> years</span>
                        </div>
                        <div className="host-cta">
                            <Link href="/hack/request" className="host-cta-btn">
                                Want to host a hackathon for social good? <span aria-hidden>→</span>
                            </Link>
                        </div>
                    </header>

                    <div className="stats">
                        <div className="stat">
                            <div className="stat-num accent">26.5%</div>
                            <div className="stat-label">Avg. completion rate</div>
                            <div className="stat-sub">Registration → submitted project</div>
                        </div>
                        <div className="stat">
                            <div className="stat-num">39.2%</div>
                            <div className="stat-label">2025 completion rate</div>
                            <div className="stat-sub">~2× the 2014–2022 baseline</div>
                        </div>
                        <div className="stat">
                            <div className="stat-num">219</div>
                            <div className="stat-label">Repeat hackers</div>
                            <div className="stat-sub">Came to two or more events</div>
                        </div>
                        <div className="stat">
                            <div className="stat-num">5</div>
                            <div className="stat-label">Three-time finishers</div>
                            <div className="stat-sub">Hackers who shipped 3+ times</div>
                        </div>
                    </div>

                    {/* SECTION 1: HISTORY/TIMELINE */}
                    <section>
                        <div className="sec-num">01 / The Story</div>
                        <h2 className="sec-title">From one San Jose weekend to a multi-format, year-round program.</h2>
                        <p className="sec-lede">
                            Opportunity Hack started as a single hackathon in October 2014. It grew, stalled,
                            pivoted through COVID, and emerged with a more flexible event design. The history
                            breaks cleanly into four eras.
                        </p>

                        <div className="timeline">
                            {ERAS.map((era) => (
                                <div className="era" key={era.key}>
                                    <div className="era-head">
                                        <div>
                                            <div className={`era-name ${era.cls}`}>{era.name}</div>
                                            <div className="era-yrs">{era.years}</div>
                                        </div>
                                        <div className="era-tag">{era.tag}</div>
                                    </div>
                                    <div className="events">
                                        {eventsByEra[era.key].map((ev, idx) => (
                                            <div className="event" key={idx}>
                                                <div className="event-date">{ev.date}</div>
                                                <div className="event-title">{ev.title}</div>
                                                <div className="event-loc">
                                                    {ev.location.length > 50 ? ev.location.slice(0, 48) + "…" : ev.location} · {ev.type}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 2: FUNNEL */}
                    <section>
                        <div className="sec-num">02 / The Funnel</div>
                        <h2 className="sec-title">Three of every four registrants never ship a project.</h2>
                        <p className="sec-lede">
                            Across the full history, the registration → submission rate sits at <strong>26.5%</strong>.
                            That's the universal hackathon problem: getting people to sign up is easy, getting them
                            to ship is hard. The good news is that completion has been climbing meaningfully since
                            2022 — recent events run 30–40%, double the historical baseline.
                        </p>

                        <YearlyChart />

                        <div className="insight">
                            <span className="tag">Pattern</span>
                            <em>Completion rate is structurally improving.</em> The collapses in 2020 and 2022
                            track real disruption (COVID, format reinvention). The recovery from 2023 onward
                            reflects a more deliberate event design — described in the lessons section below.
                        </div>

                        <p className="caveat">
                            Caveat: 2026's 71% rate is inflated because the dataset for that year is filtered to
                            invited/accepted-only flows. Treat post-2023 trend as directional.
                        </p>
                    </section>

                    {/* SECTION 3: TEAM FORMATION */}
                    <section>
                        <div className="sec-num">03 / The Biggest Lever</div>
                        <h2 className="sec-title">Team status at registration is the strongest predictor of who ships.</h2>
                        <p className="sec-lede">
                            Hackers who register with a team submit at <strong>39.7%</strong>. Those still looking
                            for one drop to <strong>17.8%</strong>. Solo hackers crater at <strong>9.8%</strong> —
                            a 4× gap. The same pattern shows up cleanly on the project side: solo projects ship
                            46% of the time, while three-or-more-person teams ship 93%+ of the time. This is the
                            closest thing to a universal law in the dataset.
                        </p>

                        <div className="chart-grid two">
                            <TeammateChart />
                            <TeamSizeChart />
                        </div>

                        <div className="insight">
                            <span className="tag">Universal Pattern</span>
                            If a hackathon wants to move its completion rate, <em>solving "I don't have a team" is
                            the highest-leverage problem</em>. In this dataset, 959 registrants said they were solo
                            or looking — had they all found teams, expected submissions would have roughly doubled.
                        </div>
                    </section>

                    {/* SECTION 4: ACQUISITION */}
                    <section>
                        <div className="sec-num">04 / Where Hackers Come From</div>
                        <h2 className="sec-title">Listing platforms bring volume. Friends and direct outreach bring finishers.</h2>
                        <p className="sec-lede">
                            Four channels do almost all the work: <strong>friend referrals (606)</strong>,
                            <strong> DevPost (463)</strong>, <strong>school/club (331)</strong>, and
                            <strong> direct from organizer (278)</strong>. But quality is wildly uneven. Hackers who
                            heard about the event on DevPost finish at <strong>11.9%</strong>. Hackers who heard from
                            a friend finish at <strong>34%</strong>. Hackers who heard directly from the organizer
                            finish at <strong>39.2%</strong>. Returning alumni finish at <strong>75%</strong>.
                        </p>

                        <SourceChart />

                        <div className="insight">
                            <span className="tag">Pattern</span>
                            Public listing platforms are <em>top-of-funnel awareness, not commitment</em>. The
                            signups that actually ship come from people who heard about the event from someone they
                            trust — a friend, a professor, the organizer themselves. This pattern almost certainly
                            generalizes beyond OHack.
                        </div>
                    </section>

                    {/* SECTION 5: WHO */}
                    <section>
                        <div className="sec-num">05 / Who Shows Up</div>
                        <h2 className="sec-title">An anchor school, a developer-heavy crowd, two strong country bases.</h2>
                        <p className="sec-lede">
                            Geography is heavily concentrated. <strong>Arizona State University alone supplies 985
                            registrants</strong> — about 24% of the entire history. ASU + Arizona cities account for
                            over a quarter of all signups. Outside Arizona, San Jose, Chicago, and Atlanta form a
                            secondary cluster, each tied to a specific corporate-sponsored event series. This "anchor
                            school" pattern is common in nonprofit hackathons: a single committed academic partner
                            generates most of the volume.
                        </p>

                        <div className="chart-grid two">
                            <UniversitiesChart />
                            <CitiesChart />
                        </div>

                        <div className="chart-grid two">
                            <SpecialtyChart />
                            <DomainChart />
                        </div>

                        <div className="insight">
                            <span className="tag">Observation</span>
                            Full-stack developers are <em>both the largest segment and the highest converter among
                            major roles</em> (32%). Product managers and business folks register but rarely ship
                            (≤16%) — almost certainly because they can't deliver code alone, which loops directly
                            back to the team-formation problem in §03.
                        </div>
                    </section>

                    {/* SECTION 6: BEHAVIOR */}
                    <section>
                        <div className="sec-num">06 / Behavior</div>
                        <h2 className="sec-title">Late registrants finish. Repeat hackers compound.</h2>
                        <p className="sec-lede">
                            The closer to the event a hacker registers, the more likely they are to ship.
                            <strong> Same-day registrants finish at 44%. Hackers who signed up 31–60 days early
                            finish at 18%.</strong> Long lead times signal weak intent. On the loyalty side, 219
                            hackers have shown up to two or more events — and they convert at <strong>42%</strong>,
                            nearly double the first-timer rate. But the multi-time finisher tail is small: only 51
                            hackers have ever submitted projects at more than one event in twelve years.
                        </p>

                        <div className="chart-grid two">
                            <TimingChart />
                            <RepeatChart />
                        </div>

                        <div className="insight">
                            <span className="tag">Pattern</span>
                            The "alumni hacker" is <em>real but rare</em>. 973 people have shipped exactly one
                            project, 46 have shipped two, and only 5 have shipped three. Nobody has ever shipped
                            four. Either people graduate out of the format (into mentor/judge/sponsor roles), or
                            there's a natural ceiling on hackathon participation that's worth understanding.
                        </div>
                    </section>

                    {/* SECTION 7: TECH */}
                    <section>
                        <div className="sec-num">07 / What Gets Built</div>
                        <h2 className="sec-title">JavaScript-heavy, modern, increasingly leaning on managed backends.</h2>
                        <p className="sec-lede">
                            Across 13 years of submitted projects, JavaScript / Python / React dominate the long-tail
                            counts. But the modern additions — TypeScript, Next.js, Tailwind, Supabase, Firebase —
                            show projects increasingly leaning on managed services that compress time-to-MVP. This
                            stack evolution probably contributes to the rising completion rate in §02: it's measurably
                            easier to ship a working app today than it was a decade ago.
                        </p>

                        <TechChart />
                    </section>

                    {/* SECTION 8: LESSONS */}
                    <section>
                        <div className="sec-num">08 / What Hackathon Hosts Can Take From This</div>
                        <h2 className="sec-title">Five patterns the data argues for — broadly applicable beyond Opportunity Hack.</h2>
                        <p className="sec-lede">
                            These aren't OHack-specific recommendations. They're patterns that emerge from twelve
                            years of registration and submission data, and they're likely to repeat at any hackathon
                            with a similar structure (multi-day, project-based, open registration, social-good or
                            technical theme).
                        </p>

                        <div className="lessons">
                            {LESSONS.map((l) => (
                                <div className="lesson" key={l.n}>
                                    <div className="lesson-num">{l.n}</div>
                                    <div>
                                        <h4>{l.title}</h4>
                                        <p>{bold(l.body)}</p>
                                        <div className="ev">Evidence: {l.evidence}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CTA SECTION */}
                    <section className="final-cta">
                        <div className="sec-num">09 / If You Take Anything From This Report</div>
                        <h2 className="sec-title">Three ways to put twelve years of social-good hackathons to work.</h2>
                        <p className="sec-lede">
                            We've spent over a decade learning what works (and what doesn't) when you run a hackathon
                            for nonprofits. If any of the patterns above are useful for your team, here's how to put
                            them into practice — whether that's hosting your own event, partnering with us, or just
                            staying in touch.
                        </p>

                        <div className="cta-grid">
                            <Link href="/hack/request" className="cta-card">
                                <div className="cta-eyebrow">Host with us</div>
                                <h3>Run a hackathon for your nonprofit or company</h3>
                                <p>
                                    Tell us about the problem you want solved or the team you want to put through a
                                    hackathon. We've co-hosted with corporate sponsors, university partners, and
                                    nonprofits since 2014.
                                </p>
                                <div className="cta-arrow">Request a hackathon →</div>
                            </Link>

                            <Link href="/sponsor" className="cta-card">
                                <div className="cta-eyebrow">Sponsor</div>
                                <h3>Fund a social-good hackathon</h3>
                                <p>
                                    Sponsorship keeps OHack free for nonprofits and developers. Tiers include
                                    dedicated mentor and judge slots for your team — a popular professional-development
                                    perk that counts toward most ESG and corporate-volunteer programs.
                                </p>
                                <div className="cta-arrow">View sponsorship tiers →</div>
                            </Link>

                            <Link href="/hackathon-for-social-good" className="cta-card">
                                <div className="cta-eyebrow">Read more</div>
                                <h3>What a hackathon for social good actually is</h3>
                                <p>
                                    The companion page to this report — what makes a hackathon a "hackathon for
                                    social good," how the OHack model works in detail, and details for the next
                                    flagship event.
                                </p>
                                <div className="cta-arrow">Read the page →</div>
                            </Link>
                        </div>
                    </section>

                    <footer className="report-foot">
                        <span>Opportunity Hack · A Field Report from 12 Years</span>
                        <span>Sources: DevPost project + registrant exports, OHack hackathons table · 2014–2026</span>
                        <span>
                            <Link href="/coding-for-nonprofits" className="foot-link">
                                Free software for nonprofits →
                            </Link>
                        </span>
                    </footer>
                </div>
            </div>

            <style jsx global>{`
                /* Editorial dark theme — scoped to .report wrapper to avoid leaking into NavBar/Footer. */
                .report {
                    --r-bg: #0E0F12;
                    --r-panel: #16181D;
                    --r-panel-2: #1B1E25;
                    --r-ink: #F2EFE9;
                    --r-ink-dim: #9A9AA0;
                    --r-rule: #2A2D35;
                    --r-accent: #FF5A1F;
                    --r-accent-2: #F7C948;
                    --r-good: #7BC47F;
                    --r-bad: #E5604F;
                    --r-era1: #7BC47F;
                    --r-era2: #F7C948;
                    --r-era3: #E5604F;
                    --r-era4: #FF5A1F;
                    background: var(--r-bg);
                    color: var(--r-ink);
                    font-family: 'Inter Tight', 'Inter', sans-serif;
                    line-height: 1.5;
                    -webkit-font-smoothing: antialiased;
                }
                .report * { box-sizing: border-box; }
                .report .wrap {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 96px 32px 80px;
                }

                .report .masthead {
                    border-bottom: 1px solid var(--r-rule);
                    padding-bottom: 32px;
                    margin-bottom: 48px;
                }
                .report .kicker {
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 11px;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: var(--r-accent);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .report .kicker::before {
                    content: "";
                    width: 24px;
                    height: 1px;
                    background: var(--r-accent);
                }
                .report h1 {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 900;
                    font-size: clamp(40px, 6vw, 88px);
                    line-height: 0.95;
                    letter-spacing: -0.025em;
                    margin: 0 0 16px;
                    color: var(--r-ink);
                }
                .report h1 em {
                    font-style: italic;
                    font-weight: 400;
                    color: var(--r-accent-2);
                }
                .report .deck {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 400;
                    font-size: clamp(18px, 2vw, 22px);
                    color: var(--r-ink-dim);
                    max-width: 780px;
                    line-height: 1.45;
                    margin: 0;
                }
                .report .audience {
                    margin-top: 24px;
                    padding: 16px 20px;
                    background: var(--r-panel);
                    border-left: 3px solid var(--r-accent-2);
                    font-size: 14px;
                    color: var(--r-ink-dim);
                    max-width: 780px;
                    line-height: 1.55;
                }
                .report .audience strong { color: var(--r-ink); font-weight: 600; }
                .report .meta {
                    display: flex;
                    gap: 24px;
                    flex-wrap: wrap;
                    margin-top: 24px;
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 11px;
                    color: var(--r-ink-dim);
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .report .meta span strong { color: var(--r-ink); font-weight: 500; }

                .report .host-cta { margin-top: 24px; }
                .report .host-cta-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 22px;
                    background: var(--r-accent);
                    color: #0E0F12;
                    text-decoration: none;
                    font-weight: 600;
                    font-size: 15px;
                    letter-spacing: -0.01em;
                    border-radius: 0;
                    transition: background 120ms ease, transform 120ms ease;
                }
                .report .host-cta-btn:hover {
                    background: var(--r-accent-2);
                    transform: translateY(-1px);
                }

                .report .stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1px;
                    background: var(--r-rule);
                    border: 1px solid var(--r-rule);
                    margin-bottom: 64px;
                }
                .report .stat { background: var(--r-panel); padding: 28px 24px; }
                .report .stat-num {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 800;
                    font-size: clamp(36px, 4vw, 48px);
                    line-height: 1;
                    letter-spacing: -0.02em;
                    color: var(--r-ink);
                }
                .report .stat-num.accent { color: var(--r-accent); }
                .report .stat-label {
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 10px;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: var(--r-ink-dim);
                    margin-top: 10px;
                }
                .report .stat-sub {
                    font-size: 13px;
                    color: var(--r-ink-dim);
                    margin-top: 6px;
                }

                .report section { margin-bottom: 80px; }
                .report .sec-num {
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 11px;
                    letter-spacing: 0.18em;
                    color: var(--r-accent);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }
                .report .sec-title {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 800;
                    font-size: clamp(28px, 3.5vw, 42px);
                    line-height: 1.05;
                    letter-spacing: -0.02em;
                    margin: 0 0 12px;
                    max-width: 900px;
                    color: var(--r-ink);
                }
                .report .sec-lede {
                    font-size: 16px;
                    color: var(--r-ink-dim);
                    max-width: 780px;
                    margin: 0 0 32px;
                    line-height: 1.6;
                }
                .report .sec-lede strong { color: var(--r-ink); font-weight: 600; }

                .report .insight {
                    border-left: 3px solid var(--r-accent);
                    background: linear-gradient(90deg, rgba(255, 90, 31, 0.08), transparent 60%);
                    padding: 18px 24px;
                    margin: 24px 0;
                    font-family: 'Fraunces', Georgia, serif;
                    font-size: 18px;
                    line-height: 1.45;
                    color: var(--r-ink);
                }
                .report .insight em { color: var(--r-accent-2); }
                .report .insight .tag {
                    display: inline-block;
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 10px;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: var(--r-accent);
                    margin-right: 12px;
                    font-style: normal;
                }

                .report .chart-grid {
                    display: grid;
                    gap: 24px;
                    grid-template-columns: 1fr;
                    margin-bottom: 24px;
                }
                .report .chart-grid.two {
                    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
                }

                .report .timeline { padding-left: 0; }
                .report .era { margin-bottom: 32px; }
                .report .era-head {
                    display: grid;
                    grid-template-columns: 140px 1fr;
                    gap: 24px;
                    align-items: baseline;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--r-rule);
                }
                .report .era-name {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 600;
                    font-style: italic;
                    font-size: 24px;
                    letter-spacing: -0.01em;
                }
                .report .era-name.e1 { color: var(--r-era1); }
                .report .era-name.e2 { color: var(--r-era2); }
                .report .era-name.e3 { color: var(--r-era3); }
                .report .era-name.e4 { color: var(--r-era4); }
                .report .era-yrs {
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 11px;
                    letter-spacing: 0.1em;
                    color: var(--r-ink-dim);
                }
                .report .era-tag {
                    font-size: 14px;
                    color: var(--r-ink-dim);
                    max-width: 680px;
                    line-height: 1.5;
                }
                .report .events {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1px;
                    background: var(--r-rule);
                    border: 1px solid var(--r-rule);
                }
                .report .event {
                    background: var(--r-panel);
                    padding: 14px 16px;
                    font-size: 13px;
                }
                .report .event-date {
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 10px;
                    color: var(--r-accent);
                    letter-spacing: 0.08em;
                }
                .report .event-title {
                    font-weight: 500;
                    margin-top: 4px;
                    line-height: 1.35;
                    color: var(--r-ink);
                }
                .report .event-loc {
                    color: var(--r-ink-dim);
                    font-size: 12px;
                    margin-top: 4px;
                }

                .report .lessons {
                    background: var(--r-panel);
                    border: 1px solid var(--r-rule);
                }
                .report .lesson {
                    display: grid;
                    grid-template-columns: 80px 1fr;
                    gap: 24px;
                    padding: 28px 32px;
                    border-bottom: 1px solid var(--r-rule);
                    align-items: start;
                }
                .report .lesson:last-child { border-bottom: none; }
                .report .lesson-num {
                    font-family: 'Fraunces', Georgia, serif;
                    font-weight: 800;
                    font-size: 48px;
                    color: var(--r-accent);
                    line-height: 1;
                }
                .report .lesson h4 {
                    font-family: 'Fraunces', Georgia, serif;
                    font-size: 22px;
                    font-weight: 600;
                    margin: 0 0 8px;
                    letter-spacing: -0.01em;
                    line-height: 1.2;
                    color: var(--r-ink);
                }
                .report .lesson p {
                    font-size: 14px;
                    color: var(--r-ink-dim);
                    line-height: 1.6;
                    margin: 0 0 8px;
                }
                .report .lesson p strong { color: var(--r-ink); font-weight: 600; }
                .report .lesson .ev {
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 11px;
                    color: var(--r-accent-2);
                    margin-top: 8px;
                    letter-spacing: 0.05em;
                }

                .report .caveat {
                    font-size: 12px;
                    color: var(--r-ink-dim);
                    font-style: italic;
                    margin-top: 16px;
                    padding-left: 16px;
                    border-left: 1px solid var(--r-rule);
                }

                .report .final-cta {
                    border-top: 1px solid var(--r-rule);
                    padding-top: 64px;
                }
                .report .cta-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1px;
                    background: var(--r-rule);
                    border: 1px solid var(--r-rule);
                }
                .report .cta-card {
                    background: var(--r-panel);
                    padding: 32px;
                    text-decoration: none;
                    color: inherit;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    transition: background 160ms ease;
                }
                .report .cta-card:hover { background: var(--r-panel-2); }
                .report .cta-eyebrow {
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 10px;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: var(--r-accent);
                }
                .report .cta-card h3 {
                    font-family: 'Fraunces', Georgia, serif;
                    font-size: 22px;
                    font-weight: 600;
                    margin: 0;
                    letter-spacing: -0.01em;
                    line-height: 1.2;
                    color: var(--r-ink);
                }
                .report .cta-card p {
                    font-size: 14px;
                    color: var(--r-ink-dim);
                    line-height: 1.55;
                    margin: 0;
                    flex: 1;
                }
                .report .cta-arrow {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--r-accent-2);
                    margin-top: 8px;
                }

                .report .report-foot {
                    margin-top: 64px;
                    padding-top: 32px;
                    border-top: 1px solid var(--r-rule);
                    font-family: 'JetBrains Mono', ui-monospace, monospace;
                    font-size: 11px;
                    color: var(--r-ink-dim);
                    letter-spacing: 0.05em;
                    display: flex;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                .report .foot-link { color: var(--r-accent); text-decoration: none; }
                .report .foot-link:hover { color: var(--r-accent-2); }

                @media (max-width: 680px) {
                    .report .wrap { padding: 64px 20px 60px; }
                    .report .chart-grid.two { grid-template-columns: 1fr; }
                    .report .lesson { grid-template-columns: 50px 1fr; padding: 20px; gap: 16px; }
                    .report .lesson-num { font-size: 32px; }
                    .report .era-head { grid-template-columns: 1fr; gap: 6px; }
                }
            `}</style>
            <link
                href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,800;9..144,900&family=JetBrains+Mono:wght@400;500;700&display=swap"
                rel="stylesheet"
            />
        </>
    );
}

export const getStaticProps = async () => {
    const title = "12 Years of Social Good Hackathons: A Field Report | Opportunity Hack";
    const description = "Twelve years of data from 21 hackathons, 4,076 hackers, and 1,080 shipped projects. The patterns that emerged about completion rates, team formation, recruitment, and what hackathon hosts can learn.";
    const canonicalUrl = "https://www.ohack.dev/12-years-of-social-good";
    const ogImage = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";
    const datePublished = "2026-04-26";

    // Five lessons → FAQPage entries (visible in the page as the lessons section).
    const faqEntries = [
        {
            q: "What's the most important thing a hackathon host can do to improve completion rates?",
            a: "Solve the team-formation problem before the event starts. Solo hackers finish at 9.8%. Teamed hackers finish at 39.7% — a 4× gap. Matchmaking flows, \"looking for a team\" boards, and forced team-join steps at registration would all raise the completion floor more than any other single change. Twelve years of Opportunity Hack data show this is the single highest-leverage intervention.",
        },
        {
            q: "Are listing platforms like DevPost good places to recruit hackers?",
            a: "For awareness, yes. For finishers, no. DevPost-sourced registrants finish at 11.9% — about a third of the rate from friend referrals (34%) or direct organizer outreach (39%). Word-of-mouth and direct outreach are roughly 3× more efficient on a per-finisher basis. Use listing platforms for top-of-funnel awareness, but put your real recruitment energy into named-relationship outreach.",
        },
        {
            q: "When should hackathon registration close?",
            a: "As late as possible — ideally the moment the event starts. Same-day registrants finish at 44%. Hackers who signed up over a month early finish at 18%. Many hackathons close registration two weeks early \"for planning purposes\" but that decision systematically cuts off the highest-intent segment of the audience. Late registration is high-intent registration. Plan for a day-zero surge instead of fighting it.",
        },
        {
            q: "How do you handle anchor-school risk in a hackathon?",
            a: "Name your anchor partnerships explicitly, measure the concentration, and proactively cultivate two or three more before you have to. Opportunity Hack's relationship with Arizona State produces 24% of all registrations at a 35% completion rate — an excellent partnership, but also a single point of failure: a policy change, a curriculum shift, or a key contact leaving could halve the funnel overnight.",
        },
        {
            q: "What's the right way to engage hackathon alumni?",
            a: "High-touch, named-relationship outreach — not mass email. Across twelve years of Opportunity Hack, only 51 hackers have ever shipped projects at more than one event. Five have shipped three times. Zero have shipped four. The \"alumni newsletter\" tactic doesn't fit this scale. Instead: invite specific alumni to mentor, advise nonprofits, judge, or recruit teammates from new cohorts. Help alumni stay in the ecosystem after they age out of competing.",
        },
    ];

    return {
        props: {
            title,
            description,
            canonical: canonicalUrl,
            openGraphData: [
                { name: "title", property: "title", content: title, key: "title" },
                { name: "og:title", property: "og:title", content: title, key: "ogtitle" },
                { name: "og:description", property: "og:description", content: description, key: "ogdescription" },
                { name: "og:type", property: "og:type", content: "article", key: "ogtype" },
                { name: "image", property: "og:image", content: ogImage, key: "ognameimage" },
                { property: "og:image:width", content: "1200", key: "ogimagewidth" },
                { property: "og:image:height", content: "630", key: "ogimageheight" },
                { name: "og:url", property: "og:url", content: canonicalUrl, key: "ogurl" },
                { name: "twitter:card", property: "twitter:card", content: "summary_large_image", key: "twittercard" },
                { name: "twitter:site", property: "twitter:site", content: "@opportunityhack", key: "twittersite" },
                { name: "twitter:title", property: "twitter:title", content: title, key: "twittertitle" },
                { name: "twitter:description", property: "twitter:description", content: description, key: "twitterdesc" },
                { name: "twitter:image", property: "twitter:image", content: ogImage, key: "twitterimage" },
                { name: "twitter:image:alt", property: "twitter:image:alt", content: "Twelve years of Opportunity Hack — a field report on hackathons for social good", key: "twitterimagealt" },
                { name: "twitter:creator", property: "twitter:creator", content: "@opportunityhack", key: "twittercreator" },
                { name: "keywords", content: "how to host a hackathon, hackathon impact report, hackathon completion rate, social good hackathon, run a hackathon, organize a hackathon, hackathon best practices, hackathon data, hackathon case study, opportunity hack history", key: "keywords" },
                { name: "article:published_time", property: "article:published_time", content: datePublished, key: "articlepubtime" },
                { name: "article:author", property: "article:author", content: "Opportunity Hack", key: "articleauthor" },
            ],
            structuredData: {
                "@context": "https://schema.org",
                "@graph": [
                    {
                        "@type": "Article",
                        "@id": canonicalUrl + "#article",
                        headline: "Twelve Years of Opportunity Hack — A Field Report",
                        description,
                        image: ogImage,
                        datePublished,
                        dateModified: datePublished,
                        author: {
                            "@type": "Organization",
                            name: "Opportunity Hack",
                            url: "https://www.ohack.dev",
                        },
                        publisher: { "@id": "https://www.ohack.dev/#organization" },
                        mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl + "#webpage" },
                        about: {
                            "@type": "Thing",
                            name: "Hackathons for social good — registration, completion, and recruitment patterns",
                        },
                        keywords: "hackathon hosting, hackathon completion rate, hackathon team formation, hackathon recruitment, social good hackathon, opportunity hack",
                    },
                    {
                        "@type": "WebPage",
                        "@id": canonicalUrl + "#webpage",
                        url: canonicalUrl,
                        name: title,
                        description,
                        isPartOf: { "@type": "WebSite", "@id": "https://www.ohack.dev/#website" },
                    },
                    {
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ohack.dev" },
                            { "@type": "ListItem", position: 2, name: "12 Years of Social Good", item: canonicalUrl },
                        ],
                    },
                    {
                        "@type": "FAQPage",
                        mainEntity: faqEntries.map((f) => ({
                            "@type": "Question",
                            name: f.q,
                            acceptedAnswer: { "@type": "Answer", text: f.a },
                        })),
                    },
                ],
            },
        },
    };
};
