import {
  CHECKIN_PERMISSIONS,
  hasAnyPermission,
  orgCanCheckIn,
  orgIsCheckInOnly,
  orgIsFullAdmin,
} from "../adminPermissions";

const org = (...perms) => ({ hasPermission: (p) => perms.includes(p) });

describe("adminPermissions", () => {
  it("volunteer.admin is a superset", () => {
    const o = org("volunteer.admin");
    expect(orgIsFullAdmin(o)).toBe(true);
    expect(orgCanCheckIn(o)).toBe(true);
    expect(orgIsCheckInOnly(o)).toBe(false);
  });

  it("checkin.admin alone opens only check-in", () => {
    const o = org("checkin.admin");
    expect(orgIsFullAdmin(o)).toBe(false);
    expect(orgCanCheckIn(o)).toBe(true);
    expect(orgIsCheckInOnly(o)).toBe(true);
  });

  it("other permissions open nothing", () => {
    expect(orgCanCheckIn(org("heart.admin"))).toBe(false);
    expect(hasAnyPermission(org("heart.admin"), CHECKIN_PERMISSIONS)).toBe(
      false,
    );
  });

  it("tolerates a missing org / method (user not in the org)", () => {
    expect(orgCanCheckIn(undefined)).toBe(false);
    expect(orgIsFullAdmin({})).toBe(false);
    expect(
      orgCanCheckIn({
        hasPermission: () => {
          throw new Error("x");
        },
      }),
    ).toBe(false);
  });
});
