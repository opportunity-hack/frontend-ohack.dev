import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

// Wraps GoogleReCaptchaProvider so pages/components that need reCAPTCHA opt in.
// Previously this lived in _app.js and loaded the reCAPTCHA v3 script on every
// page (homepage, event pages, nonprofit pages, profile, etc.). That's a ~200KB
// download + main-thread cost on pages that don't have any form.
//
// Mount this only around the subtree that contains a form using `useRecaptcha`.
export default function ReCaptchaProvider({ children }) {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY}
      scriptProps={{ async: true, defer: true, appendTo: "body" }}
    >
      {children}
    </GoogleReCaptchaProvider>
  );
}
