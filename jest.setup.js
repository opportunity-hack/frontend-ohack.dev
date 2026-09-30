// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn()
    }
  })
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return children;
  };
});

// Mock matchMedia for components that use window.matchMedia
// (guarded so `@jest-environment node` suites — API routes, config — can run)
if (typeof window !== 'undefined') Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock React.useId() for components that use it. IMPORTANT: this must
// return a *unique* id per call, not a fixed string — MUI components
// (TextField, Chip, etc.) use useId() to pair a <label for> with its
// input's id, and any page rendering more than one such component with
// a fixed id collide on the same DOM id. That breaks
// screen.getByLabelText() (it resolves via getElementById, which returns
// the first match for a duplicate id), silently redirecting
// interactions to the wrong field. See LeadForm's "detects bot-like
// names" test for the failure mode this caused.
let __mockUseIdCounter = 0;
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useId: () => `test-id-${++__mockUseIdCounter}`,
  };
});

// Suppress console errors/warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      /Warning:/.test(args[0]) ||
      /The above error occurred in the <.*> component:/.test(args[0]) ||
      /Error: Uncaught/.test(args[0])
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    if (/Warning:/.test(args[0])) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});