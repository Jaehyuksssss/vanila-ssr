export type MountTarget = string | HTMLElement;
export type StyleHost = Document | ShadowRoot;

export interface CSPConfig {
  nonce?: string;
}

export interface VanillaSSRConfig {
  // Default mount target for overlays (modal, bottom sheet, toast, etc.)
  defaultTarget?: MountTarget | null;
  // Where to inject CSS when hydrateAllVanilaComponents runs
  styleTarget?: StyleHost;
  // Global debug toggle for hydration helpers
  debug?: boolean;
  // CSP-related settings
  csp?: CSPConfig;
}

const state: { config: VanillaSSRConfig } = {
  config: {},
};

export const configure = (config: VanillaSSRConfig): void => {
  state.config = { ...state.config, ...config };
};

export const getConfig = (): VanillaSSRConfig => state.config;

