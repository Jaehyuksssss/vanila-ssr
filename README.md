# Vanila Components

Vanila Components is an SSR-friendly UI toolkit for teams that live outside the SPA world. It lets you render markup on the server (Razor, Blade/Twig, Go templates, Node) and hydrate behaviour on the client without adopting a full framework. The library ships with battle-tested admin widgets, built-in styling, and TypeScript definitions.

**📚 [Documentation & Playground](https://docs-vanila-component.vercel.app/)** | **📦 [npm Package](https://www.npmjs.com/package/vanila-components)**

## Highlights

- **SSR-first** – Every component exposes `render*Markup` and `hydrate*` helpers so you can generate HTML on the server and attach behaviour on the client.
- **Admin-ready widgets** – Filter bars, data tables, metric cards, accordions, toasts, modals, bottom sheets, cards, input/select fields, and more.
- **Accessible by default** – Focus trapping for modals, keyboard-friendly interactions, ARIA attributes, and consistent design tokens.
- **Styling options** – Import the bundled CSS, inject at runtime, or pull the raw stylesheet string for custom pipelines.
- **Consistent DX** – Mount helpers share optional `target`, `id`, and `className` props so you can wire components without guessing argument order.
- **TypeScript + tests** – Rich typings and Vitest coverage for critical behaviours (SSR markup, hydration, event APIs, custom delete flows, etc.).
- **Docs & playground** – A Next.js documentation site with interactive previews and a live dashboard playground (`npm run docs:dev`).

## Installation

```bash
npm install vanila-components
```

## Quick Start

```ts
import { injectVanilaStyles, showModal, showToast } from "vanila-components";

// 1) load styles once
injectVanilaStyles();

showModal({
  title: "Welcome",
  message: "Vanila Components ready",
  primaryButtonText: "Close",
});

showToast({
  message: "Saved",
  type: "success",
});
```

### How it fits into your stack

1. `npm install vanila-components`
2. Import the CSS bundle or call `injectVanilaStyles()` (Shadow DOM compatible)
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
import { renderInputFieldMarkup } from "vanila-components";

const markup = renderInputFieldMarkup({
  name: "project",
  label: "Project name",
  placeholder: "Internal dashboard",
});
// -> render markup string inside your template

// Client
import { injectVanilaStyles, hydrateInputField } from "vanila-components";

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
import "vanila-components/styles.css";

// Option 2: runtime injection
import { injectVanilaStyles } from "vanila-components";

injectVanilaStyles();
```

## Component snippets

Below are concise usage examples. Visit the docs (`npm run docs:dev`) for live previews, API tables, and recipes.

### Modal

```ts
import { showModal } from "vanila-components";

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
import { showToast } from "vanila-components";

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
import { createAccordion } from "vanila-components";

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
import { showBottomSheet } from "vanila-components";

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
import { renderCards, bindCardClickEvents } from "vanila-components";

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
import { createInputField } from "vanila-components";

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
import { createSelectField } from "vanila-components";

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
import { createFilterBar } from "vanila-components";

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

### Data Table

```ts
import { createDataTable } from "vanila-components";

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
import { createMetricCard } from "vanila-components";

const metric = createMetricCard({
  label: "Active projects",
  value: 12,
  description: "Updated every hour",
  variant: "success",
  trend: { direction: "up", label: "+2.1%" },
});

metric.update({ value: 14, trend: { direction: "up", label: "+16%" } });
```

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

## Publish

```bash
npm run build
npm publish --dry-run
npm publish
```

## License

Currently `UNLICENSED`. Choose an appropriate license (MIT/BSD/etc.) before publishing to npm.
