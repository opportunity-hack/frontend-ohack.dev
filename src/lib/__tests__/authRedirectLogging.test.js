import { redirectToLoginPageWithLogging } from "../authRedirectLogging";

describe("authRedirectLogging", () => {
  let infoSpy;
  let errorSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("logs the computed login URL and calls through to the SDK", () => {
    const redirectFns = {
      getLoginPageUrl: jest.fn(() => "https://auth.example/login?rt=abc"),
      redirectToLoginPage: jest.fn(),
    };
    const options = { postLoginRedirectUrl: "https://app.example/" };

    redirectToLoginPageWithLogging(redirectFns, options, "navbar");

    expect(redirectFns.getLoginPageUrl).toHaveBeenCalledWith(options);
    expect(redirectFns.redirectToLoginPage).toHaveBeenCalledWith(options);
    expect(infoSpy).toHaveBeenCalledWith(
      "[auth][login] (navbar) navigating to https://auth.example/login?rt=abc"
    );
  });

  it("reports when the page is still alive after the redirect call", () => {
    const redirectFns = {
      getLoginPageUrl: () => "https://auth.example/login?rt=abc",
      // Simulates window.location.href assignment that never navigates.
      redirectToLoginPage: () => {},
    };

    redirectToLoginPageWithLogging(redirectFns, {}, "navbar");
    jest.runAllTimers();

    expect(errorSpy).toHaveBeenCalledWith(
      "[auth][login] (navbar) redirectToLoginPage returned but the page did not navigate; computed URL was https://auth.example/login?rt=abc"
    );
  });

  it("logs and stops when getLoginPageUrl throws", () => {
    const redirectFns = {
      getLoginPageUrl: () => {
        throw new Error("Client is not initialized");
      },
      redirectToLoginPage: jest.fn(),
    };

    redirectToLoginPageWithLogging(redirectFns, {}, "navbar");
    jest.runAllTimers();

    expect(redirectFns.redirectToLoginPage).not.toHaveBeenCalled();
    expect(infoSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toContain(
      "[auth][login] (navbar) getLoginPageUrl threw before navigating"
    );
  });

  it("logs and stops when redirectToLoginPage throws", () => {
    const thrown = new Error("Client is not initialized");
    const redirectFns = {
      getLoginPageUrl: () => "https://auth.example/login?rt=abc",
      redirectToLoginPage: () => {
        throw thrown;
      },
    };

    redirectToLoginPageWithLogging(redirectFns, {}, "navbar");
    jest.runAllTimers();

    expect(errorSpy).toHaveBeenCalledWith(
      "[auth][login] (navbar) redirectToLoginPage threw",
      thrown
    );
    // No silent-no-navigation report on top of the thrown error.
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
