# OHack Google Analytics Event Tracking Reference

This document provides a comprehensive reference of all Google Analytics events tracked across the OHack application. Use this to inform business decisions and optimize user experience based on analytics data.

## Event Tracking Implementation

The application uses a dual-tracking approach that sends events to both Google Analytics and Facebook Pixel. The main implementation is in `src/lib/ga/index.js`:

```javascript
// log specific events happening for both Google Analytics and Facebook Pixel
export const trackEvent = ({ action, params }) => {
  if (typeof window !== 'undefined') {
    // Google Analytics
    window.gtag('event', action, params);
    
    // Facebook Pixel
    if (ReactPixel) ReactPixel.track(action, params);
  }
}
```

## User Engagement Events

### Navigation & CTA Interactions

| Event Name | Description | Parameters | Business Value |
|------------|-------------|------------|---------------|
| `slack_button` | User clicks to join Slack | `{ action_name: "open_join_slack" }` | Track community growth funnel |
| `button_submit_project` | User clicks to submit nonprofit project | `{ action_name: "Submit new nonprofit project" }` | Measure nonprofit interest |
| `button_profile` | User navigates to profile page | `{ action_name: "clicked to see profile" }` | Track user engagement with profiles |
| `button_donate` | User clicks donation link | `{ action_name: "donate" }` | Track donation conversion funnel |
| `button_request` | User requests a hackathon | `{ action_name: "request_hackathon" }` | Measure demand for organized events |
| `button_see_all` | User clicks to see all projects | `{ action_name: "see_all_nonprofit_projects" }` | Track project discovery behavior |

### Authentication Events

| Event Name | Description | Parameters | Business Value |
|------------|-------------|------------|---------------|
| `login_slack` | User logs in via Slack | `{ current_page: [path] }` | Track where users login from |
| `signup_slack` | User signs up via Slack | `{ current_page: [path] }` | Identify signup sources |
| `CompleteRegistration` | User completes registration | `{}` | Measure signup completion rate |
| `Login Email Set` | Logged-in user identified to analytics (Navbar) | `{}` | Session-level login signal |
| `user_identify` | Emitted by `ga.set(email)` alongside `gtag('set','user_data')` | `{ event_category: "user", event_label: "user", email_hash }` | Ties sessions to a hashed identity |

**Dedupe (Sep 2026):** `Login Email Set` and `user_identify` fire at most **once per email per page session**. The Navbar effect keys on `user?.email` (a string) with a `useRef` guard — never on the `user` object, whose identity changes across renders and previously produced ~130K junk hits per 90 days.

### Content Interaction

| Event Name | Description | Parameters | Business Value |
|------------|-------------|------------|---------------|
| `faq_item_expanded` | User expands FAQ item | `{ faq_question: [question] }` | Identify common user questions |
| `faq_search` | User searches in FAQ | `{ search_term: [term] }` | Understand user information needs |

### Form Interactions

| Event Name | Description | Parameters | Business Value |
|------------|-------------|------------|---------------|
| `input` | Form field changed | `{ category: [form_name], label: [field_name] }` | Track form completion patterns |
| `submit` | Form submitted | `{ category: [form_name], label: [status], value: [amount] }` | Measure conversion rates |

## Hackathon Request Form Events

The hackathon request form at `/hack/request.js` implements detailed event tracking:

```javascript
// Track form field changes
trackEvent("input", "CreateHackathon", `${name}_changed`);

// Track form submission
trackEvent("submit", "CreateHackathon", "form_submitted", formData.budget);
```

This provides insights into:
- Which fields users interact with most
- Where users abandon the form
- Budget ranges being requested
- Conversion rate from form start to submission

## Error Tracking

| Event Name | Description | Parameters | Business Value |
|------------|-------------|------------|---------------|
| `404_error` | User encounters 404 page | `{ page_path: [path] }` | Identify broken links and improve navigation |

## Profile Activity

The profile component tracks various user interactions with their profile:

```javascript
// Set user data for analytics
if (user && user.email) {
  set(user.email);
}
```

This enables:
- User segmentation in analytics
- Tracking profile completion rates
- Identifying most commonly filled profile fields

## Donation & Conversion Events

