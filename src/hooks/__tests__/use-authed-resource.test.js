/**
 * useAuthedResource — the Class C contract (docs/plans/reliability-bug-classes-2026-11.md):
 * wait for PropelAuth, never refetch on a token rotation, drop stale runs,
 * `loading` from the first render, a failure is `error` (never empty data),
 * 404 opt-in "feature off", background refresh never shows a spinner.
 */
import { renderHook, waitFor, act } from "@testing-library/react";
import useAuthedResource, {
  AuthedResourceError,
  authedFetchJson,
  errorStatus,
} from "../use-authed-resource";

const USER_A = { userId: "propel-a" };
const USER_B = { userId: "propel-b" };
let mockAuth;
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => mockAuth,
}));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const httpError = (status, body = {}) => new AuthedResourceError(status, body);

function setVisible() {
  Object.defineProperty(document, "hidden", {
    configurable: true,
    get: () => false,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

beforeEach(() => {
  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER_A,
    accessToken: "tok-1",
  };
});

it("is loading on the very first render when a fetch will fire", () => {
  const fetcher = jest.fn(() => new Promise(() => {}));
  const { result } = renderHook(() => useAuthedResource("r", fetcher));
  expect(result.current.status).toBe("loading");
  expect(result.current.data).toBeNull();
});

it("waits for auth: loading (never logged_out) while PropelAuth resolves, then fetches once", async () => {
  mockAuth = {
    loading: true,
    isLoggedIn: false,
    user: null,
    accessToken: null,
  };
  const fetcher = jest.fn(async ({ token }) => ({ token }));
  const seen = [];
  const { result, rerender } = renderHook(() => {
    const r = useAuthedResource("r", fetcher);
    seen.push(r.status);
    return r;
  });
  expect(result.current.status).toBe("loading");
  expect(fetcher).not.toHaveBeenCalled();

  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER_A,
    accessToken: "tok-1",
  };
  rerender();
  await waitFor(() => expect(result.current.status).toBe("ready"));
  expect(result.current.data).toEqual({ token: "tok-1" });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(seen).not.toContain("logged_out");
  expect(seen).not.toContain("error");
});

it("logged out (requireAuth) → logged_out with no request", async () => {
  mockAuth = {
    loading: false,
    isLoggedIn: false,
    user: null,
    accessToken: null,
  };
  const fetcher = jest.fn();
  const { result } = renderHook(() => useAuthedResource("r", fetcher));
  await waitFor(() => expect(result.current.status).toBe("logged_out"));
  expect(fetcher).not.toHaveBeenCalled();
});

it("logged in but token not yet present stays loading", async () => {
  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER_A,
    accessToken: null,
  };
  const fetcher = jest.fn(async () => 1);
  const { result, rerender } = renderHook(() =>
    useAuthedResource("r", fetcher),
  );
  await act(async () => {});
  expect(result.current.status).toBe("loading");
  expect(fetcher).not.toHaveBeenCalled();
  mockAuth = { ...mockAuth, accessToken: "tok-1" };
  rerender();
  await waitFor(() => expect(result.current.status).toBe("ready"));
});

it("a token rotation fires zero requests; the next request uses the new token", async () => {
  const fetcher = jest.fn(async ({ token }) => token);
  const { result, rerender } = renderHook(() =>
    useAuthedResource("r", fetcher),
  );
  await waitFor(() => expect(result.current.status).toBe("ready"));
  expect(fetcher).toHaveBeenCalledTimes(1);

  mockAuth = { ...mockAuth, accessToken: "tok-2" };
  rerender();
  mockAuth = { ...mockAuth, accessToken: "tok-3" };
  rerender();
  await act(async () => {});
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(result.current.status).toBe("ready");
  expect(result.current.tokenRef.current).toBe("tok-3");

  await act(async () => {
    await result.current.refresh();
  });
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls[1][0].token).toBe("tok-3");
  expect(result.current.data).toBe("tok-3");
});

it("an inline fetcher closure (new identity every render) does not refire", async () => {
  let calls = 0;
  const { result, rerender } = renderHook(() =>
    useAuthedResource("r", async () => {
      calls += 1;
      return calls;
    }),
  );
  await waitFor(() => expect(result.current.status).toBe("ready"));
  rerender();
  rerender();
  await act(async () => {});
  expect(calls).toBe(1);
});

