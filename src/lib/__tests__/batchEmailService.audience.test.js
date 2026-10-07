import BatchEmailService from "../batchEmailService";

// Audience contract for the volunteer-admin email buttons. "roster" keys on
// isSelected; every other audience keys on the review `status` (via
// normalizeStatus, so a doc with no status counts as pending).
describe("BatchEmailService.filterUsersByAudience", () => {
  const users = [
    { id: "a", email: "a@x.org", status: "denied", isSelected: false },
    { id: "b", email: "b@x.org", status: "Pending", isSelected: false },
    { id: "c", email: "c@x.org", isSelected: false }, // no status → pending
    { id: "d", email: "d@x.org", status: "approved", isSelected: true },
    { id: "e", email: "e@x.org", status: "waitlisted", isSelected: false },
    { id: "f", email: "", status: "pending", isSelected: false }, // no email
    { email: "g@x.org", status: "pending", isSelected: false }, // no id
  ];
  const ids = (list) => list.map((u) => u.id);

  it("pending = status pending or blank, with contact details", () => {
    expect(ids(BatchEmailService.filterUsersByAudience(users, "pending"))).toEqual(["b", "c"]);
  });

  it("denied / waitlisted key on status only", () => {
    expect(ids(BatchEmailService.filterUsersByAudience(users, "denied"))).toEqual(["a"]);
    expect(ids(BatchEmailService.filterUsersByAudience(users, "waitlisted"))).toEqual(["e"]);
  });

  it("roster keys on isSelected, not status", () => {
    expect(ids(BatchEmailService.filterUsersByAudience(users, "roster"))).toEqual(["d"]);
  });

  it("unknown audiences yield nobody", () => {
    expect(BatchEmailService.filterUsersByAudience(users, "approved")).toEqual([]);
  });
});
