import handler, { buildInfo } from "../../pages/api/build-info";

function mockRes() {
  const res = { headers: {} };
  res.setHeader = (k, v) => {
    res.headers[k] = v;
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.body = body;
    return res;
  };
  return res;
}

describe("/api/build-info", () => {
  it("reports hosts and the commit — never full URLs or secrets", () => {
    const info = buildInfo({
      VERCEL_GIT_COMMIT_SHA: "abc123",
      VERCEL_GIT_COMMIT_REF: "develop",
      VERCEL_ENV: "preview",
      NODE_ENV: "production",
      NEXT_PUBLIC_API_SERVER_URL: "https://test.api.ohack.dev",
      NEXT_PUBLIC_REACT_APP_AUTH_URL: "https://44082960.propelauthtest.com",
      STRIPE_SECRET_KEY: "sk_test_should_not_leak",
    });
    expect(info).toEqual({
      commit_sha: "abc123",
      commit_ref: "develop",
      vercel_env: "preview",
      node_env: "production",
      api_host: "test.api.ohack.dev",
      auth_issuer_host: "44082960.propelauthtest.com",
    });
    expect(JSON.stringify(info)).not.toContain("sk_test");
  });

  it("tolerates missing / malformed values", () => {
    expect(buildInfo({ NEXT_PUBLIC_API_SERVER_URL: "not a url" })).toEqual({
      commit_sha: null,
      commit_ref: null,
      vercel_env: null,
      node_env: null,
      api_host: null,
      auth_issuer_host: null,
    });
  });

  it("is never cached and rejects writes", () => {
    const res = mockRes();
    handler({ method: "GET" }, res);
    expect(res.statusCode).toBe(200);
    expect(res.headers["Cache-Control"]).toBe("no-store");

    const post = mockRes();
    handler({ method: "POST" }, post);
    expect(post.statusCode).toBe(405);
  });
});
