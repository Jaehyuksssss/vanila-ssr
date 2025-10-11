import Link from "next/link";
import { CodeBlock } from "../../components/CodeBlock";

const installSnippet = `npm install vanila-components`;
const cssSnippet = `// Option 1: import CSS bundle\nimport \"vanila-components/styles.css\";\n\n// Option 2: inject at runtime\nimport { injectVanilaStyles } from \"vanila-components\";\n\ninjectVanilaStyles();`;

const usageSnippet = `// Server-side (Razor, PHP, Go templates, etc.)\nimport { renderInputFieldMarkup } from \"vanila-components\";\n\nconst markup = renderInputFieldMarkup({\n  name: \"project\",\n  label: \"Project name\",\n  placeholder: \"Internal dashboard\",\n});\n// -> render markup into your template\n\n// Client-side hydration\nimport { hydrateInputField } from \"vanila-components\";\n\ndocument.querySelectorAll('[data-vanila-component=\"input-field\"]').forEach((element) => {\n  hydrateInputField(element as HTMLDivElement, {\n    onChange: (value) => console.log(value),\n  });\n});`;

export default function GettingStartedPage() {
  return (
    <div className="prose">
      <div>
        <h1>Getting started</h1>
        <p>
          Vanila Components is deliberately framework agnostic. Render HTML on the server, hydrate interactions in the
          browser, and keep your codebase in the language you already use—.NET Razor, PHP (Blade/Twig), Go templates, or
          Node.
        </p>
      </div>

      <section>
        <h2>Step 1 · Install</h2>
        <p>Install the package in the project that renders your templates.</p>
        <CodeBlock code={installSnippet} language="bash" />
      </section>

      <section>
        <h2>Step 2 · Load styles</h2>
        <p>
          Import the bundled CSS through your bundler, or inject it at runtime. The runtime helper is particularly handy
          when you mount widgets inside legacy apps or Shadow DOM boundaries.
        </p>
        <CodeBlock code={cssSnippet} language="ts" />
      </section>

      <section>
        <h2>Step 3 · Render HTML on the server</h2>
        <p>
          Use the <code>render*Markup</code> helpers to generate HTML strings. Insert them into your template engine like
          you would with any other server-rendered snippet.
        </p>
        <CodeBlock code={usageSnippet} language="ts" />
      </section>

      <section>
        <h2>Step 4 · Hydrate in the browser</h2>
        <p>
          After the DOM is ready, hydrate the elements. You can target specific components or run
          <code>hydrateVanilaComponents()</code> once to wire up everything that has a <code>data-vanila-component</code>
          attribute.
        </p>
        <CodeBlock
          language="ts"
          code={`import { hydrateVanilaComponents, injectVanilaStyles } from "vanila-components";

injectVanilaStyles();
hydrateVanilaComponents(); // hydrates every SSR-rendered component`}
        />
      </section>

      <section>
        <h2>Step 5 · Framework notes</h2>
        <ul>
          <li>
            <strong>.NET Razor:</strong> call <code>@Html.Raw(renderInputFieldMarkup(...))</code> inside your cshtml view
            and bundle a tiny hydration script with Vite or esbuild.
          </li>
          <li>
            <strong>PHP/Twig:</strong> echo the markup inside the template, then include a browser script that imports the
            hydration helpers (Vite, Laravel Mix, webpack Encore all work).
          </li>
          <li>
            <strong>Go html/template:</strong> write the markup string to your template, then serve a small ES module that
            runs the hydration step.
          </li>
        </ul>
      </section>

      <section>
        <h2>What next?</h2>
        <ul>
          <li>
            Explore the <Link href="/components">component catalogue</Link> for API details and live previews.
          </li>
          <li>
            Jump into <Link href="/patterns">recipes</Link> to combine tables, filters, metrics, and toasts into
            dashboards.
          </li>
          <li>
            Review the repository README for build, test, and documentation scripts.</li>
        </ul>
      </section>
    </div>
  );
}
