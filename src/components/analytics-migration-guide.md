# OHack Analytics Migration Guide

This guide provides instructions for migrating existing Google Analytics event tracking to the new enhanced tracking system.

## Why Migrate?

The enhanced analytics system provides:
- Consistent event naming for better reporting
- Full user journey tracking
- Enhanced segmentation capabilities
- Content engagement metrics
- Improved conversion attribution
- Better privacy compliance

## Migration Steps

### 1. Replace Basic Button Click Events

**Before:**
```javascript
const gaButton = (actionName) => {
  ga.event({
    action: "button",
    params: {
      action_name: actionName
    }
  })
}

// Usage
<button onClick={() => gaButton("donate")}>Donate</button>
```

**After:**
```javascript
import { EventCategory, EventAction } from '../../lib/ga';

const handleButtonClick = (label) => {
  ga.trackStructuredEvent(
    EventCategory.NAVIGATION,
    EventAction.CLICK,
    label
  );
}

// Usage
<button onClick={() => handleButtonClick("donate_button")}>Donate</button>
```

### 2. Track Form Interactions

**Before:**
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevData) => ({ ...prevData, [name]: value }));
  trackEvent("input", "CreateHackathon", `${name}_changed`);
};
```

**After:**
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prevData) => ({ ...prevData, [name]: value }));
  
  ga.trackForm(
    "hackathon_request",
    "field_change",
    name,
    value
  );
};
```

### 3. Add Journey Tracking to Key Conversion Points

**Before:**
```jsx
<button onClick={handleSignupClick}>Sign Up Now</button>
```

**After:**
```jsx
import JourneyTracker, { JourneyTypes } from '../components/JourneyTracker';

// In your component
return (
  <>
    <JourneyTracker 
      journey={JourneyTypes.VOLUNTEER.name}
      step={JourneyTypes.VOLUNTEER.steps.JOIN_SLACK}
    />
    <button onClick={handleSignupClick}>Sign Up Now</button>
  </>
);
```

### 4. Enhance Donation Tracking

**Before:**
```jsx
<button onClick={() => gaButton("button_donate", "donate")}>
  Donate with PayPal
</button>
```

**After:**
```jsx
import DonationTracker from '../components/DonationTracker';

// At the beginning of donation flow
<DonationTracker step="begin" />

// When showing donation options
<button 
  onClick={() => {
    handleDonation(25);
  }}
>
  Donate $25
</button>

// On successful donation
<DonationTracker 
  step="complete" 
  amount={25} 
  transactionId={transactionId} 
/>
```

### 5. Track Content Engagement

Add to key content pages:

```jsx
import ScrollTracker from '../components/ScrollTracker';

// In your nonprofit detail page
return (
  <div>
    <ScrollTracker 
      pageType="nonprofit_detail" 
      contentId={nonprofitId} 
    />
    {/* Page content */}
  </div>
);
```

### 6. Enhanced Error Tracking

**Before:**
```javascript
ga.event({
  action: "404_error",
  params : {
    page_path: router.asPath
  }
});
```

**After:**
```javascript
ga.trackError(
  "not_found",
  "Page not found",
  router.asPath
);
```

## Common Component Use Cases

### HeroBanner.js

```jsx
import { EventCategory, EventAction } from '../../lib/ga';

// Replace gaButton function
const trackButtonClick = (buttonId) => {
  ga.trackStructuredEvent(
    EventCategory.NAVIGATION,
    EventAction.CLICK,
    buttonId
  );
};

// Then replace all gaButton calls
<ButtonBasicStyle
  onClick={() => trackButtonClick("submit_project_button")}
  href="/nonprofits/apply"
>
  Send us a project
</ButtonBasicStyle>
```

### NonProfit.js

```jsx
import JourneyTracker, { JourneyTypes } from '../JourneyTracker';

// Add to component return
<>
  <JourneyTracker 
    journey={JourneyTypes.NONPROFIT.name} 
    step={JourneyTypes.NONPROFIT.steps.VIEW_APPLY}
    metadata={{ nonprofit_id: nonprofitId }}
  />
  {/* Existing component JSX */}
</>
```

### Hackathon Request Form

```jsx
import { EventCategory, EventAction } from '../../lib/ga';
import JourneyTracker, { JourneyTypes } from '../components/JourneyTracker';

// Replace form tracking
const handleSubmit = async (e) => {
  // Existing code...
  
  if (response.ok) {
    ga.trackStructuredEvent(
      EventCategory.FORM,
      EventAction.SUBMIT,
      'hackathon_request',
      formData.budget
    );
    
    ga.trackJourneyStep(
      JourneyTypes.HACKATHON.name,
      JourneyTypes.HACKATHON.steps.SUBMIT_REQUEST,
      { budget: formData.budget }
    );
    
    // Rest of function...
  }
};
```

## Migration FAQs

### Q: What happens to existing GA data?
A: Existing data remains available. The new system enhances what we collect going forward.

### Q: Do I need to update all events at once?
A: No, you can migrate page by page. The old tracking functions remain for backward compatibility.

### Q: How can I test if my migration worked?
A: Google Analytics Real-Time reports will show the new event format immediately.