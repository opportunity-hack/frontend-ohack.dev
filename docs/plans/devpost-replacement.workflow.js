// Workflow script for the DevPost-replacement program.
// Run via the Claude Code `Workflow` tool with {scriptPath: <this file>, args: {stage: 'backend' | 'frontend'}}.
// Stage 'backend' runs WS-A (backend repo) then WS-0 (shared frontend foundations).
// Stage 'frontend' runs WS-B/C/D/E in parallel worktrees, adversarially reviews each, fixes, then WS-F integrates.
// Sonnet 5 executes; reviewers inherit the orchestrating model. Start the local backend (:6060) before stage 'frontend'.
export const meta = {
  name: 'devpost-replacement',
  description: 'Team dashboard, project write-ups, deadlines, Hackers Choice - Sonnet executes, reviewers verify',
  phases: [
    { title: 'Backend', detail: 'WS-A in backend-ohack.dev', model: 'sonnet' },
    { title: 'Foundations', detail: 'WS-0 shared frontend modules', model: 'sonnet' },
    { title: 'Frontend', detail: 'WS-B/C/D/E in parallel worktrees', model: 'sonnet' },
    { title: 'Review', detail: 'adversarial review + fix loop' },
    { title: 'Integrate', detail: 'merge, build, verify, docs' },
  ],
}
const FRONT = '/Users/gregv/dev/fresh_ohack/frontend-ohack.dev'
const BACK = '/Users/gregv/dev/fresh_ohack/backend-ohack.dev'
const PLAN = `${FRONT}/docs/plans/team-dashboard-devpost-replacement.md`
const APPX = `${FRONT}/docs/plans/team-dashboard-devpost-replacement.appendix.md`
const RESULT = {
  type: 'object',
  properties: {
    branch: { type: 'string' },
    worktree_path: { type: 'string' },
    summary: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    tests: { type: 'string' },
    open_questions: { type: 'array', items: { type: 'string' } },
  },
  required: ['branch', 'summary', 'files', 'tests'],
}
const VERDICT = {
  type: 'object',
  properties: { ok: { type: 'boolean' }, findings: { type: 'array', items: { type: 'string' } } },
  required: ['ok', 'findings'],
}
const COMMON = `Read ${PLAN} fully (Parts 2-4, 9 and the Part 3 contracts) and your workstream's section of ${APPX}. Where the appendix conflicts with the plan, the plan wins. Do not change the judging process (rubric, scoring, rounds, results). Fix and document the Part 9 bugs assigned to your workstream. Report faithfully: if a test fails or a step is skipped, say so in 'tests'/'open_questions'. Return branch, worktree_path (absolute path of the checkout you worked in), summary, files, tests, open_questions.`

const stage = (args && args.stage) || 'backend'

if (stage === 'backend') {
  phase('Backend')
  const backend = await agent(
    `Execute WS-A of the plan in ${BACK} on branch feat/submissions-peer-vote (already checked out). ${COMMON} Run ENVIRONMENT=test pytest for every touched test directory plus pylint -E on the new blueprints. Commit in logical chunks with clear messages (no push).`,
    { label: 'WS-A backend', model: 'sonnet', schema: RESULT },
  )
  log(`WS-A: ${backend ? backend.summary : 'no result'}`)
  phase('Foundations')
  const found = await agent(
    `Execute WS-0 of the plan in ${FRONT} on branch feat/team-dashboard-devpost-replacement (already checked out). ${COMMON} Create only the WS-0 modules and their tests; run npm test for them and eslint on the new files; commit (no push).`,
    { label: 'WS-0 foundations', model: 'sonnet', schema: RESULT },
  )
  log(`WS-0: ${found ? found.summary : 'no result'}`)
  return { backend, found }
}

phase('Frontend')
const WS = [
  { key: 'WS-B', title: 'Team dashboard (manageteam rewrite)' },
  { key: 'WS-C', title: 'Project page, gallery, results, judge video, mentor heads-down tag' },
  { key: 'WS-D', title: 'Hackers Choice vote page' },
  { key: 'WS-E', title: 'Admin deadlines, TeamManagement submissions, PeerVoteResults' },
]
const fronts = await pipeline(
  WS,
  (ws) =>
    agent(
      `Execute ${ws.key} (${ws.title}) of the plan. You are in an isolated git worktree of ${FRONT}; create and commit on a branch named ws/${ws.key.toLowerCase()} inside it. WS-0 modules already exist on the base branch - import them, never recreate. A READ-ONLY production-bound backend runs on http://localhost:6060 (never send writes there) and a sandbox backend bound to the test Firestore runs on http://localhost:6061 for any write-path checks; every new endpoint must degrade gracefully on 404. Run eslint + prettier on touched files and npm test for any test you add. ${COMMON}`,
      { label: ws.key, phase: 'Frontend', model: 'sonnet', isolation: 'worktree', schema: RESULT },
    ),
  (res, ws) =>
    res &&
    agent(
      `Adversarially review the ${ws.key} work in ${res.worktree_path || FRONT} (branch ${res.branch}): run git diff against feat/team-dashboard-devpost-replacement and read the changed files. Check against ${PLAN}: module-scope section components (no components defined inside render), exactly one <h1> per page, CLS reservations on async media, no eager per-card fetches, 404/older-backend fallbacks, no PII console logs, refined tokens/classes only (no gradients, no rainbow chips, no hardcoded font family strings, no new RefinedFonts), contracts match Part 3, judging process untouched, Part 9 bugs for this workstream fixed. Default ok=false when unsure and list concrete, file-referenced findings.`,
      { label: `review ${ws.key}`, phase: 'Review', effort: 'high', schema: VERDICT },
    ).then((verdict) => ({ ws, res, verdict })),
  (r) =>
    !r || (r.verdict && r.verdict.ok)
      ? r
      : agent(
          `Fix these review findings in ${r.res.worktree_path || FRONT} on branch ${r.res.branch} (${r.ws.key}), then re-run eslint/prettier/tests and commit: ${r.verdict.findings.join('\n')}. ${COMMON}`,
          { label: `fix ${r.ws.key}`, phase: 'Review', model: 'sonnet', schema: RESULT },
        ).then((fix) => ({ ...r, fix })),
)
const done = fronts.filter(Boolean)
log(`${done.length}/${WS.length} frontend workstreams returned; ${done.filter((f) => f.fix).length} needed a fix pass`)

phase('Integrate')
const integ = await agent(
  `Execute WS-F of the plan in ${FRONT}: merge branches ${done.map((f) => f.res.branch).join(', ')} into feat/team-dashboard-devpost-replacement (resolve conflicts preferring the plan's contracts), run npm run build, eslint + prettier on all touched files, run the Part 6 checklist honoring its Verification safety rule (reads may use :6060; every write-path check goes to the :6061 sandbox with NEXT_PUBLIC_API_SERVER_URL=http://localhost:6061; report each item pass/fail honestly), update CLAUDE.md, docs/refined-design-system.md and ga-events-reference.md as WS-F specifies, and commit (no push). ${COMMON}`,
  { label: 'WS-F integrate', schema: RESULT },
)
return { fronts: done, integ }
