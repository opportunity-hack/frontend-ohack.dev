/**
 * Guard (Class C, docs/plans/reliability-bug-classes-2026-11.md): no NEW
 * `useEffect`/`useLayoutEffect` whose dependency array lists the raw
 * `accessToken`.
 *
 * PropelAuth mints a fresh accessToken on every tab refocus. An effect keyed
 * on its VALUE re-runs on each rotation — refetching, flashing a spinner,
 * remounting children (lost drafts), or racing a stale run that paints
 * "not registered". Use `useAuthedResource` (src/hooks/use-authed-resource.js)
 * for authed fetches, or read the token through a ref and key the effect on
 * `Boolean(accessToken)` (presence). `useCallback` deps are out of scope —
 * a submit handler that lists the token is harmless.
 *
 * ALLOWLIST = files that already did this when the guard landed (Nov 2026),
 * with how many such effects each had. A file may never go ABOVE its count;
 * a file not listed may have none. When you migrate a file, delete its entry
 * (stale entries don't fail the run, so parallel PRs can't break each other,
 * but they leave slack — keep the list honest).
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "..");

const ALLOWLIST = {
  "components/ApplicationForm/JudgeTrainingGate.js": 1,
  "components/Hackathon/HackathonResults.js": 1,
  "components/Hackathon/TeamList.js": 1,
  "components/Jobs/JobApplicationForm.js": 2,
  "components/NonProfitApply/NonProfitApplyList.js": 1,
  "components/Planning/MentionTextField.js": 1,
  "components/Planning/PlanningEditorsManager.js": 1,
  "components/Profile/Portfolio/PortfolioHero.jsx": 1,
  "components/Teams/MentorTeamPanel.js": 1,
  "components/admin/SocialMediaManagement.js": 1,
  "components/admin/UserSearchDialog.js": 1,
  "components/admin/VolunteerTable.js": 2,
  "components/admin/feedback/PeerFeedbackPanel.js": 1,
  "components/admin/volunteer/VolunteerWorkbench.js": 1,
  "hooks/use-email-templates.js": 1,
  "hooks/use-judge-training-status.js": 1,
  "hooks/use-team-membership.js": 1,
  "pages/admin/contact/index.js": 1,
  "pages/admin/hackathon-requests/index.js": 1,
  "pages/admin/nonprofit/application.js": 1,
  "pages/admin/nonprofit/index.js": 1,
  "pages/admin/praise-bot/index.js": 1,
  "pages/admin/problems/index.js": 1,
  "pages/admin/store/index.js": 1,
  "pages/admin/time-tracking/index.js": 1,
  "pages/hack/[event_id]/hacker-application.js": 1,
  "pages/hack/[event_id]/sponsor-application.js": 1,
  "pages/hack/[event_id]/volunteer-application.js": 1,
};

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "__tests__" || name === "node_modules") continue;
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

/** Dependency-array source of every useEffect/useLayoutEffect in `src`. */
function effectDepArrays(source) {
  const arrays = [];
  const re = /\buse(?:Layout)?Effect\s*\(/g;
  let match;
  while ((match = re.exec(source))) {
    let i = match.index + match[0].length;
    let depth = 1;
    while (i < source.length && depth) {
      const c = source[i];
      if (c === "(" || c === "[" || c === "{") depth += 1;
      else if (c === ")" || c === "]" || c === "}") depth -= 1;
      i += 1;
    }
    const call = source.slice(match.index, i);
    const deps = call.match(/,\s*\[([^[\]]*)\]\s*,?\s*\)$/);
    if (deps) arrays.push(deps[1]);
  }
  return arrays;
}

/** True when a deps list names the raw token (presence checks are fine). */
function listsRawToken(deps) {
  const withoutPresence = deps.replace(
    /Boolean\(\s*accessToken\s*\)|!!\s*accessToken/g,
    "",
  );
  return /(^|[^.\w])accessToken\b/.test(withoutPresence);
}

function scan() {
  const counts = {};
  for (const file of walk(SRC)) {
    const rel = path.relative(SRC, file).split(path.sep).join("/");
    const n = effectDepArrays(fs.readFileSync(file, "utf8")).filter(
      listsRawToken,
    ).length;
    if (n) counts[rel] = n;
  }
  return counts;
}

describe("guard: effects keyed on the raw accessToken", () => {
  it("detects the pattern (self-check)", () => {
    expect(
      effectDepArrays(
        "useEffect(() => { load(); }, [eventId, accessToken]);",
      ).filter(listsRawToken),
    ).toHaveLength(1);
    expect(
      effectDepArrays(
        "useEffect(() => { load(); }, [eventId, Boolean(accessToken)]);",
      ).filter(listsRawToken),
    ).toHaveLength(0);
    expect(
      effectDepArrays("useEffect(() => {}, [auth.accessToken]);").filter(
        listsRawToken,
      ),
    ).toHaveLength(0);
    expect(
      effectDepArrays(
        "useEffect(() => { if (x) { f([1]); } }, [accessToken, x]);",
      ).filter(listsRawToken),
    ).toHaveLength(1);
  });

  it("adds no new offenders (use useAuthedResource or a token ref)", () => {
    const counts = scan();
    const violations = Object.entries(counts)
      .filter(([file, n]) => n > (ALLOWLIST[file] || 0))
      .map(
        ([file, n]) =>
          `src/${file}: ${n} effect(s) keyed on the raw accessToken (allowed ${ALLOWLIST[file] || 0})`,
      );
    expect(violations).toEqual([]);
  });
});
