# Accessibility & Security Guide

## Accessibility Standards

### ARIA Roles and Attributes

#### Modal Components

```javascript
import { hydrateModal } from "vanila-components/modal";

hydrateModal(document.getElementById("my-modal"), {
  // Automatic ARIA attributes applied:
  // role="dialog"
  // aria-modal="true"
  // aria-labelledby="modal-title"
  // aria-describedby="modal-content"
});
```

#### Data Tables

```javascript
import { hydrateDataTable } from "vanila-components/data-table";

hydrateDataTable(document.getElementById("my-table"), {
  // Automatic ARIA attributes:
  // role="table"
  // aria-label="Data table"
  // aria-sort for sortable columns
  // aria-rowcount, aria-colcount
});
```

### Keyboard Navigation

#### Focus Trap (Modals, Dialogs)

```javascript
import { createFocusTrap } from "vanila-components/accessibility";

const focusTrap = createFocusTrap(modalElement, {
  initialFocus: "#first-input",
  returnFocusOnDeactivate: true,
  escapeDeactivates: true,
});

focusTrap.activate();
```

#### Roving Tabindex (Lists, Menus)

```javascript
import { RovingTabindex } from "vanila-components/accessibility";

const roving = new RovingTabindex(
  document.getElementById("menu"),
  '[role="menuitem"]',
  "vertical"
);

// Keyboard support:
// Arrow Up/Down: Navigate items
// Home/End: First/Last item
// Tab: Exit component
```

### Keyboard Mapping Reference

| Component  | Key           | Action                           |
| ---------- | ------------- | -------------------------------- |
| Modal      | Escape        | Close modal                      |
| Modal      | Tab/Shift+Tab | Cycle through focusable elements |
| Accordion  | Enter/Space   | Toggle panel                     |
| Accordion  | Arrow Up/Down | Navigate headers                 |
| Data Table | Arrow Keys    | Navigate cells                   |
| Data Table | Enter         | Activate cell/sort               |
| Filter Bar | Tab           | Navigate filters                 |
| Filter Bar | Enter         | Apply filter                     |

### Screen Reader Support

#### Announcements

```javascript
import { announceToScreenReader } from "vanila-components/accessibility";

// Announce status changes
announceToScreenReader("Data loaded successfully", "polite");

// Announce urgent messages
announceToScreenReader("Error: Please check your input", "assertive");
```

#### Live Regions

```html
<!-- Automatic live regions for dynamic content -->
<div data-vanila-component="toast" aria-live="polite">
  <!-- Toast messages announced automatically -->
</div>

<div data-vanila-component="data-table" aria-live="polite">
  <!-- Sort/filter changes announced -->
</div>
```

### Testing Accessibility

#### Automated Testing

```javascript
// Using axe-core
import { hydrateModal } from "vanila-components/modal";
import axe from "axe-core";

const modal = hydrateModal(document.getElementById("test-modal"));

axe.run(modal.element).then((results) => {
  console.log("Accessibility violations:", results.violations);
});
```

#### Manual Testing Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Screen reader announces content changes
- [ ] Color contrast meets WCAG AA standards
- [ ] Components work with high contrast mode
- [ ] Reduced motion preferences are respected

## Security Guidelines

### XSS Prevention

#### Safe HTML Rendering

```javascript
// ✅ Safe - Uses built-in sanitization
import { renderModalMarkup } from "vanila-components/server";

const safeHtml = renderModalMarkup({
  title: userInput, // Automatically escaped
  content: userContent, // Automatically escaped
});

// Dangerous - Raw HTML injection
const dangerousHtml = `<div>${userInput}</div>`;
```

#### Content Sanitization

```javascript
import { sanitizeHtml } from "vanila-components/security";

// Sanitize user-generated content
const cleanContent = sanitizeHtml(userInput, {
  allowedTags: ["p", "br", "strong", "em"],
  allowedAttributes: {},
});
```

### CSP (Content Security Policy) Compatibility

#### Nonce Support

```html
<!-- In your HTML head -->
<meta
  http-equiv="Content-Security-Policy"
  content="script-src 'self' 'nonce-abc123'; style-src 'self' 'nonce-abc123';"
/>

<script nonce="abc123" type="module">
  import { hydrateAllVanilaComponents } from "vanila-components/client";
  hydrateAllVanilaComponents();
</script>
```

#### No Inline Scripts

```javascript
// Good - No eval() or new Function()
import { hydrateModal } from "vanila-components/modal";

//  Avoided - No dynamic code execution
// eval('hydrateModal(element)'); // Never used in library
```

### Secure Configuration

#### Environment-Specific Settings

```javascript
import { hydrateAllVanilaComponents } from "vanila-components/client";

hydrateAllVanilaComponents({
  debug: process.env.NODE_ENV === "development", // Only in dev
  allowUnsafeHtml: false, // Always false in production
  validateProps: true, // Enable prop validation
});
```

#### Input Validation

```javascript
import { createDataTable } from "vanila-components/data-table";

createDataTable(element, {
  data: validateTableData(userData), // Validate before use
  columns: sanitizeColumns(userColumns),
  onSort: (column) => {
    // Validate column name before sorting
    if (!isValidColumnName(column)) {
      throw new Error("Invalid column name");
    }
  },
});
```

### Security Best Practices

1. **Always validate user input** before passing to components
2. **Use CSP headers** to prevent XSS attacks
3. **Sanitize HTML content** when allowing user-generated content
4. **Validate component props** in development mode
5. **Use HTTPS** for all external resources
6. **Keep dependencies updated** regularly

### Vulnerability Reporting

If you discover a security vulnerability, please:

1. **Do not** create a public GitHub issue
2. Email security@vanila-components.dev
3. Include detailed reproduction steps
4. Allow 90 days for response and fix

### Security Headers

Recommended security headers when serving Vanila Components:

```
Content-Security-Policy: script-src 'self' 'nonce-{random}'; style-src 'self' 'nonce-{random}';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```
