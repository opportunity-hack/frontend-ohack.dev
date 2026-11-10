// GET /api/build-info — which build is serving this request, and which backend
// + auth issuer it talks to. Lets anyone tell test.ohack.dev from www.ohack.dev
// at a glance and confirm a merge actually deployed (pairs with the backend's
// /api/health). Hosts and the commit sha only — never a secret or a full URL
// with credentials. See docs/environments.md.

function hostOf(value) {
  if (!value) return null;
  try {
    return new URL(value).host || null;
  } catch {
    return null;
  }
}

export function buildInfo(env = process.env) {
  return {
    commit_sha: env.VERCEL_GIT_COMMIT_SHA || null,
    commit_ref: env.VERCEL_GIT_COMMIT_REF || null,
    vercel_env: env.VERCEL_ENV || null,
    node_env: env.NODE_ENV || null,
    api_host: hostOf(env.NEXT_PUBLIC_API_SERVER_URL),
    auth_issuer_host: hostOf(env.NEXT_PUBLIC_REACT_APP_AUTH_URL),
  };
}

export default function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json(buildInfo());
}
