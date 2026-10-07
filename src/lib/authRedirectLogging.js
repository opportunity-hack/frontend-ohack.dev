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
// redirectFns is the object returned by useRedirectFunctions() (it carries
// both getLoginPageUrl and redirectToLoginPage). options are passed straight
// through to the SDK. source is a short label like "navbar" so the log line
// identifies which button was clicked.
export function redirectToLoginPageWithLogging(redirectFns, options, source) {
  const label = `[auth][login]${source ? ` (${source})` : ""}`;
  let loginUrl = "<unknown>";
  try {
    loginUrl = redirectFns.getLoginPageUrl(options);
  } catch (err) {
    console.error(`${label} getLoginPageUrl threw before navigating`, err);
    return;
  }
  console.info(`${label} navigating to ${loginUrl}`);
  try {
    redirectFns.redirectToLoginPage(options);
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
