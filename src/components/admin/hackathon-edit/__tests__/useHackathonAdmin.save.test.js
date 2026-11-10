import { renderHook, act, waitFor } from "@testing-library/react";
import { useHackathonAdmin } from "../useHackathonAdmin";

// Regression: pushPatch read `readOnlyRef` without declaring it, so every save
// (autosave + explicit) threw "readOnlyRef is not defined".
describe("useHackathonAdmin saves", () => {
  const event = {
    id: "doc1",
    event_id: "fall-2026",
    start_date: "2026-11-14",
    end_date: "2026-11-15",
  };

  beforeEach(() => {
    global.fetch = jest.fn(async (url, opts = {}) => ({
      ok: true,
      json: async () => ({ hackathons: [event] }),
      text: async () => "",
      method: opts.method,
    }));
  });

  const patchCalls = () =>
    global.fetch.mock.calls.filter(([, o]) => o?.method === "PATCH");

  async function setup(props) {
    const hook = renderHook(() =>
      useHackathonAdmin({
        eventId: "fall-2026",
        accessToken: "tok",
        orgId: "org",
        isAdmin: true,
        ...props,
      }),
    );
    await waitFor(() => expect(hook.result.current.hackathon).toBeTruthy());
    return hook;
  }

  it("explicit save PATCHes for an admin", async () => {
    const { result } = await setup();
    let out;
    await act(async () => {
      out = await result.current.commitSection("overview-dates");
    });
    expect(out).toEqual({ ok: true });
    expect(patchCalls()).toHaveLength(1);
  });

  it("readOnly never PATCHes", async () => {
    const { result } = await setup({ readOnly: true });
    await act(async () => {
      await result.current.commitSection("overview-dates");
    });
    expect(patchCalls()).toHaveLength(0);
  });
});
