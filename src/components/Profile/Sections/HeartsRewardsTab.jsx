import React from "react";
import PropTypes from "prop-types";
import { Box, Skeleton, LinearProgress } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import Link from "next/link";
import {
  TIERS,
  ALL_REWARDS,
  HEART_CATEGORIES,
  countHeartsFromHistory,
  getTierForHearts,
  getNextTier,
  formatHearts,
} from "../../../lib/heartTiers";
import { Arrow } from "../../design/refined";
import HeartsExplainer from "./HeartsExplainer";

/*
 * Loyalty-program style rewards status page for the profile "Hearts" tab.
 * Only rendered inside the profile's <RefinedRoot> + scoped formTheme, so
 * .ohx-* classes and the navy MUI palette are both available.
 *
 * All subcomponents are module-scope (never define them inside the component
 * — remounting wipes state and restarts transitions on every render).
 */

function TierDot({ color, size = 10 }) {
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border: "1px solid rgba(0,0,0,0.15)",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

TierDot.propTypes = {
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};

function StatusHero({ hearts, tier, hasClaimable }) {
  return (
    <div
      className="ohx-card"
      style={{
        background: "var(--surface-2)",
        padding: "24px 28px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
      }}
    >
      <div>
        <p className="ohx-eyebrow" style={{ marginBottom: 6 }}>Your status</p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {tier && <TierDot color={tier.color} size={12} />}
          <h3 className="ohx-display" style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.8rem)" }}>
            {tier ? `${tier.name} member` : "Community member"}
          </h3>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
          <span
            className="ohx-display"
            style={{ fontSize: "clamp(2.4rem, 5vw, 3.4rem)", lineHeight: 1, color: "var(--brand)" }}
          >
            {formatHearts(hearts)}
          </span>
          <span className="ohx-muted">heart{hearts === 1 ? "" : "s"} earned</span>
        </div>
      </div>
      {hasClaimable ? (
        <Link
          href={`/contact?type=claim_reward&hearts=${hearts}`}
          className="ohx-btn ohx-btn--primary"
        >
          Claim your rewards <Arrow />
        </Link>
      ) : (
        <p className="ohx-muted" style={{ margin: 0, maxWidth: "28ch" }}>
          Earn your first 2 hearts to reach Bronze and unlock rewards.
        </p>
      )}
    </div>
  );
}

StatusHero.propTypes = {
  hearts: PropTypes.number.isRequired,
  tier: PropTypes.object,
  hasClaimable: PropTypes.bool.isRequired,
};

