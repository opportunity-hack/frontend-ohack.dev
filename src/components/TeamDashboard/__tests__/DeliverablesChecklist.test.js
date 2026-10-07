import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeliverablesChecklist from "../DeliverablesChecklist";
import { deriveDeliverables } from "../../../lib/teamDeliverables";

describe("DeliverablesChecklist", () => {
  it("renders every row with its label and shows N of M done", () => {
    const deliverables = deriveDeliverables({
      team: { id: "t1", status: "IN_REVIEW" },
      activity: null,
      slackConfirmed: true,
    });
    render(
      <DeliverablesChecklist
        deliverables={deliverables}
        slackConfirmed
        onSlackConfirmChange={() => {}}
        onSubmit={() => {}}
      />,
    );

    expect(screen.getByText("Join your Slack channel")).toBeInTheDocument();
    expect(screen.getByText("Push code to your repo")).toBeInTheDocument();
    expect(screen.getByText("Write your project story")).toBeInTheDocument();
    expect(screen.getByText("Add a demo video")).toBeInTheDocument();
    expect(screen.getByText("Submit your project")).toBeInTheDocument();
    // 1 of 5 (slack) done; devpost is optional and excluded from the count.
    expect(screen.getByText("1 of 5 done")).toBeInTheDocument();
  });

  it("disables the Submit button until story and video are both present", () => {
    const deliverables = deriveDeliverables({ team: { id: "t1" } });
    render(
      <DeliverablesChecklist
        deliverables={deliverables}
        slackConfirmed={false}
        onSlackConfirmChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Submit project" }),
    ).toBeDisabled();
  });

  it("calls onSubmit when the Submit button is enabled and clicked", () => {
    const team = {
      id: "t1",
      project_tagline: "A tagline",
      project_story: "Some story",
      demo_video_url: "https://youtu.be/abc12345678",
    };
    const deliverables = deriveDeliverables({ team });
    const onSubmit = jest.fn();
    render(
      <DeliverablesChecklist
        deliverables={deliverables}
        slackConfirmed={false}
        onSlackConfirmChange={() => {}}
        onSubmit={onSubmit}
      />,
    );
    const button = screen.getByRole("button", { name: "Submit project" });
    expect(button).not.toBeDisabled();
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows 'Submitted' and disables the button once the team has submitted", () => {
    const team = { id: "t1", project_submitted_at: "2026-10-11T00:00:00Z" };
    const deliverables = deriveDeliverables({ team });
    render(
      <DeliverablesChecklist
        deliverables={deliverables}
        slackConfirmed={false}
        onSlackConfirmChange={() => {}}
        onSubmit={() => {}}
      />,
    );
    const button = screen.getByRole("button", { name: "Submitted" });
    expect(button).toBeDisabled();
  });

  it("toggles the Slack 'Everyone's in' checkbox via onSlackConfirmChange", () => {
    const deliverables = deriveDeliverables({
      team: { id: "t1" },
      slackConfirmed: false,
    });
    const onSlackConfirmChange = jest.fn();
    render(
      <DeliverablesChecklist
        deliverables={deliverables}
        slackConfirmed={false}
        onSlackConfirmChange={onSlackConfirmChange}
        onSubmit={() => {}}
      />,
    );
    const checkbox = screen.getByLabelText("Everyone's in");
    fireEvent.click(checkbox);
    expect(onSlackConfirmChange).toHaveBeenCalledWith(true);
  });
});
