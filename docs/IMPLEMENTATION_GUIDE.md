# Vanila Components - Implementation Guide

## Quick Start (5-Minute Guide)

### Laravel Blade

```php
<!-- In your Blade template -->
@php
use VanilaComponents\Server;
@endphp

<!-- Server-side rendering -->
{!! Server::renderModalMarkup([
    'id' => 'user-modal',
    'title' => 'User Details',
    'content' => '<p>User information here</p>'
]) !!}

<!-- Client-side hydration -->
<script type="module">
import { hydrateModal } from 'vanila-components/client';

hydrateModal(document.getElementById('user-modal'), {
    onClose: () => console.log('Modal closed')
});
</script>
```

### Next.js (App Router)

```tsx
// app/components/UserModal.tsx
import { renderModalMarkup } from "vanila-components/server";

export function UserModal({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const html = renderModalMarkup({
    id: "user-modal",
    title,
    content,
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// app/components/ClientHydration.tsx
("use client");
import { useEffect } from "react";
import { hydrateModal } from "vanila-components/client";

export function ClientHydration() {
  useEffect(() => {
    hydrateModal(document.getElementById("user-modal"));
  }, []);

  return null;
}
```

### Express.js

```javascript
// routes/dashboard.js
const { renderDataTableMarkup } = require('vanila-components/server');

app.get('/dashboard', (req, res) => {
  const tableHtml = renderDataTableMarkup({
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' }
    ],
    data: users
  });

  res.render('dashboard', { tableHtml });
});

// In your template
<div id="user-table">{{{tableHtml}}}</div>

<script type="module">
import { hydrateDataTable } from 'vanila-components/client';
hydrateDataTable(document.getElementById('user-table'));
</script>
```

### .NET Razor

```csharp
@{
    var modalHtml = VanilaComponents.Server.RenderModalMarkup(new {
        id = "confirmation-modal",
        title = "Confirm Action",
        content = "<p>Are you sure?</p>"
    });
}

@Html.Raw(modalHtml)

<script type="module">
import { hydrateModal } from 'vanila-components/client';
hydrateModal(document.getElementById('confirmation-modal'));
</script>
```

### Twig (Symfony)

```twig
{# In your Twig template #}
{{ vanila_modal({
    id: 'product-modal',
    title: 'Product Details',
    content: product.description
}) | raw }}

<script type="module">
import { hydrateModal } from 'vanila-components/client';
hydrateModal(document.getElementById('product-modal'));
</script>
```

## SSR-CSR Bridge Guide

### Server-Side Rendering

```javascript
// server.js
import {
  renderModalMarkup,
  getVanilaStyleText,
} from "vanila-components/server";

app.get("/page", (req, res) => {
  const modalHtml = renderModalMarkup({
    id: "my-modal",
    title: "Hello World",
  });

  const styles = getVanilaStyleText();

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>${styles}</style>
    </head>
    <body>
      ${modalHtml}
      <script type="module" src="/client.js"></script>
    </body>
    </html>
  `);
});
```

### Client-Side Hydration

```javascript
// client.js
import { hydrateAllVanilaComponents } from "vanila-components/client";

// Hydrate all components on page load
document.addEventListener("DOMContentLoaded", () => {
  hydrateAllVanilaComponents({
    injectStyles: false, // Already injected server-side
    debug: process.env.NODE_ENV === "development",
  });
});
```

### Route Boundary Handling

```javascript
// For SPA route changes
import { hydrateVanilaComponents } from "vanila-components/client";

// After route change
function onRouteChange(newContent) {
  const container = document.getElementById("app");
  container.innerHTML = newContent;

  // Hydrate only new components
  hydrateVanilaComponents({
    root: container,
    skipHydrated: true,
  });
}
```

## Performance Guide

### Bundle Size Optimization

#### Per-Component Imports (Recommended)

```javascript
//  Good - Only imports modal code (~3KB)
import { hydrateModal } from "vanila-components/modal";

//  Avoid - Imports entire library (~50KB)
import { hydrateModal } from "vanila-components";
```

#### Bundle Size Badges

- Core library: ![Core Size](https://img.shields.io/bundlephobia/minzip/vanila-components)
- Modal component: ![Modal Size](https://img.shields.io/bundlephobia/minzip/vanila-components/modal)
- Data Table: ![Table Size](https://img.shields.io/bundlephobia/minzip/vanila-components/data-table)

### Lazy Hydration

```javascript
import { hydrateOnVisible } from "vanila-components/client";

// Hydrate components when they become visible
hydrateOnVisible(
  "[data-vanila-component='data-table']",
  (element) => {
    import("vanila-components/data-table").then(({ hydrateDataTable }) => {
      hydrateDataTable(element);
    });
  },
  { rootMargin: "100px" } // Start loading 100px before visible
);
```

### Event Delegation

```javascript
// Automatic event delegation for better performance
import { hydrateVanilaComponents } from "vanila-components/client";

// Uses single event listener for all components
hydrateVanilaComponents({
  root: document.getElementById("dashboard"),
  useEventDelegation: true, // Default: true
});
```

## Theme System

### Basic Theme Setup

```javascript
import { applyThemeMode, generateThemeScript } from "vanila-components/theme";

// Apply dark mode
applyThemeMode("dark");

// Toggle theme
document.getElementById("theme-toggle").addEventListener("click", () => {
  toggleTheme();
});
```

### Preventing FART (Flash of Incorrect Theme)

```html
<!-- In your HTML head -->
<script>
  // Inject this script to prevent theme flash
  (function () {
    const stored = localStorage.getItem("vanila-theme-mode");
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const theme = stored || system;

    document.documentElement.setAttribute("data-vanila-theme", theme);
    // Apply theme tokens immediately...
  })();
</script>
```

### Custom Theme Tokens

```javascript
import { applyThemeMode } from "vanila-components/theme";

applyThemeMode("dark", {
  customTokens: {
    "--vanila-theme-primary": "#8b5cf6",
    "--vanila-theme-primary-hover": "#7c3aed",
  },
});
```

### CSS Variables Reference

```css
:root {
  /* Backgrounds */
  --vanila-theme-bg: #ffffff;
  --vanila-theme-bg-secondary: #f8fafc;

  /* Foregrounds */
  --vanila-theme-fg: #0f172a;
  --vanila-theme-fg-secondary: #475569;

  /* Borders */
  --vanila-theme-border: #e5e7eb;

  /* Colors */
  --vanila-theme-primary: #2563eb;
  --vanila-theme-success: #16a34a;
  --vanila-theme-warning: #ea580c;
  --vanila-theme-danger: #dc2626;
}
```
