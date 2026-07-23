import { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import Moment from "moment";
import { Box } from "@mui/material";
import useNonprofit from "../../hooks/use-nonprofit";
import useProfileApi from "../../hooks/use-profile-api";
import useHackathonEvents from "../../hooks/use-hackathon-events";
import NonProfitListTileRefined from "../NonProfitListTile/NonProfitListTileRefined";
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";
import { RefinedRoot, RefinedFonts, Eyebrow, Stat, Arrow } from "../design/refined";

function NonProfitList() {
  const { nonprofits } = useNonprofit();
  const { profile } = useProfileApi();
  const { hackathons: upcomingEvents } = useHackathonEvents("current");

  const [searchString, setSearchString] = useState("");
  const [needsHelp, setNeedsHelp] = useState(true);
  const [production, setProduction] = useState(false);

  const filtered = useMemo(() => {
    if (!nonprofits) return null;
    if (!searchString) return nonprofits;
    const q = searchString.toLowerCase();
    return nonprofits.filter(
      (n) => n.name?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q)
    );
  }, [nonprofits, searchString]);

  const formatEventDate = (s, e) => {
    const start = Moment(s);
    const end = Moment(e);
    if (start.format("YYYY-MM-DD") === end.format("YYYY-MM-DD")) return start.format("dddd, MMMM Do YYYY");
    return `${start.format("MMM D")} – ${end.format("MMM D, YYYY")}`;
  };

  const nextEvent = upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents[0] : null;
  const loading = nonprofits == null;

  return (
    <>
      <Head>
        <RefinedFonts />
      </Head>
      <RefinedRoot>
        {/* HERO */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(104px, 13vh, 156px)", paddingBottom: "clamp(28px, 5vh, 44px)" }}>
          <Eyebrow><span className="rise" style={{ display: "inline-block" }}>Nonprofit projects</span></Eyebrow>
          <h1 className="ohx-display rise" style={{ marginTop: 18, maxWidth: "17ch", animationDelay: "60ms" }}>
            Real problems that <span className="ohx-italic">need your help.</span>
          </h1>
          <p className="ohx-lead rise" style={{ marginTop: 22, animationDelay: "150ms", maxWidth: "60ch" }}>
            Browse the nonprofits we&apos;ve worked with and the ones looking for help right now. We hope you
            find something you&apos;ll love to build.
          </p>
        </section>

        {/* TWO PATHS */}
        <section className="ohx-wrap" style={{ paddingBottom: "clamp(24px, 4vh, 40px)" }}>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div className="ohx-card rise" style={{ padding: "26px" }}>
              <span className="ohx-tag ohx-tag--accent">Free service</span>
              <h2 className="ohx-display" style={{ fontSize: "1.3rem", marginTop: 14 }}>Submit your project</h2>
              <p className="ohx-muted" style={{ margin: "10px 0 18px", fontSize: "0.95rem", lineHeight: 1.55 }}>
                Have a nonprofit that needs tech help? Get matched with skilled developers who want to create social impact.
              </p>
              <Link href="/nonprofits/apply" className="ohx-btn ohx-btn--primary">Apply now — it&apos;s free <Arrow /></Link>
            </div>
            <div className="ohx-card rise" style={{ padding: "26px", animationDelay: "80ms" }}>
              <span className="ohx-tag">Global events</span>
              <h2 className="ohx-display" style={{ fontSize: "1.3rem", marginTop: 14 }}>Join upcoming hackathons</h2>
              <p className="ohx-muted" style={{ margin: "10px 0 18px", fontSize: "0.95rem", lineHeight: 1.55 }}>
                Take part in our hackathons, where your project could be built by passionate developers in just 48 hours.
              </p>
              <Link href="/hack" className="ohx-btn ohx-btn--ghost">View hackathons</Link>
            </div>
          </div>
          <p className="ohx-muted" style={{ marginTop: 18, fontSize: "0.95rem" }}>
            New here?{" "}
            <Link href="/coding-for-nonprofits" className="ohx-link">See how the free software process works <Arrow /></Link>
          </p>
          {nextEvent && (
            <div className="ohx-card" style={{ marginTop: 18, padding: "18px 22px", borderLeft: "3px solid var(--accent)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
              <div>
                <span className="ohx-eyebrow">Upcoming hackathon</span>
                <p style={{ margin: "6px 0 0", fontWeight: 500 }}>{nextEvent.title}</p>
                <p className="ohx-faint" style={{ margin: "2px 0 0", fontSize: "0.85rem" }}>{formatEventDate(nextEvent.start_date, nextEvent.end_date)}{nextEvent.location ? ` · ${nextEvent.location}` : ""}</p>
              </div>
              <Link href={`/hack/${nextEvent.event_id}`} className="ohx-btn ohx-btn--primary" style={{ fontSize: "0.9rem", padding: "0.7em 1.1em" }}>Learn more <Arrow /></Link>
            </div>
          )}
        </section>

        {/* IMPACT STRIP */}
        <section style={{ background: "var(--surface-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          <div className="ohx-wrap" style={{ paddingTop: "clamp(36px, 5vh, 56px)", paddingBottom: "clamp(36px, 5vh, 56px)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(28px, 6vw, 72px)" }}>
              <Stat value="200+" label="Nonprofits helped" />
              <Stat value="$2M+" label="In free development" />
              <Stat value="50+" label="Countries reached" />
            </div>
            <Link href="/about/success-stories" className="ohx-link">View success stories <Arrow /></Link>
          </div>
        </section>

        {/* CATALOG */}
        <section className="ohx-wrap" style={{ paddingTop: "clamp(40px, 6vh, 64px)", paddingBottom: "clamp(56px, 9vh, 104px)" }}>
          <Eyebrow>Browse</Eyebrow>
          <h2 className="ohx-display" style={{ marginTop: 8, marginBottom: 22 }}>The project catalog</h2>

          {/* Controls */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 26 }}>
            <input
              type="search"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              placeholder="Search nonprofits…"
              aria-label="Search nonprofits"
              style={{ flex: "1 1 260px", minWidth: 0, font: "inherit", fontSize: "0.95rem", color: "var(--ink)", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, padding: "11px 14px", outline: "none" }}
            />
            {[
              { label: "Needs help", active: needsHelp, toggle: () => setNeedsHelp((v) => !v) },
              { label: "Live", active: production, toggle: () => setProduction((v) => !v) },
            ].map((f) => (
              <button
                key={f.label}
                type="button"
                className="ohx-tag"
                onClick={f.toggle}
                style={{ cursor: "pointer", fontFamily: "inherit", background: f.active ? "var(--brand)" : "var(--surface)", color: f.active ? "#fff" : "var(--muted)", borderColor: f.active ? "var(--brand)" : "var(--line)" }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="ohx-faint">Loading nonprofits…</p>
          ) : filtered && filtered.length > 0 ? (
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
              {filtered.map((npo, i) => (
                <NonProfitListTileRefined
                  key={npo.id}
                  npo={npo}
                  profile={profile}
                  needs_help_flag={needsHelp}
                  production_flag={production}
                  delay={Math.min(i, 8) * 50}
                />
              ))}
            </div>
          ) : (
            <div className="ohx-card" style={{ padding: "40px 28px", textAlign: "center" }}>
              <p className="ohx-muted" style={{ margin: 0 }}>No matching projects found.</p>
            </div>
          )}
        </section>

        <Box sx={{ px: { xs: 2, md: 0 }, pb: 6 }}>
          <HelpUsBuildOHack github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/204" github_name="Issue #204" />
        </Box>
      </RefinedRoot>
    </>
  );
}

export default NonProfitList;
