import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import LinkedInShareButton from "../../share/LinkedInShareButton";
import { buildAbsoluteUrl } from "../../../utils/socialShare";

/**
 * Copy-link + LinkedIn share, rendered as quiet ghost buttons so the page's
 * single primary CTA (Send feedback) stays primary. Renders inside
 * RefinedRoot — .ohx-* classes are safe.
 */
export default function ShareBar({ path, name }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildAbsoluteUrl(path));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Clipboard unavailable (http, permissions) — quietly no-op
    }
  };

  return (
    <>
      <button type="button" className="ohx-btn ohx-btn--ghost" onClick={handleCopy}>
        {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <LinkedInShareButton
        variant="profile"
        url={path}
        label={`Share ${name || "this portfolio"} to LinkedIn`}
      />
    </>
  );
}
