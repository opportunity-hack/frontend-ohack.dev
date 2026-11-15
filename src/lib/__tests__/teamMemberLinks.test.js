import { memberDocId, memberProfileHref } from "../teamMemberLinks";

describe("memberProfileHref", () => {
  it("links an enriched member by document id, never by login id", () => {
    const member = {
      id: "AbC123docId",
      user_id: "oauth2|google-oauth2|115019633184572040168",
      name: "Sam",
    };
    expect(memberProfileHref(member)).toBe("/profile/AbC123docId");
  });

  it("links a Slack-login member by document id too", () => {
    expect(
      memberProfileHref({ id: "doc9", user_id: "oauth2|slack|T1-U1" }),
    ).toBe("/profile/doc9");
  });

  it("treats a plain string entry as the document id", () => {
    expect(memberProfileHref("doc42")).toBe("/profile/doc42");
  });

  it("returns null rather than link to a login id", () => {
    expect(memberProfileHref({ user_id: "oauth2|slack|T1-U1" })).toBeNull();
    expect(memberProfileHref("oauth2|google-oauth2|115")).toBeNull();
    expect(memberProfileHref({ id: "oauth2|slack|T1-U1" })).toBeNull();
  });

  it("returns null for empty entries", () => {
    expect(memberProfileHref(null)).toBeNull();
    expect(memberProfileHref({})).toBeNull();
    expect(memberProfileHref({ id: "  " })).toBeNull();
    expect(memberDocId(undefined)).toBeNull();
  });
});
