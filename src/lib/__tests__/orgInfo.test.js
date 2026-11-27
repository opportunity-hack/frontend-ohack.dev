import {
  ORG_CITY_STATE_ZIP,
  ORG_EIN,
  ORG_INFO,
  ORG_LEGAL_NAME,
  ORG_TAX_STATUS,
} from "../orgInfo";
import { ORG } from "../../components/Letters/letterConfig";

describe("orgInfo", () => {
  it("carries Opportunity Hack's real EIN", () => {
    expect(ORG_EIN).toBe("84-5113049");
    expect(ORG_INFO.ein).toBe("84-5113049");
  });

  it("is the source for the letter generator's ORG block", () => {
    expect(ORG.ein).toBe(ORG_EIN);
    expect(ORG.name).toBe(ORG_LEGAL_NAME);
    expect(ORG.taxStatus).toBe(ORG_TAX_STATUS);
  });

  it("states the city, not a street address", () => {
    expect(ORG_CITY_STATE_ZIP).toBe("Phoenix, Arizona 85016");
    expect(ORG_LEGAL_NAME).toBe("Opportunity Hack, Inc.");
  });
});
