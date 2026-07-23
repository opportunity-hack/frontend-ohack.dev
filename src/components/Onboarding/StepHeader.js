import React from 'react';

/**
 * Shared header for every onboarding step — one consistent Fraunces title,
 * muted lead, and hairline rule. Steps render inside RefinedRoot, so the
 * .ohx-* utility classes are in scope. The page masthead owns the <h1>;
 * step titles are <h2>.
 */
const StepHeader = ({ title, subtitle }) => (
  <div style={{ textAlign: 'center', marginBottom: 28 }}>
    <h2
      className="ohx-display"
      style={{ fontSize: 'clamp(1.55rem, 3vw, 2rem)', margin: 0, lineHeight: 1.2 }}
    >
      {title}
    </h2>
    {subtitle && (
      <p
        className="ohx-muted"
        style={{ fontSize: '1.1rem', margin: '10px auto 0', maxWidth: '60ch' }}
      >
        {subtitle}
      </p>
    )}
    <hr style={{ border: 0, borderTop: '1px solid #E7E1D4', margin: '20px auto 0', width: '72%' }} />
  </div>
);

export default StepHeader;
