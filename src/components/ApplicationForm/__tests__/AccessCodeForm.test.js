import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import AccessCodeForm, { ACCESS_CODE_WRONG_ERROR } from "../AccessCodeForm";

describe("AccessCodeForm", () => {
  it("rejects a wrong code and keeps the form locked", () => {
    const onUnlock = jest.fn();
    render(<AccessCodeForm passcode="late-2026" onUnlock={onUnlock} />);
    fireEvent.change(screen.getByLabelText(/access code/i), { target: { value: "nope" } });
    fireEvent.click(screen.getByRole("button", { name: /unlock application/i }));
    expect(onUnlock).not.toHaveBeenCalled();
    expect(screen.getByText(ACCESS_CODE_WRONG_ERROR)).toBeInTheDocument();
  });

  it("unlocks with the right code (trimmed)", () => {
    const onUnlock = jest.fn();
    render(<AccessCodeForm passcode="late-2026" onUnlock={onUnlock} />);
    fireEvent.change(screen.getByLabelText(/access code/i), { target: { value: " late-2026 " } });
    fireEvent.click(screen.getByRole("button", { name: /unlock application/i }));
    expect(onUnlock).toHaveBeenCalledTimes(1);
  });

  it("disables the button until something is typed", () => {
    render(<AccessCodeForm passcode="x" onUnlock={jest.fn()} />);
    expect(screen.getByRole("button", { name: /unlock application/i })).toBeDisabled();
  });
});
