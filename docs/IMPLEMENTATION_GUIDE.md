# Vanilla Components - Implementation Guide

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
    'message' => 'User information here'
]) !!}

<!-- Client-side hydration -->
<script type="module">
import { hydrateModal } from 'vanilla-ssr/client';

hydrateModal(document.getElementById('user-modal'), {
    onClose: () => console.log('Modal closed')
});
</script>
```

### Next.js (App Router)

```tsx
// app/components/UserModal.tsx
import { renderModalMarkup } from "vanilla-ssr/server";

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
    message: content,
  });

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// app/components/ClientHydration.tsx
("use client");
import { useEffect } from "react";
import { hydrateModal } from "vanilla-ssr/client";

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
const { renderDataTableMarkup } = require('vanilla-ssr/server');

app.get('/dashboard', (req, res) => {
  const tableHtml = renderDataTableMarkup({
    columns: [
      { key: 'name', header: 'Name' },
      { key: 'email', header: 'Email' }
    ],
    data: users
  });

  res.render('dashboard', { tableHtml });
});

// In your template
<div id="user-table">{{{tableHtml}}}</div>

<script type="module">
import { hydrateDataTable } from 'vanilla-ssr/client';
hydrateDataTable(document.getElementById('user-table'));
</script>
```

### .NET Razor

```csharp
@{
    var modalHtml = VanilaComponents.Server.RenderModalMarkup(new {
        id = "confirmation-modal",
        title = "Confirm Action",
        message = "Are you sure?"
    });
}

@Html.Raw(modalHtml)

<script type="module">
import { hydrateModal } from 'vanilla-ssr/client';
hydrateModal(document.getElementById('confirmation-modal'));
</script>
```

### Twig (Symfony)

```twig
{# In your Twig template #}
{{ vanila_modal({
    id: 'product-modal',
    title: 'Product Details',
    message: product.description
}) | raw }}

<script type="module">
import { hydrateModal } from 'vanilla-ssr/client';
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
} from "vanilla-ssr/server";

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
import { hydrateAllVanilaComponents } from "vanilla-ssr/client";

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
import { hydrateVanilaComponents } from "vanilla-ssr/client";

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
import { hydrateModal } from "vanilla-ssr/components/modal";

//  Avoid - Imports entire library (~50KB)
import { hydrateModal } from "vanilla-ssr";
```

#### Bundle Size Badges

- Core library: ![Core Size](https://img.shields.io/bundlephobia/minzip/vanilla-ssr)
- Modal component: ![Modal Size](https://img.shields.io/bundlephobia/minzip/vanilla-ssr/modal)
- Data Table: ![Table Size](https://img.shields.io/bundlephobia/minzip/vanilla-ssr/data-table)

### Lazy Hydration

```javascript
import { hydrateOnVisible } from "vanilla-ssr/client";

// Hydrate components when they become visible
hydrateOnVisible(
  "[data-vanila-component='data-table']",
  (element) => {
    import("vanilla-ssr/components/data-table").then(({ hydrateDataTable }) => {
      hydrateDataTable(element);
    });
  },
  { rootMargin: "100px" } // Start loading 100px before visible
);
```

### Event Delegation

현재 라이브러리에서 하이드레이션 옵션으로 이벤트 위임 설정(`useEventDelegation`)은 제공하지 않습니다. 필요 시 애플리케이션 레벨에서 이벤트 위임 패턴을 구현해 주세요.

## Theme System

### Basic Theme Setup

```javascript
import { applyThemeMode, generateThemeScript } from "vanilla-ssr/theme";

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
import { applyThemeMode } from "vanilla-ssr/theme";

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
