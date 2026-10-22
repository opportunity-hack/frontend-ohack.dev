import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import InlineScoreAdjuster from "../InlineScoreAdjuster";
import { defaultScores } from "../judgingCriteria";

const team = { id: "t1", name: "Alpha" };
const GOOD_FEEDBACK = "Solid demo, clear README, deploy it behind auth next.";

const setup = (props = {}) => {
  const onSave = jest.fn();
  const onCancel = jest.fn();
  render(
    <InlineScoreAdjuster
      team={team}
      round="round1"
      initialScores={defaultScores("round1")}
      initialFeedback={GOOD_FEEDBACK}
      onSave={onSave}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onSave, onCancel };
};

describe("InlineScoreAdjuster", () => {
  it("keeps Save disabled until something actually changes", () => {
    setup();
    const save = screen.getByRole("button", { name: /save changes/i });
    expect(save).toBeDisabled();
    expect(screen.getByText(/no changes yet/i)).toBeInTheDocument();
  });

  it("enables Save after a score change, shows the diff, and sends the new scores + feedback", () => {
    const { onSave } = setup();
    const impactGroup = screen.getByRole("radiogroup", {
      name: "Impact on Community",
    });
    fireEvent.click(impactGroup.querySelector('[data-value="5"]'));

    expect(
      screen.getByText(/1 change · total 24 → 26 of 40/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("was 3")).toBeInTheDocument();

    const save = screen.getByRole("button", { name: /save changes/i });
    expect(save).toBeEnabled();
    fireEvent.click(save);
    expect(onSave).toHaveBeenCalledTimes(1);
    const [scores, feedback] = onSave.mock.calls[0];
    expect(scores.scopeImpact).toBe(5);
    expect(scores.accessibility).toBe(3);
    expect(feedback).toBe(GOOD_FEEDBACK);
  });

  it("Cancel and Escape discard without saving", () => {
    const { onSave, onCancel } = setup();
    const group = screen.getByRole("radiogroup", { name: "Data Protection" });
    fireEvent.click(group.querySelector('[data-value="1"]'));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(group, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("blocks Save when the stored feedback is too short until it is fixed", () => {
    setup({ initialFeedback: "ok" });
    const group = screen.getByRole("radiogroup", { name: "Work Remaining" });
    fireEvent.click(group.querySelector('[data-value="4"]'));
    const save = screen.getByRole("button", { name: /save changes/i });
    expect(save).toBeDisabled();
    // Feedback box is open automatically because the stored text is invalid.
    const box = screen.getByLabelText(/feedback for the team/i);
    fireEvent.change(box, { target: { value: GOOD_FEEDBACK } });
    expect(save).toBeEnabled();
  });

  it("surfaces a save error and disables controls while saving", () => {
    setup({ saving: true, error: "Couldn't save your changes." });
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn't save/i);
    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
  });
});
