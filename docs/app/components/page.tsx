import Link from "next/link";
import { COMPONENTS, COMPONENT_CATEGORIES } from "../../lib/component-data";

const grouped = COMPONENTS.reduce<Record<string, typeof COMPONENTS>>((acc, component) => {
  acc[component.category] = acc[component.category] ?? [];
  acc[component.category].push(component);
  return acc;
}, {});

export default function ComponentsPage() {
  const sections = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="section">
      <h1>Component catalogue</h1>
      <p style={{ maxWidth: 640, color: "var(--text-secondary)" }}>
        Every component ships with SSR helpers, hydration APIs, and runtime utilities. Pick one to see usage examples,
        code snippets, and live previews.
      </p>

      {sections.map(([category, items]) => (
        <section className="section" key={category} id={category}>
          <h2>{COMPONENT_CATEGORIES[category] ?? category}</h2>
          <div className="card-grid">
            {items.map((component) => (
              <Link key={component.slug} href={`/components/${component.slug}`} className="card">
                <h3>{component.name}</h3>
                <p>{component.description}</p>
                <ul className="list">
                  {component.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
