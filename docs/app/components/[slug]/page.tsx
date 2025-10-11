import { notFound } from "next/navigation";
import { COMPONENTS } from "../../../lib/component-data";
import { PreviewRenderer } from "../../../components/PreviewRenderer";
import { CodeBlock } from "../../../components/CodeBlock";

const CODE_TITLE_STYLE = { fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "8px" };

export function generateStaticParams() {
  return COMPONENTS.map((component) => ({ slug: component.slug }));
}

interface ComponentPageProps {
  params: { slug: string };
}

export default function ComponentPage({ params }: ComponentPageProps) {
  const component = COMPONENTS.find((entry) => entry.slug === params.slug);

  if (!component) {
    notFound();
  }

  return (
    <div className="prose">
      <header>
        <h1>{component.name}</h1>
        <p>{component.description}</p>
      </header>

      <section>
        <PreviewRenderer preview={component.preview} />
      </section>

      <section>
        <h2>Server-side usage</h2>
        <p>
          Render HTML on the server using <code>render*Markup</code>. The snippet below returns a string ready to inject
          into your template.
        </p>
        <div style={CODE_TITLE_STYLE}>SSR</div>
        <CodeBlock code={component.ssrExample} language="ts" />
      </section>

      <section>
        <h2>Hydration</h2>
        <p>
          Once the page is loaded, hydrate the server-rendered markup and register any callbacks. Each component exposes
          a <code>hydrate*</code> function as well as a <code>create*</code> helper for purely client-side usage.
        </p>
        <div style={CODE_TITLE_STYLE}>Client</div>
        <CodeBlock code={component.clientExample} language="ts" />
      </section>

      <section>
        <h2>Highlights</h2>
        <ul>
          {component.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      {component.api.length > 0 && (
        <section>
          <h2>API</h2>
          <p>Key options exposed by the {component.name} helpers.</p>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "22%" }}>Name</th>
                <th style={{ width: "28%" }}>Type</th>
                <th>Description</th>
                <th style={{ width: "14%" }}>Default</th>
              </tr>
            </thead>
            <tbody>
              {component.api.map((field) => (
                <tr key={field.name}>
                  <td>{field.name}</td>
                  <td style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: "0.85rem" }}>{field.type}</td>
                  <td>{field.description}</td>
                  <td>{field.defaultValue ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
