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