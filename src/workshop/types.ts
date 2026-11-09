export interface SceneConfig {
  x: number;
  y: number;
  beacon: boolean;
  beacon_x: number;
  attached: boolean;
  wait: number;
  speed: number;
  autostart: boolean;
  connected: boolean;
}
export interface Draft {
  code: string;
  config: SceneConfig;
  enginePassed?: boolean;
  lastFailedChecks?: string[];
}
export const draftKey = (id: string) => "godot-workshop-v1:" + id;
export function loadDraft(id: string, starter: string): Draft {
  let saved: Partial<Draft> = {};
  try {
    saved = JSON.parse(localStorage.getItem(draftKey(id)) || "{}") || {};
  } catch {
    /* First visit or invalid storage. */
  }
  return {
    ...saved,
    code: saved.code ?? starter,
    config: {
      x: 120,
      y: 180,
      beacon: false,
      beacon_x: 80,
      attached: id !== "attach-script",
      wait: 1,
      speed: 90,
      autostart: false,
      connected: false,
      ...saved.config,
    },
  };
}
