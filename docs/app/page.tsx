import Link from "next/link";

const HERO_POINTS = [
  {
    title: "SSR Native",
    description: "Render markup on the server, hydrate on the client, and never worry about framework lock-in.",
  },
  {
    title: "Admin Dashboard Ready",
    description: "Ship filter bars, data tables, metric cards, and feedback patterns tuned for internal tooling.",
  },
  {
    title: "Type Safe & Tested",
    description: "Every component ships with TypeScript definitions and Vitest coverage so you can trust upgrades.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Ship UI faster without giving up your SSR pipeline.</h1>
        <p>
          Vanila Components is a zero-framework UI kit built for backend and infrastructure engineers. Compose accessible
          widgets, hydrate them where you need, and let your templates stay simple—whether you are using .NET Razor, PHP,
          Go templates, or Node.
        </p>
        <div className="hero__cta">
          <Link className="button button--primary" href="/getting-started">
            Start building
          </Link>
          <Link className="button button--secondary" href="/components">
            Browse components
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Why teams adopt Vanila Components</h2>
        <div className="card-grid">
          {HERO_POINTS.map((item) => (
            <div className="card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>What you get</h2>
        <div className="card-grid">
          <div className="card">
            <h3>Production ready admin widgets</h3>
            <p>
              Filter bars, data tables, metric cards, modals, toasts, accordions, and a growing list of internal tooling
              essentials.
            </p>
          </div>
          <div className="card">
            <h3>API-first docs</h3>
            <p>
              Every component is documented with SSR markup helpers, hydration APIs, runtime convenience methods, and
              scalable patterns.
            </p>
          </div>
          <div className="card">
            <h3>Drop-in styling</h3>
            <p>
              Load a single CSS file or inject styles programmatically—then extend with your own design tokens.
            </p>
          </div>
          <div className="card">
            <h3>Full testing story</h3>
            <p>
              Vitest + Testing Library cover the critical paths so you can integrate in CI and ship with confidence.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
