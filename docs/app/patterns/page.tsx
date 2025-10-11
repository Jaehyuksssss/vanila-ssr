import Link from "next/link";

const recipes = [
  {
    title: "Filter + Table dashboard",
    description:
      "Combine FilterBar, DataTable, and MetricCard to deliver internal list/detail flows with progressive enhancement.",
    steps: [
      "Render FilterBar markup on the server with your preset values",
      "Hydrate FilterBar and DataTable; listen to onSubmit to call updateData",
      "Display MetricCard summaries using getValues results",
    ],
  },
  {
    title: "Custom delete confirmations",
    description:
      "Replace the accordion delete modal with your own bottom sheet or toast confirmation using onDeleteRequest.",
    steps: [
      "Pass onDeleteRequest to createAccordion",
      "Open your custom UI (bottom sheet, modal, etc.)",
      "Call ctx.remove() or ctx.cancel() based on user input",
    ],
  },
  {
    title: "Toast queue for async jobs",
    description:
      "Use createToast and showToast together to enqueue success/error notifications from background jobs.",
    steps: [
      "Render a container element if you want a custom position",
      "Call showToast in your fetch/XHR callbacks",
      "Use dismissible to let users close early",
    ],
  },
];

export default function PatternsPage() {
  return (
    <div className="prose">
      <header>
        <h1>Patterns</h1>
        <p>
          Reusable recipes that combine multiple components. Start with the ideas below, then tailor them to your own
          framework or template engine.
        </p>
      </header>

      <section className="card-grid">
        {recipes.map((recipe) => (
          <div className="card" key={recipe.title}>
            <h3>{recipe.title}</h3>
            <p>{recipe.description}</p>
            <ul className="list">
              {recipe.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p>
        Looking for more? Open an issue or explore the <Link href="https://github.com/">repository</Link> for upcoming
        ideas.
      </p>
    </div>
  );
}
