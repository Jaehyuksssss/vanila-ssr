# Accessibility & Security Guide

## Accessibility Standards

### ARIA Roles and Attributes

#### Modal Components

```javascript
import { hydrateModal } from "vanilla-ssr/components/modal";

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
import { hydrateDataTable } from "vanilla-ssr/components/data-table";

hydrateDataTable(document.getElementById("my-table"), {
  // 동작 개요:
  // - 네이티브 <table> 시맨틱 사용
  // - 정렬 시 해당 헤더 셀에 aria-sort 적용
  // - 기타 테이블 ARIA 속성은 자동 설정하지 않음
});
```

### Keyboard Navigation

#### Focus Trap (Modals, Dialogs)

```javascript
import { createFocusTrap } from "vanilla-ssr/accessibility";

const focusTrap = createFocusTrap(modalElement, {
  initialFocus: "#first-input",
  returnFocusOnDeactivate: true,
  escapeDeactivates: true,
});

focusTrap.activate();
```

#### Roving Tabindex (Lists, Menus)

```javascript
import { RovingTabindex } from "vanilla-ssr/accessibility";

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
import { announceToScreenReader } from "vanilla-ssr/accessibility";

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
import { hydrateModal } from "vanilla-ssr/components/modal";
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
// ✅ Safe - Sanitize user-provided strings before rendering
import { renderModalMarkup } from "vanilla-ssr/server";
import { sanitizeHtml } from "vanilla-ssr/security";

const safeHtml = renderModalMarkup({
  title: sanitizeHtml(userInput),
  content: sanitizeHtml(userContent),
});

// Dangerous - Raw HTML injection (do not do this)
const dangerousHtml = `<div>${userInput}</div>`;
```

#### Content Sanitization

```javascript
import { sanitizeHtml } from "vanilla-ssr/security";

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
  import { hydrateAllVanilaComponents } from "vanilla-ssr/client";
  hydrateAllVanilaComponents();
</script>
```

Alternatively, set a global nonce used for runtime CSS injection:

```ts
import { configure } from "vanilla-ssr";

configure({ csp: { nonce: "abc123" } });
```

#### No Inline Scripts

```javascript
// Good - No eval() or new Function()
import { hydrateModal } from "vanilla-ssr/components/modal";

//  Avoided - No dynamic code execution
// eval('hydrateModal(element)'); // Never used in library
```

### Secure Configuration

#### Environment-Specific Settings

```javascript
import { hydrateAllVanilaComponents } from "vanilla-ssr/client";

hydrateAllVanilaComponents({
  debug: process.env.NODE_ENV === "development",
});
```

#### Input Validation

```javascript
import { createDataTable } from "vanilla-ssr/components/data-table";

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

Recommended security headers when serving Vanilla Components:

```
Content-Security-Policy: script-src 'self' 'nonce-{random}'; style-src 'self' 'nonce-{random}';
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```
