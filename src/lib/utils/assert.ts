export const createComponentError = (component: string, message: string): Error => {
  return new Error(`[vanila-components:${component}] ${message}`);
};

export const invariant = (condition: unknown, component: string, message: string): asserts condition => {
  if (!condition) {
    throw createComponentError(component, message);
  }
};
