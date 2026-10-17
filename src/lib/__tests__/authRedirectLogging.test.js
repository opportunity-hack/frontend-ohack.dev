import { redirectToLoginPageWithLogging } from "../authRedirectLogging";

describe("redirectToLoginPageWithLogging", () => {
  let info, error;
  beforeEach(() => {
    jest.useFakeTimers();
    info = jest.spyOn(console, "info").mockImplementation(() => {});
    error = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.useRealTimers();
    info.mockRestore();
    error.mockRestore();
  });

  const options = { postLoginRedirectUrl: "https://www.ohack.dev/x" };

  it("still redirects when getLoginPageUrl is not provided (useRedirectFunctions() shape)", () => {
    // Regression: the first version read getLoginPageUrl off the
    // useRedirectFunctions() object, threw, and never redirected.
    const redirectToLoginPage = jest.fn();
    redirectToLoginPageWithLogging({ redirectToLoginPage }, options, "navbar");
    expect(redirectToLoginPage).toHaveBeenCalledWith(options);
    expect(info).toHaveBeenCalledWith(expect.stringContaining("navigating to <unavailable>"));
    expect(error).not.toHaveBeenCalled();
  });

  it("still redirects when getLoginPageUrl throws", () => {
    const redirectToLoginPage = jest.fn();
    const getLoginPageUrl = jest.fn(() => {
      throw new Error("client not ready");
    });
    redirectToLoginPageWithLogging({ redirectToLoginPage, getLoginPageUrl }, options);
    expect(redirectToLoginPage).toHaveBeenCalledWith(options);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("getLoginPageUrl threw"), expect.any(Error));
  });

  it("logs the computed URL, redirects, and reports a silent non-navigation", () => {
    const redirectToLoginPage = jest.fn();
    const getLoginPageUrl = jest.fn(() => "https://auth.ohack.dev/login?rt=x");
    redirectToLoginPageWithLogging({ redirectToLoginPage, getLoginPageUrl }, options, "navbar");
    expect(getLoginPageUrl).toHaveBeenCalledWith(options);
    expect(info).toHaveBeenCalledWith("[auth][login] (navbar) navigating to https://auth.ohack.dev/login?rt=x");
    expect(redirectToLoginPage).toHaveBeenCalledWith(options);
    jest.runAllTimers(); // page still alive → the redirect silently failed
    expect(error).toHaveBeenCalledWith(expect.stringContaining("did not navigate"));
  });

  it("reports when redirectToLoginPage is missing or throws", () => {
    redirectToLoginPageWithLogging({}, options, "navbar");
    expect(error).toHaveBeenCalledWith(expect.stringContaining("redirectToLoginPage is not available"));

    const redirectToLoginPage = jest.fn(() => {
      throw new Error("boom");
    });
    error.mockClear();
    redirectToLoginPageWithLogging({ redirectToLoginPage }, options);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("redirectToLoginPage threw"), expect.any(Error));
    jest.runAllTimers();
    // No silent-no-navigation report stacked on top of the thrown error.
    expect(error).toHaveBeenCalledTimes(1);
  });
});
