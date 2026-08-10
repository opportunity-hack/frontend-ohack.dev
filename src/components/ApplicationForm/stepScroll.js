// Shared step-navigation scroll for the multi-step application forms.
//
// On Next/Back we want the viewport to land on the NEW step's first fields —
// not the top of the page (the editorial masthead is ~600px tall, so
// window.scrollTo(0,0) forces re-scrolling past the hero on every step).
// The target element is the <Box ref={stepContentRef}> wrapping
// getStepContent(activeStep); it carries scrollMarginTop so the fixed NavBar
// doesn't cover the step heading, plus tabIndex={-1} so we can move focus.
//
// Details that matter:
// - requestAnimationFrame defers until after React commits the new step's
//   DOM, so we measure/scroll the content that will actually be on screen.
// - Focus moves to the container (focus({ preventScroll: true }) so it
//   doesn't fight the smooth scroll) — keyboard and screen-reader users
//   land in the new step instead of staying stranded on the Next button.
// - prefers-reduced-motion users get an instant jump, not a smooth glide.
export function scrollToStepContent(ref) {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => {
    const el = ref?.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (typeof el.focus === "function") {
      el.focus({ preventScroll: true });
    }
    el.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  });
}
