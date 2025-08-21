### `ae-tier-pricing/README.md`:
```markdown
# AE Tier Pricing

Webflow custom JavaScript for AutoEntry's tier pricing page with geotargeting and pricing calculator functionality.

## Features

### 🌍 Geotargeting
- Automatic currency detection based on user's location
- Supports major currencies (USD, EUR, GBP, CAD, AUD, etc.)
- Fallback to British Pound for unsupported regions
- Integration with Finsweet List Filter

### 📊 Pricing Calculator
- Interactive sliders for different usage metrics
- Real-time calculation of required credits
- Dynamic tier recommendations (Bronze, Silver, Gold, Platinum, Diamond, Sapphire)
- "Need bigger plan" message for enterprise-level requirements

### 🎛️ Plan Toggle
- Show/hide all plans functionality
- Clean toggle implementation

## Implementation

### Direct Webflow Implementation
Add to your Webflow site's custom code (Site Settings > Custom Code > Head):

```html
<script src="https://cdn.jsdelivr.net/gh/jerops/autoentry@main/ae-tier-pricing/geotargeting-calculator-toggle.js"></script>