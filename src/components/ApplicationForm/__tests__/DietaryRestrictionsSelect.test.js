import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DietaryRestrictionsSelect, {
  DIETARY_RESTRICTION_OPTIONS,
  parseDietaryRestrictions,
  serializeDietaryRestrictions,
} from "../DietaryRestrictionsSelect";

describe("parseDietaryRestrictions", () => {
  it("returns empty state for falsy values", () => {
    expect(parseDietaryRestrictions("")).toEqual({ selected: [], other: "" });
    expect(parseDietaryRestrictions(null)).toEqual({ selected: [], other: "" });
    expect(parseDietaryRestrictions(undefined)).toEqual({
      selected: [],
      other: "",
    });
  });

  it("parses comma-joined curated options", () => {
    expect(parseDietaryRestrictions("Vegetarian, Gluten-free")).toEqual({
      selected: ["Vegetarian", "Gluten-free"],
      other: "",
    });
  });

  it("matches options case-insensitively and via aliases", () => {
    expect(
      parseDietaryRestrictions("vegan, gluten free, nut-free").selected,
    ).toEqual(["Vegan", "Gluten-free", "Nut allergy"]);
  });

  it("treats legacy free text as Other detail", () => {
    const result = parseDietaryRestrictions(
      "no pork, severe peanut allergy",
    );
    expect(result.selected).toEqual(["Other"]);
    expect(result.other).toBe("no pork, severe peanut allergy");
  });

  it("mixes curated options with free-text leftovers", () => {
    const result = parseDietaryRestrictions("Vegetarian, no cilantro");
    expect(result.selected).toEqual(["Vegetarian", "Other"]);
    expect(result.other).toBe("no cilantro");
  });

  it("dedupes repeated tokens", () => {
    expect(parseDietaryRestrictions("Vegan, vegan").selected).toEqual([
      "Vegan",
    ]);
  });
});

describe("serializeDietaryRestrictions", () => {
  it("joins selections in canonical option order", () => {
    expect(
      serializeDietaryRestrictions(["Gluten-free", "Vegetarian"], ""),
    ).toBe("Vegetarian, Gluten-free");
  });

  it("swaps Other for its detail text when provided", () => {
    expect(
      serializeDietaryRestrictions(["Vegetarian", "Other"], "no cilantro"),
    ).toBe("Vegetarian, no cilantro");
  });

  it("keeps the literal Other when no detail is given", () => {
    expect(serializeDietaryRestrictions(["Other"], "")).toBe("Other");
  });

  it("round-trips through parse", () => {
    const original = serializeDietaryRestrictions(
      ["Vegan", "Nut allergy", "Other"],
      "no cilantro",
    );
    const { selected, other } = parseDietaryRestrictions(original);
    expect(serializeDietaryRestrictions(selected, other)).toBe(original);
  });
});

describe("DietaryRestrictionsSelect", () => {
  const setup = (value = "", props = {}) => {
    const onChange = jest.fn();
    render(
      <DietaryRestrictionsSelect
        value={value}
        onChange={onChange}
        {...props}
      />,
    );
    return { onChange };
  };

  const openMenu = async (user) => {
    await user.click(screen.getByLabelText(/dietary restrictions/i));
    return screen.getByRole("listbox");
  };

  it("renders every curated option in the dropdown", async () => {
    const user = userEvent.setup();
    setup();
    const listbox = await openMenu(user);
    for (const option of DIETARY_RESTRICTION_OPTIONS) {
      expect(within(listbox).getByText(option)).toBeInTheDocument();
    }
  });

  it("emits a serialized string when an option is selected", async () => {
    const user = userEvent.setup();
    const { onChange } = setup();
    const listbox = await openMenu(user);
    await user.click(within(listbox).getByText("Vegetarian"));
    expect(onChange).toHaveBeenLastCalledWith("Vegetarian");
  });

  it("adds to an existing selection", async () => {
    const user = userEvent.setup();
    const { onChange } = setup("Vegetarian");
    const listbox = await openMenu(user);
    await user.click(within(listbox).getByText("Halal"));
    expect(onChange).toHaveBeenLastCalledWith("Vegetarian, Halal");
  });

  it("makes None exclusive", async () => {
    const user = userEvent.setup();
    const { onChange } = setup("Vegetarian, Halal");
    const listbox = await openMenu(user);
    await user.click(within(listbox).getByText("None"));
    expect(onChange).toHaveBeenLastCalledWith("None");
  });

  it("drops None when another option is picked", async () => {
    const user = userEvent.setup();
    const { onChange } = setup("None");
    const listbox = await openMenu(user);
    await user.click(within(listbox).getByText("Vegan"));
    expect(onChange).toHaveBeenLastCalledWith("Vegan");
  });

  it("shows the detail field when Other is selected and emits its text", async () => {
    const user = userEvent.setup();
    const { onChange } = setup("Other");
    const detail = screen.getByLabelText(/tell us more/i);
    expect(detail).toBeInTheDocument();
    await user.type(detail, "x");
    expect(onChange).toHaveBeenLastCalledWith("x");
  });

  it("hides the detail field when Other is not selected", () => {
    setup("Vegetarian");
    expect(screen.queryByLabelText(/tell us more/i)).not.toBeInTheDocument();
  });

  it("renders legacy free-text values as the Other detail", () => {
    setup("no pork please");
    const detail = screen.getByLabelText(/tell us more/i);
    expect(detail).toHaveValue("no pork please");
  });
});