`donation_interaction` (from the Givebutter widget) is the **primary donation signal**. `donation_completed` and `npo_form_submit` exist purely so GA4 can mark them as **key events** — GA4 key events match on event *name* only, not on a parameter, so a single event with a type parameter can't be used as a conversion.

| Event Name | Source | Parameters | Notes |
|------------|--------|------------|-------|
| `donation_interaction` | `GiveButterWidget.js` `trackDonationEvent` | `{ event_category: "GiveButter", event_label: "<context>_<eventType>", custom_parameter_user_id, custom_parameter_application_type }` | Fires for `widget_loaded`, `donation_started`, `donation_completed`. Primary funnel signal; keep it. |
| `donation_completed` | `GiveButterWidget.js` (`donation_completed` case only) | `{ value: <amount>, currency: "USD" }` | **GA4 key event.** Fired in addition to `donation_interaction`. `value` omitted when the widget doesn't report a numeric amount. |
| `donation_click` | `design/DonateNudge.js` `trackDonateClick(placement)` | `{ event_category: "donation", event_label: "donate_click", placement, destination: "givebutter" }` | Link-out clicks to the Givebutter general fund (homepage band, onboarding, FAQ). Not a completed donation. |
| `npo_form_submit` | `pages/nonprofits/apply/index.js` `handleSubmit` (live form) and `hooks/use-nonprofit.js` `handle_npo_form_submission` (legacy, uncalled) | `{ form_name: "nonprofit_application" }` | **GA4 key event.** Fires only after a successful `response.ok` / `data.message`. Complements the structured `form_complete` event on the same path. |

### Google Ads

- The Ads tag is configured in `_document.js` from `NEXT_PUBLIC_GOOGLE_ADS_ID` (account **371-489-1437**, `AW-3714891437` — the account linked to GA4 property ohack-dev). Unset → no Ads `config` call at all. The old hardcoded `AW-11474351176` was the wrong account.
- Blog conversion (`SingleNews.js` `gaButton`): the `send_to` conversion ping is **gated off** until a new conversion action is created in account 371-489-1437 and its label pasted into `GOOGLE_ADS_BLOG_CONVERSION_LABEL` (see the TODO in that file). The retired label `JCk6COG-q4kZEMjost8q` does not work under the new account.

## Business Intelligence Applications

### User Acquisition Optimization
- Track which pages/CTAs drive the most signups
- Identify where in the funnel users drop off
- Optimize high-performing entry points

### Content Strategy
- Use FAQ interaction data to create targeted content
- Track which projects receive most views/interest
- Identify topics users search for but can't find

### Conversion Funnel Analysis
- Measure donation link clicks to actual donations
- Track hackathon request form completion rates
- Monitor nonprofit application conversion

### Revenue Opportunity Identification
- Profile budget data from hackathon requests
- Track sponsorship interest indicators
- Monitor engagement with specific nonprofit projects

### User Segmentation
- Associate events with user identities
- Track different behavior patterns by user role
- Compare engagement metrics across segments

## Implementation Improvement Opportunities

1. Standardize event naming conventions for better analysis
2. Implement enhanced user journey tracking
3. Add scroll depth tracking for long-form content
4. Track time spent on critical pages
5. Set up goal funnels for key conversion paths

## Google Analytics Dashboard Recommendations

Create custom reports for:
1. Volunteer conversion funnel
2. Nonprofit engagement metrics
3. Hackathon request analysis
4. Revenue opportunity tracking
5. User segmentation by behavior

## How to Use This Data

1. **Monthly Metrics Review**:
   - Track growth in community signups
   - Monitor conversion rates for key actions
   - Identify top-performing content and features

2. **Quarterly Business Planning**:
   - Use hackathon request data to forecast demand
   - Analyze project engagement for resource allocation
   - Review dropout points in user journeys

3. **Continuous Improvement**:
   - A/B test different CTAs based on click data
   - Enhance FAQ based on most viewed questions
   - Optimize forms with highest abandonment rates

4. **Revenue Generation**:
   - Target sponsorship opportunities based on engagement data
   - Develop premium features around most-used functionality
   - Create corporate partnership packages informed by budget data