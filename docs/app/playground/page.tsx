import { PlaygroundDashboard } from "../../components/PlaygroundDashboard";
import { CodeBlock } from "../../components/CodeBlock";

const integrationSnippet = [
  "// routes/dashboard.ts",
  'import { renderFilterBarMarkup, renderDataTableMarkup } from "vanila-components";',
  "",
  "const filterMarkup = renderFilterBarMarkup({ fields: FILTER_FIELDS });",
  "const tableMarkup = renderDataTableMarkup({ columns: COLUMNS, data: rows });",
  "",
  "return html`",
  "  <section>${filterMarkup}</section>",
  "  <section>${tableMarkup}</section>",
  "`;",
  "",
  "// public/dashboard.js",
  'import { hydrateFilterBar, hydrateDataTable } from "vanila-components";',
  "",
  "hydrateFilterBar(document.querySelector('[data-vanila-component=\"filter-bar\"]'), {",
  "  autoSubmit: true,",
  "  onSubmit: fetchFilteredRows,",
  "});",
  "hydrateDataTable(document.querySelector('[data-vanila-component=\"data-table\"]'));",
].join("\n");

export default function PlaygroundPage() {
  return (
    <div className="prose">
      <header>
        <h1>Playground</h1>
        <p>
          Explore a fully wired admin dashboard built only with Vanila Components. Interact with the filter bar, update
          metrics, and trigger toasts—just like you would in a real SSR + hydration flow.
        </p>
      </header>

      <PlaygroundDashboard />

      <section>
        <h2>How it works</h2>
        <p>
          Render markup server-side, hydrate on the client, and glue things together with lightweight callbacks. The
          snippet below shows how a dashboard route might look.
        </p>
        <CodeBlock code={integrationSnippet} language="ts" />
      </section>
    </div>
  );
}
