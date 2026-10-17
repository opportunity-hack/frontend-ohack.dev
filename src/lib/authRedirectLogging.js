// Login redirect diagnostics.
//
// The PropelAuth React SDK's redirectToLoginPage() is a bare
// `window.location.href = <login url>` assignment: it throws only when the
// SDK client is uninitialized, and logs nothing in every other failure mode.
// When the Log In button appears dead (click dispatches, no navigation, no
// error), the console holds nothing to explain why. This helper closes that
// gap: it logs the exact login URL the SDK computed before navigating,
// reports a thrown error, and reports when the call returns without the page
// navigating away. The trailing timer only fires if the page is still alive,
// which means the redirect silently failed; on a successful redirect the page
// unloads and the timer never runs.
//
// `fns` is a plain object carrying `redirectToLoginPage` (from
// useRedirectFunctions()) and, optionally, `getLoginPageUrl` (from
// useHostedPageUrls() — a DIFFERENT hook; useRedirectFunctions() does NOT
// return it). The URL lookup is diagnostics only: if it is missing or throws
// we log that and STILL redirect. Oct 2026 regression: the first version of
// this helper read getLoginPageUrl off the useRedirectFunctions() object,
// got a TypeError, and returned early — the navbar Log In button did nothing
// on every page. Diagnostics must never be able to block the redirect.
// `options` are passed straight through to the SDK. `source` is a short
// label like "navbar" so the log line identifies which button was clicked.
export function redirectToLoginPageWithLogging(fns, options, source) {
  const label = `[auth][login]${source ? ` (${source})` : ""}`;

  let loginUrl = "<unavailable>";
  if (fns && typeof fns.getLoginPageUrl === "function") {
    try {
      loginUrl = fns.getLoginPageUrl(options);
    } catch (err) {
      console.error(`${label} getLoginPageUrl threw (continuing to redirect)`, err);
    }
  }
  console.info(`${label} navigating to ${loginUrl}`);

  if (!fns || typeof fns.redirectToLoginPage !== "function") {
    console.error(`${label} redirectToLoginPage is not available; cannot navigate`);
    return;
  }
  try {
    fns.redirectToLoginPage(options);
  } catch (err) {
    console.error(`${label} redirectToLoginPage threw`, err);
    return;
  }
  // If the redirect worked, this page unloads and the timer never fires.
  setTimeout(() => {
    console.error(
      `${label} redirectToLoginPage returned but the page did not navigate; computed URL was ${loginUrl}`
    );
  }, 0);
}
