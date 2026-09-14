/**
 * Compile/import smoke test for the workbench module. The component itself
 * needs PropelAuth + a router + a live backend to render, so this only asserts
 * the module (and everything it imports) resolves and evaluates.
 */
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({ accessToken: null, orgHelper: null, userClass: null }),
  withRequiredAuthInfo: (C) => C,
}));
jest.mock("next/router", () => ({ useRouter: () => ({ query: {}, replace: jest.fn(), pathname: "/" }) }));
jest.mock("next/head", () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock("next/image", () => ({ __esModule: true, default: () => null }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock("../../../../hooks/use-hackathon-events", () => ({ __esModule: true, default: () => ({ hackathons: [] }) }));
jest.mock("../../../../hooks/use-judge-training-status", () => ({
  __esModule: true,
  default: () => ({ statusByEmail: {}, lmsAccess: null }),
  normalizeEmail: (e) => String(e || "").toLowerCase(),
}));
jest.mock("../../../../lib/lmsClient", () => ({
  JUDGE_TRAINING_BUNDLE_URL: "",
  JUDGE_TRAINING_CERTS: [],
  extractCertToken: () => null,
  certUrlForToken: () => "",
}));

describe("VolunteerWorkbench module", () => {
  it("imports without reference errors", () => {
    const mod = require("../VolunteerWorkbench");
    expect(typeof mod.VolunteerWorkbench).toBe("function");
    expect(typeof mod.default).toBe("function");
  });
});