function NextTierProgress({ hearts, tier, nextTier }) {
  if (!nextTier) {
    return (
      <div className="ohx-card" style={{ padding: "18px 24px" }}>
        <strong>You&apos;ve reached our top tier.</strong>{" "}
        <span className="ohx-muted">Thank you for everything you give to nonprofits.</span>
      </div>
    );
  }
  const curMin = tier?.minHearts || 0;
  const pct = Math.max(0, Math.min(100, ((hearts - curMin) / (nextTier.minHearts - curMin)) * 100));
  const delta = nextTier.minHearts - hearts;
  return (
    <div className="ohx-card" style={{ padding: "18px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>
          {formatHearts(delta)} heart{delta === 1 ? "" : "s"} to {nextTier.name}
        </span>
        <span className="ohx-muted" style={{ fontSize: "0.9rem" }}>
          {formatHearts(hearts)} / {nextTier.minHearts} hearts
        </span>
      </div>
      <LinearProgress
        variant="determinate"
        value={pct}
        color="primary"
        sx={{ height: 6, borderRadius: 3, backgroundColor: "var(--line)" }}
      />
      <p className="ohx-muted" style={{ margin: "8px 0 0", fontSize: "0.9rem" }}>
        Unlocks: {nextTier.rewards[0].reward}
      </p>
    </div>
  );
}

NextTierProgress.propTypes = {
  hearts: PropTypes.number.isRequired,
  tier: PropTypes.object,
  nextTier: PropTypes.object,
};

function TierRow({ tierDef, hearts, isCurrent, isLast }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px 20px",
        padding: "16px 20px",
        borderLeft: isCurrent ? "3px solid var(--brand)" : "3px solid transparent",
        borderBottom: isLast ? "none" : "1px solid var(--line)",
      }}
    >
      <div style={{ flex: "1 1 200px", minWidth: 170 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <TierDot color={tierDef.color} />
          <span style={{ fontFamily: "var(--display)", fontWeight: 600, fontSize: "1.1rem" }}>
            {tierDef.name}
          </span>
          {isCurrent && <span className="ohx-tag ohx-tag--accent">You are here</span>}
        </div>
        <div className="ohx-muted" style={{ fontSize: "0.85rem", marginTop: 2 }}>
          from {tierDef.minHearts} hearts
        </div>
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, flex: "2 1 260px" }}>
        {tierDef.rewards.map((r) => {
          const achieved = r.hearts <= hearts;
          return (
            <li
              key={r.hearts}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "baseline",
                padding: "3px 0",
                color: achieved ? "var(--ink)" : "var(--muted)",
              }}
            >
              {achieved ? (
                <CheckIcon sx={{ fontSize: 16, color: "var(--brand)", position: "relative", top: 2, minWidth: 38 }} />
              ) : (
                <span className="ohx-faint" style={{ fontSize: "0.8rem", minWidth: 38, whiteSpace: "nowrap" }}>
                  {r.hearts} ♥
                </span>
              )}
              <span>{r.reward}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

TierRow.propTypes = {
  tierDef: PropTypes.object.isRequired,
  hearts: PropTypes.number.isRequired,
  isCurrent: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
};

function BenefitsLadder({ hearts, tier }) {
  return (
    <section>
      <h3 className="ohx-display" style={{ fontSize: "1.25rem", marginBottom: 12 }}>
        Tier benefits
      </h3>
      <div className="ohx-card" style={{ overflow: "hidden" }}>
        {TIERS.map((t, i) => (
          <TierRow
            key={t.name}
            tierDef={t}
            hearts={hearts}
            isCurrent={tier?.name === t.name}
            isLast={i === TIERS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

BenefitsLadder.propTypes = {
  hearts: PropTypes.number.isRequired,
  tier: PropTypes.object,
};

function BreakdownGroup({ title, items, source }) {
  const earned = items.filter(([key]) => (Number(source?.[key]) || 0) > 0);
  if (earned.length === 0) return null;
  return (
    <div style={{ flex: "1 1 320px", minWidth: 260 }}>
      <p className="ohx-eyebrow" style={{ marginBottom: 8 }}>{title}</p>
      <div className="ohx-card">
        {earned.map(([key, label, description], i) => (
          <div
            key={key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              padding: "10px 16px",
              borderBottom: i === earned.length - 1 ? "none" : "1px solid var(--line)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600 }}>{label}</div>
              {description && (
                <div className="ohx-muted" style={{ fontSize: "0.85rem" }}>{description}</div>
              )}
            </div>
            <span style={{ whiteSpace: "nowrap", fontWeight: 600, color: "var(--accent)" }}>
              {formatHearts(source[key])} ♥
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

BreakdownGroup.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  source: PropTypes.object,
};

function HeartsBreakdown({ history, hearts }) {
  const what = history?.what || {};
  const how = history?.how || {};
  const hasAny = hearts > 0;
  const unearned = [
    ...HEART_CATEGORIES.what.filter(([key]) => !(Number(what[key]) || 0)),
    ...HEART_CATEGORIES.how.filter(([key]) => !(Number(how[key]) || 0)),
  ];
  return (
    <section>
      <h3 className="ohx-display" style={{ fontSize: "1.25rem", marginBottom: 12 }}>
        How you earned your hearts
      </h3>
      {hasAny ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          <BreakdownGroup title="What you delivered" items={HEART_CATEGORIES.what} source={what} />
          <BreakdownGroup title="How you worked" items={HEART_CATEGORIES.how} source={how} />
        </div>
      ) : (
        <p className="ohx-muted" style={{ margin: 0 }}>
          No hearts yet — pick a project, ship something for a nonprofit, and this
          section fills in as our team recognizes your work.
        </p>
      )}
      {unearned.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p className="ohx-muted" style={{ margin: "0 0 8px", fontSize: "0.9rem" }}>
            More ways to earn
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {unearned.map(([key, label]) => (
              <span key={key} className="ohx-tag">{label}</span>
            ))}
          </div>
        </div>
      )}
      {hasAny && (
        <p className="ohx-muted" style={{ margin: "12px 0 0", fontSize: "0.9rem" }}>
          These add up to your {formatHearts(hearts)} hearts.
        </p>
      )}
    </section>
  );
}

HeartsBreakdown.propTypes = {
  history: PropTypes.object,
  hearts: PropTypes.number.isRequired,
};

export default function HeartsRewardsTab({ profile, isLoading, onOpenGiveaways }) {
  const history = profile?.history;
  const hearts = countHeartsFromHistory(history);
  const tier = getTierForHearts(hearts);
  const nextTier = getNextTier(hearts);
  const hasClaimable = ALL_REWARDS.some((r) => r.hearts <= hearts);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Skeleton variant="rectangular" height={140} />
        <Skeleton variant="rectangular" height={80} />
        <Skeleton variant="rectangular" height={320} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <StatusHero hearts={hearts} tier={tier} hasClaimable={hasClaimable} />
      <NextTierProgress hearts={hearts} tier={tier} nextTier={nextTier} />
      <BenefitsLadder hearts={hearts} tier={tier} />
      <HeartsBreakdown history={history} hearts={hearts} />
      <HeartsExplainer />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", alignItems: "center" }}>
        <Link href="/about/hearts" className="ohx-link">
          Learn more about hearts and rewards <Arrow />
        </Link>
        <Link href="/volunteer" className="ohx-link">
          Ways to volunteer <Arrow />
        </Link>
        {onOpenGiveaways && (
          <button
            type="button"
            onClick={onOpenGiveaways}
            className="ohx-link"
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit" }}
          >
            Giveaway entries <Arrow />
          </button>
        )}
      </div>
    </Box>
  );
}

HeartsRewardsTab.propTypes = {
  profile: PropTypes.object,
  isLoading: PropTypes.bool,
  onOpenGiveaways: PropTypes.func,
};