it("identity change refetches, clears data, and a late response for the old user is dropped", async () => {
  const slowA = deferred();
  const fetcher = jest.fn(({ userId }) =>
    userId === "propel-a" ? slowA.promise : Promise.resolve("data-b"),
  );
  const { result, rerender } = renderHook(() =>
    useAuthedResource("r", fetcher),
  );
  expect(result.current.status).toBe("loading");

  mockAuth = { ...mockAuth, user: USER_B, accessToken: "tok-b" };
  rerender();
  await waitFor(() => expect(result.current.data).toBe("data-b"));

  await act(async () => {
    slowA.resolve("data-a");
    await slowA.promise;
  });
  expect(result.current.data).toBe("data-b");
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it("a key change refetches; the stale response for the old key never writes", async () => {
  const first = deferred();
  const fetcher = jest.fn((ctx) =>
    ctx.signal && fetcher.mock.calls.length === 1
      ? first.promise
      : Promise.resolve("k2"),
  );
  const { result, rerender } = renderHook(
    ({ k }) => useAuthedResource(["ev", k], fetcher),
    {
      initialProps: { k: "1" },
    },
  );
  rerender({ k: "2" });
  await waitFor(() => expect(result.current.data).toBe("k2"));
  // The first run was aborted.
  expect(fetcher.mock.calls[0][0].signal.aborted).toBe(true);
  await act(async () => {
    first.resolve("k1");
    await first.promise;
  });
  expect(result.current.data).toBe("k2");
});

it("a 500 is `error` (never empty data); reload() recovers", async () => {
  const fetcher = jest
    .fn()
    .mockRejectedValueOnce(httpError(500))
    .mockResolvedValueOnce(["team"]);
  const { result } = renderHook(() => useAuthedResource("r", fetcher));
  await waitFor(() => expect(result.current.status).toBe("error"));
  expect(result.current.data).toBeNull();
  expect(errorStatus(result.current.error)).toBe(500);

  let done;
  act(() => {
    done = result.current.reload();
  });
  await act(async () => {
    await done;
  });
  expect(result.current.status).toBe("ready");
  expect(result.current.data).toEqual(["team"]);
});

it("reload() on a loaded resource keeps the last good data while loading", async () => {
  const second = deferred();
  const fetcher = jest
    .fn()
    .mockResolvedValueOnce("v1")
    .mockReturnValueOnce(second.promise);
  const { result } = renderHook(() => useAuthedResource("r", fetcher));
  await waitFor(() => expect(result.current.data).toBe("v1"));
  let done;
  act(() => {
    done = result.current.reload();
  });
  await waitFor(() => expect(result.current.status).toBe("loading"));
  expect(result.current.data).toBe("v1");
  await act(async () => {
    second.resolve("v2");
    await done;
  });
  expect(result.current.data).toBe("v2");
});

it("treat404As turns a 404 into ready + the fallback; without it a 404 is an error", async () => {
  const off = renderHook(() =>
    useAuthedResource(
      "a",
      async () => {
        throw httpError(404);
      },
      { treat404As: { available: false } },
    ),
  );
  await waitFor(() => expect(off.result.current.status).toBe("ready"));
  expect(off.result.current.data).toEqual({ available: false });

  const axiosStyle = renderHook(() =>
    useAuthedResource(
      "b",
      async () => {
        const err = new Error("nope");
        err.response = { status: 404 };
        throw err;
      },
      { treat404As: (err) => ({ status: errorStatus(err) }) },
    ),
  );
  await waitFor(() =>
    expect(axiosStyle.result.current.data).toEqual({ status: 404 }),
  );

  const strict = renderHook(() =>
    useAuthedResource("c", async () => {
      throw httpError(404);
    }),
  );
  await waitFor(() => expect(strict.result.current.status).toBe("error"));
});

it("refresh() never sets loading and keeps data when it fails", async () => {
  const fetcher = jest
    .fn()
    .mockResolvedValueOnce("good")
    .mockRejectedValueOnce(httpError(503));
  const seen = [];
  const { result } = renderHook(() => {
    const r = useAuthedResource("r", fetcher);
    seen.push(r.status);
    return r;
  });
  await waitFor(() => expect(result.current.status).toBe("ready"));
  seen.length = 0;
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  let ok;
  await act(async () => {
    ok = await result.current.refresh();
  });
  warn.mockRestore();
  expect(ok).toBe(false);
  expect(result.current.status).toBe("ready");
  expect(result.current.data).toBe("good");
  expect(seen).not.toContain("loading");
  expect(fetcher.mock.calls[1][0].background).toBe(true);
});

it("refreshOnFocus: throttled, and a predicate gates it on the current data", async () => {
  const nowSpy = jest.spyOn(Date, "now");
  let now = 1_000_000;
  nowSpy.mockImplementation(() => now);
  const fetcher = jest
    .fn()
    .mockResolvedValueOnce({ status: "upcoming" })
    .mockResolvedValueOnce({ status: "open" })
    .mockResolvedValue({ status: "open" });
  const { result } = renderHook(() =>
    useAuthedResource("r", fetcher, {
      refreshOnFocus: (data) => data?.status === "upcoming",
    }),
  );
  await waitFor(() => expect(result.current.status).toBe("ready"));

  now += 5_000; // inside the 15s throttle
  await act(async () => setVisible());
  expect(fetcher).toHaveBeenCalledTimes(1);

  now += 20_000;
  await act(async () => setVisible());
  await waitFor(() => expect(result.current.data).toEqual({ status: "open" }));
  expect(fetcher).toHaveBeenCalledTimes(2);

  now += 60_000; // predicate now false ("open")
  await act(async () => setVisible());
  expect(fetcher).toHaveBeenCalledTimes(2);
  nowSpy.mockRestore();
});

it("enabled:false is idle with no request, and flips to a fetch when enabled", async () => {
  const fetcher = jest.fn(async () => "x");
  const { result, rerender } = renderHook(
    ({ on }) => useAuthedResource("r", fetcher, { enabled: on }),
    { initialProps: { on: false } },
  );
  expect(result.current.status).toBe("idle");
  await act(async () => {});
  expect(fetcher).not.toHaveBeenCalled();
  rerender({ on: true });
  await waitFor(() => expect(result.current.data).toBe("x"));
});

it("requireAuth:false fetches anonymously after auth resolves, and again when a token appears", async () => {
  mockAuth = {
    loading: true,
    isLoggedIn: false,
    user: null,
    accessToken: null,
  };
  const fetcher = jest.fn(async ({ token }) => token || "anon");
  const { result, rerender } = renderHook(() =>
    useAuthedResource("ctx", fetcher, { requireAuth: false }),
  );
  await act(async () => {});
  expect(fetcher).not.toHaveBeenCalled();

  mockAuth = {
    loading: false,
    isLoggedIn: false,
    user: null,
    accessToken: null,
  };
  rerender();
  await waitFor(() => expect(result.current.data).toBe("anon"));

  mockAuth = {
    loading: false,
    isLoggedIn: true,
    user: USER_A,
    accessToken: "tok-1",
  };
  rerender();
  await waitFor(() => expect(result.current.data).toBe("tok-1"));
  expect(fetcher).toHaveBeenCalledTimes(2);

  mockAuth = { ...mockAuth, accessToken: "tok-2" };
  rerender();
  await act(async () => {});
  expect(fetcher).toHaveBeenCalledTimes(2);
});

it("setData merges locally without a request", async () => {
  const fetcher = jest.fn(async () => [{ id: "t1", name: "Old" }]);
  const { result } = renderHook(() => useAuthedResource("r", fetcher));
  await waitFor(() => expect(result.current.status).toBe("ready"));
  act(() =>
    result.current.setData((prev) =>
      prev.map((t) => (t.id === "t1" ? { ...t, name: "New" } : t)),
    ),
  );
  expect(result.current.data).toEqual([{ id: "t1", name: "New" }]);
  expect(fetcher).toHaveBeenCalledTimes(1);
});

describe("authedFetchJson", () => {
  afterEach(() => {
    delete global.fetch;
  });

  it("sends the bearer token and returns the JSON body", async () => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ a: 1 }),
    }));
    await expect(
      authedFetchJson("https://x/y", { token: "t" }),
    ).resolves.toEqual({ a: 1 });
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe(
      "Bearer t",
    );
  });

  it("throws AuthedResourceError with status + body on a non-2xx", async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 409,
      json: async () => ({ error: "already" }),
    }));
    const err = await authedFetchJson("https://x/y", { token: "t" }).catch(
      (e) => e,
    );
    expect(err).toBeInstanceOf(AuthedResourceError);
    expect(err.status).toBe(409);
    expect(err.body).toEqual({ error: "already" });
  });
});
