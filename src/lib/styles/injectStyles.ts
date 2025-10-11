import styles from "./vanila.css?inline";

type StyleHost = Document | ShadowRoot;

const injectedTargets = new WeakSet<StyleHost>();

const isDocumentNode = (target: StyleHost): target is Document => {
  return (target as Document).nodeType === 9;
};

export const getVanilaStyleText = (): string => styles;

export const injectVanilaStyles = (target?: StyleHost): void => {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTarget: StyleHost = target ?? document;

  if (injectedTargets.has(resolvedTarget)) {
    return;
  }

  const doc = isDocumentNode(resolvedTarget)
    ? resolvedTarget
    : resolvedTarget.ownerDocument ?? document;

  const container = isDocumentNode(resolvedTarget) ? resolvedTarget.head : resolvedTarget;
  const styleElement = doc.createElement("style");
  styleElement.setAttribute("data-vanila-components", "");
  styleElement.textContent = styles;

  container.appendChild(styleElement);
  injectedTargets.add(resolvedTarget);
};
