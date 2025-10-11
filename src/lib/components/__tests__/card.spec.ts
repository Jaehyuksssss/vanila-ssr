import { describe, expect, it, beforeEach } from "vitest";

import { renderCards, RenderCardsOptions } from "../card";

const createContainer = (id = "card-root"): HTMLDivElement => {
  const container = document.createElement("div");
  container.id = id;
  document.body.appendChild(container);
  return container;
};

const sampleCards = [
  { title: "Alpha", description: "First card" },
  { title: "Bravo", description: "Second card" },
];

describe("renderCards", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders cards when provided (cards, container) signature", () => {
    const container = createContainer();
    const cards = renderCards(sampleCards, container);

    expect(cards).toHaveLength(2);
    expect(container.querySelectorAll("[data-vanila-component='card']")).toHaveLength(2);
  });

  it("supports (container, cards) signature", () => {
    const container = createContainer();
    const cards = renderCards(container, sampleCards);

    expect(cards).toHaveLength(2);
    expect(container.querySelectorAll("[data-vanila-component='card']")).toHaveLength(2);
  });

  it("keeps existing content when clearContainer is false", () => {
    const container = createContainer();
    container.innerHTML = `<div id="preamble"></div>`;

    const options: RenderCardsOptions = {
      container,
      cards: sampleCards,
      clearContainer: false,
    };

    renderCards(options);

    expect(container.querySelector("#preamble")).not.toBeNull();
    expect(container.querySelectorAll("[data-vanila-component='card']")).toHaveLength(2);
  });

  it("throws a helpful error when the container cannot be resolved", () => {
    expect(() => renderCards(sampleCards, "#missing")).toThrow(
      /renderCards could not find a mounting container/,
    );
  });

  it("throws a helpful error when cards is not an array", () => {
    const container = createContainer();

    expect(() =>
      renderCards({
        // @ts-expect-error - runtime validation
        cards: { title: "Single", description: "Invalid usage" },
        container,
      }),
    ).toThrow(/expected an array of card options/);
  });
});
