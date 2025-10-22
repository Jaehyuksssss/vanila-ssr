# Vanilla SSR (npm: vanilla-ssr)

[![npm version](https://img.shields.io/npm/v/vanilla-ssr.svg)](https://www.npmjs.com/package/vanilla-ssr)
[![npm downloads](https://img.shields.io/npm/dm/vanilla-ssr.svg)](https://www.npmjs.com/package/vanilla-ssr)
[![bundle size](https://img.shields.io/bundlephobia/minzip/vanilla-ssr?label=bundle%20size)](https://bundlephobia.com/package/vanilla-ssr)
[![GitHub Stars](https://img.shields.io/github/stars/jaehyuksssss/vanila-components?style=social)](https://github.com/jaehyuksssss/vanila-components)
[![CI](https://github.com/jaehyuksssss/vanila-components/actions/workflows/ci.yml/badge.svg)](https://github.com/jaehyuksssss/vanila-components/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Vanilla Components is an SSR-first UI toolkit for vanilla JavaScript dashboards and multi-framework sites. Render accessible markup on the server (Blade/Twig, Laravel, Razor, Go templates, Express, Next.js) and hydrate behaviour on the client without adopting a SPA framework. The library ships with battle-tested admin widgets, **shadcn/ui-inspired styling**, and TypeScript definitions for predictable integrations.

If you find this useful, please consider starring the repository to support the project.

👉 [Star on GitHub](https://github.com/jaehyuksssss/vanila-components)

English | [한국어](README.ko.md)

**📚 [Documentation & Playground](https://docs-vanilla-ssr.vercel.app/)** | **📦 [npm Package](https://www.npmjs.com/package/vanilla-ssr)**

> The package was renamed from `vanila-components` to `vanilla-ssr`. Most users only need to update import paths. See `MIGRATION.md`.

## Highlights

- **🎨 shadcn/ui Design** _(v0.3.1)_ – Professional, refined styling with subtle shadows, HSL colors, and perfect dark mode.
- **SSR-first** – Every component exposes `render*Markup` and `hydrate*` helpers so you can generate HTML on the server and attach behaviour on the client.
- **Admin-ready widgets** – Filter bars, data tables, metric cards, accordions, toasts, modals, bottom sheets, cards, input/select/date pickers, pagination, banners, and file uploaders.
- ** Utility components** _(v0.3.0)_ – Pre-styled badges, chips, status dots, and table helpers to eliminate repetitive CSS.
- ** Theme system** _(v0.3.0)_ – Built-in light/dark mode support with customizable HSL color tokens.
- **Accessible by default** – Focus ring states, keyboard-friendly interactions, ARIA attributes, and consistent design tokens.
- **Styling options** – Import the bundled CSS, inject at runtime, or pull the raw stylesheet string for custom pipelines.
- **Consistent DX** – Mount helpers share optional `target`, `id`, and `className` props so you can wire components without guessing argument order.
- **TypeScript + tests** – Rich typings and Vitest coverage for critical behaviours (SSR markup, hydration, event APIs, custom delete flows, etc.).
- **Docs & playground** – A Next.js documentation site with interactive previews and a live dashboard playground (`npm run docs:dev`).

## Installation

```bash
npm install vanilla-ssr
```

## Quick Start

```ts
import {
  hydrateAllVanilaComponents,
  showModal,
  showToast,
} from "vanilla-ssr";

// 1) inject styles once + hydrate any SSR markup
hydrateAllVanilaComponents();

showModal({
  title: "Welcome",
  message: "Vanilla Components ready",
  primaryButtonText: "Close",
});

showToast({
  message: "Saved",
  type: "success",
});
```

`hydrateAllVanilaComponents()` accepts the same `root` selector as `hydrateVanilaComponents()` and adds `injectStyles`, `styleTarget` flags if you need to control where the CSS string is mounted.

### Lazy/Conditional Hydration

```ts
import {
  hydrateOnVisible,
  hydrateOnInteraction,
  hydrateOnIdle,
} from "vanilla-ssr/client";

// When visible (IntersectionObserver)
hydrateOnVisible("[data-vanila-component='data-table']", (el) => {
  import("vanilla-ssr/components/data-table").then(({ hydrateDataTable }) => {
    hydrateDataTable(el as HTMLDivElement);
  });
});

// On first interaction (click/focus/keydown)
hydrateOnInteraction("[data-vanila-component='modal']", (el) => {
  import("vanilla-ssr/components/modal").then(({ hydrateModal }) => {
    hydrateModal(el as HTMLDivElement);
  });
});

// When the browser is idle (fallback timeout 1s)
hydrateOnIdle(() => {
  // pre-hydrate low-priority widgets
});
```

### Global Configuration (target, styles, CSP nonce)

```ts
import { configure, hydrateAllVanilaComponents } from "vanilla-ssr";

configure({
  // default container for overlays (modal/toast/bottom sheet)
  defaultTarget: "#modal-root",
  // where to inject the CSS when using hydrateAll*
  styleTarget: document,
  // add CSP nonce to injected <style>
  csp: { nonce: (window as any).__CSP_NONCE__ },
  // enable hydration debug logs
  debug: process.env.NODE_ENV === "development",
});

hydrateAllVanilaComponents();
```

### How it fits into your stack

1. `npm install vanilla-ssr`
2. Import the CSS bundle, call `hydrateAllVanilaComponents()` for auto-injection, or use `injectVanilaStyles()` (Shadow DOM compatible)
3. Server-side: generate HTML via `render*Markup()` helpers
4. Client-side: call the matching `hydrate*()` or `hydrateVanilaComponents()` to attach events
5. Pure browser usage: use the `create*()` helpers instead of SSR

### Shared component options

To keep APIs predictable, most helpers accept a couple of optional props:

- `target`: where to append overlays (`showModal`, `showBottomSheet`, `showToast`, `renderCards`); accepts a selector or an `HTMLElement`.
- `id`: sets the root element ID (mirrors SSR markup).
- `className`: appends custom classes without clobbering defaults.
- `clearContainer`: opt-out of clearing the host before `renderCards`.

These props are fully typed and produce descriptive runtime errors when misused.

### SSR-friendly example

```ts
// Server (Razor/PHP/Go/etc.)
import { renderInputFieldMarkup } from "vanilla-ssr";

const markup = renderInputFieldMarkup({
  name: "project",
  label: "Project name",
  placeholder: "Internal dashboard",
});
// -> render markup string inside your template

// Client
import { injectVanilaStyles, hydrateInputField } from "vanilla-ssr";

injectVanilaStyles();
document
  .querySelectorAll('[data-vanila-component="input-field"]')
  .forEach((element) => {
    hydrateInputField(element as HTMLDivElement, {
      onChange: (value) => console.log(value),
    });
  });
```

### Loading styles

```ts
// Option 1: bundler import
import "vanilla-ssr/styles.css";

// Option 2: runtime injection
import { injectVanilaStyles } from "vanilla-ssr";

injectVanilaStyles();
```

## Component snippets

Below are concise usage examples. Visit the docs (`npm run docs:dev`) for live previews, API tables, and recipes.

### Modal

```ts
import { showModal } from "vanilla-ssr";

showModal({
  id: "confirm-delete-modal",
  className: "dashboard-modal",
  target: "#modal-root",
  title: "Delete confirmation",
  message: "Are you sure you want to remove this item?",
  primaryButtonText: "Delete",
  secondaryButtonText: "Cancel",
  onPrimaryAction: () => console.log("confirmed"),
  onSecondaryAction: () => console.log("cancelled"),
});
```

### Toast

```ts
import { showToast } from "vanilla-ssr";

showToast({
  message: "Saved successfully",
  type: "success",
  duration: 2500,
  dismissible: true,
  position: "top",
});
```

### Accordion (custom delete flow)

```ts
import { createAccordion } from "vanilla-ssr";

const accordion = createAccordion({
  title: "FAQ",
  content: "Click to edit this content inline.",
  onDeleteRequest: ({ defaultHandler }) => defaultHandler(),
  onContentChange: (value) => console.log("new content", value),
});

document.getElementById("accordion-wrapper")?.append(accordion);
```

### Bottom Sheet

```ts
import { showBottomSheet } from "vanilla-ssr";

showBottomSheet({
  id: "filters-bottom-sheet",
  className: "dashboard-bottom-sheet",
  target: document.body,
  title: "Filters",
  content: "Customise your dashboard filters.",
  primaryButtonText: "Apply",
  onPrimaryAction: () => console.log("applied"),
});
```

### Card

```ts
import { renderCards, bindCardClickEvents } from "vanilla-ssr";

renderCards({
  container: "#card-container",
  cards: [
    {
      id: "project-alpha",
      className: "project-card",
      title: "Card 1",
      description: "Internal note",
      imageUrl: "/card.png",
    },
  ],
});

bindCardClickEvents("#card-container", (title) => {
  console.log(`${title} clicked`);
});
```

### Input Field

```ts
import { createInputField } from "vanilla-ssr";

const field = createInputField({
  name: "project-name",
  label: "Project",
  helperText: "Displayed inside the dashboard",
  prefix: "#",
  onChange: (value) => console.log(value),
});

field.setValue("Refactor billing");
field.setError("Required field");
```

### Select Field

```ts
import { createSelectField } from "vanilla-ssr";

const select = createSelectField({
  name: "status",
  label: "Status",
  placeholder: "All",
  options: [
    { label: "Pending", value: "pending" },
    { label: "In progress", value: "progress" },
    { label: "Done", value: "done" },
  ],
  onChange: (value) => console.log(value),
});

select.setValue("progress");
```

### Filter Bar

```ts
import { createFilterBar } from "vanilla-ssr";

const filterBar = createFilterBar({
  fields: [
    {
      type: "search",
      name: "query",
      label: "Search",
      placeholder: "Project or owner",
    },
    {
      type: "select",
      name: "status",
      label: "Status",
      placeholder: "All",
      options: [
        { label: "Pending", value: "pending" },
        { label: "In progress", value: "progress" },
        { label: "Done", value: "done" },
      ],
    },
  ],
  autoSubmit: true,
  onSubmit: (values) => console.log(values),
});
```

### Date & Time Picker

```ts
import { createDatePicker } from "vanilla-ssr";

const createdRange = createDatePicker({
  mode: "date-range",
  name: "createdAt",
  label: "Created between",
  defaultValue: {
    start: "2024-01-01",
    end: "2024-01-07",
  },
  onChange: (value) => console.log(value),
});

createdRange.setMin("2023-12-01");
document.body.append(createdRange);
```

### Pagination

```ts
import { createPagination } from "vanilla-ssr";

const pagination = createPagination({
  totalPages: 12,
  currentPage: 4,
  showFirstLast: true,
  onPageChange: (page) => console.log("Page moved to", page),
});

pagination.setCurrentPage(6);
document.body.append(pagination);
```

### Banner

```ts
import { createBanner } from "vanilla-ssr";

const banner = createBanner({
  message: "A new version has been released.",
  variant: "success",
  dismissible: true,
  actions: [{ label: "View changelog", href: "/changelog" }],
  onAction: (action) => console.log(action.label, "clicked"),
});

document.body.prepend(banner);
```

### File Uploader

```ts
import { createFileUploader } from "vanilla-ssr";

const uploader = createFileUploader({
  name: "attachments",
  label: "Attachments",
  multiple: true,
  maxFiles: 5,
  onFilesChange: (files) => console.log(files.length, "file(s) selected"),
});

document.body.append(uploader);
```

### Data Table

```ts
import { createDataTable } from "vanilla-ssr";

const table = createDataTable({
  columns: [
    { key: "name", header: "Project", width: "34%" },
    { key: "owner", header: "Owner", width: "18%" },
    { key: "status", header: "Status", width: "16%" },
    {
      key: "progress",
      header: "Progress",
      align: "right",
      render: (value) => `${value}%`,
    },
  ],
  data: rows,
  caption: "Active projects",
  onRowClick: (row) => console.log(row),
});
```

### Metric Card

```ts
import { createMetricCard } from "vanilla-ssr";

const metric = createMetricCard({
  label: "Active projects",
  value: 12,
  description: "Updated every hour",
  variant: "success",
  trend: { direction: "up", label: "+2.1%" },
});

metric.update({ value: 14, trend: { direction: "up", label: "+16%" } });
```

## 🆕 Utility Components (v0.3.0)

Pre-built, styled components for common UI patterns. **No custom CSS required!**

### Badge

```ts
import { renderBadge, TableHelpers } from "vanilla-ssr";

// Standalone usage
const badge = renderBadge({
  label: "Active",
  variant: "success",
  dot: true,
});

// In DataTable
createDataTable({
  columns: [
    {
      key: "status",
      header: "Status",
      ...TableHelpers.statusColumn({
        active: "success",
        pending: "warning",
        failed: "danger",
      }),
    },
  ],
  data: rows,
});
```

**Result**: Eliminates 400+ lines of custom CSS for status badges!

### Chip

```ts
import { createChip, renderChips } from "vanilla-ssr";

// Interactive chip
const chip = createChip({
  label: "TypeScript",
  value: "ts",
  removable: true,
  onRemove: (value) => console.log("Removed:", value),
});

// Multiple chips
const html = renderChips(["React", "Vue", "Angular"], { removable: true });
```

### Status Dot

```ts
import { renderStatusDot, StatusPresets } from "vanilla-ssr";

// Custom status
renderStatusDot({ label: "Online", color: "green", pulse: true });

// Quick presets
StatusPresets.online();
StatusPresets.busy();
StatusPresets.away();
```

### Table Helpers

Pre-configured column renderers for DataTable:

```ts
import { createDataTable, TableHelpers } from "vanilla-ssr";

createDataTable({
  columns: [
    {
      key: "status",
      header: "Status",
      ...TableHelpers.statusBadgeWithDot({
        healthy: "success",
        warning: "warning",
        critical: "danger",
      }),
    },
    {
      key: "progress",
      header: "Progress",
      ...TableHelpers.progressColumn(), // Visual progress bar
    },
    {
      key: "health",
      header: "Health",
      ...TableHelpers.healthColumn(), // Colored status dots
    },
    {
      key: "createdAt",
      header: "Created",
      ...TableHelpers.dateColumn("relative"), // "2h ago"
    },
    {
      key: "revenue",
      header: "Revenue",
      ...TableHelpers.numberColumn({ prefix: "$", decimals: 2 }),
    },
    {
      key: "tags",
      header: "Tags",
      ...TableHelpers.tagsColumn(), // Multiple badges
    },
  ],
  data: rows,
});
```

**Available helpers:**

- `statusColumn()` – Status badges
- `statusBadgeWithDot()` – Status badges with indicator dot
- `progressColumn()` – Visual progress bars
- `healthColumn()` – Health status dots
- `booleanColumn()` – Checkmark/cross indicators
- `numberColumn()` – Formatted numbers with prefix/suffix
- `dateColumn()` – Date formatting (short/long/relative)
- `tagsColumn()` – Multiple badges
- `truncateColumn()` – Ellipsis for long text

## 🎨 Theme System (v0.3.0)

Built-in dark mode and color customization.

### Quick Start

```ts
import { applyThemeMode, toggleTheme } from "vanilla-ssr";

// Apply dark mode
applyThemeMode("dark");

// Toggle theme
document.getElementById("theme-toggle")?.addEventListener("click", () => {
  toggleTheme();
});
```

### Custom Colors

```ts
import { applyThemeMode } from "vanilla-ssr";

applyThemeMode("light", {
  "--vanila-theme-primary": "#8b5cf6", // Purple
  "--vanila-theme-success": "#10b981", // Custom green
});
```

### Advanced Usage

```ts
import { applyTheme, lightTheme, darkTheme } from "vanilla-ssr";

// Full control
const customTheme = {
  ...darkTheme,
  "--vanila-theme-primary": "#ff6b6b",
  "--vanila-theme-bg": "#1a1a2e",
};

applyTheme(customTheme);

// Apply to specific element (Shadow DOM support)
applyTheme(darkTheme, shadowRoot);
```

**Supported tokens:**

- Background: `--vanila-theme-bg`, `--vanila-theme-bg-secondary`
- Foreground: `--vanila-theme-fg`, `--vanila-theme-fg-muted`
- Border: `--vanila-theme-border`
- Semantic: `--vanila-theme-primary`, `--vanila-theme-success`, `--vanila-theme-warning`, `--vanila-theme-danger`, `--vanila-theme-info`

## Scripts

| Command              | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| `npm run dev`        | Start the Vite dev server and playground (`src/demo`).                   |
| `npm run build`      | Generate bundled outputs (ESM/CJS/UMD) and declaration files in `dist/`. |
| `npm run preview`    | Preview the built bundle locally.                                        |
| `npm run test:run`   | Run the Vitest suite.                                                    |
| `npm run docs:dev`   | Start the Next.js docs site (`docs/`).                                   |
| `npm run docs:build` | Build the documentation site for production deployment.                  |

## Development workflow

1. `npm install`
2. Modify components under `src/lib`, update demos in `src/demo`
3. `npm run build` to produce publishable output
4. `npm run test:run` to make sure behaviour and hydration flows are intact

## Roadmap & Adoption

- See ROADMAP.md for priorities focused on DX, performance, and documentation that drive real-world adoption.
- Contributions welcome — bugs/docs/examples/starter templates via Issues/PRs.

## License

MIT
