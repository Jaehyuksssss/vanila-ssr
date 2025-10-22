import styles from "./vanila.css?inline";
import { getConfig } from "../config";

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

  const globalTarget = getConfig().styleTarget;
  const resolvedTarget: StyleHost = target ?? globalTarget ?? document;

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

  const nonce = getConfig().csp?.nonce;
  if (nonce) {
    // Set CSP nonce if configured
    try {
      (styleElement as any).nonce = nonce;
    } catch {
      // no-op if browser blocks setting nonce programmatically
    }
  }

  container.appendChild(styleElement);
  injectedTargets.add(resolvedTarget);
};
