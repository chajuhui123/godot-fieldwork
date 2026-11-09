import type { Workshop } from "../data/catalog";
import type { Draft } from "./types";

export interface TestResult {
  name: string;
  pass: boolean;
  expected?: string;
  actual?: string;
  hint?: string;
  newlySolved?: boolean;
}
export interface SceneNode { path: string; type: string }
export interface RuntimeView {
  tree: SceneNode[];
  status: string;
  verdict: string;
  console: string;
  scene: string;
  tests: TestResult[];
  active: boolean;
  stopped: boolean;
}
export const initialView: RuntimeView = {
  status: "실행하면 엔진을 불러옵니다",
  verdict: "코드를 작성한 뒤 ‘실행하고 채점’을 누르세요.",
  console: "print() 출력과 엔진 오류가 여기에 표시됩니다.",
  scene: "아직 실행하지 않았습니다.",
  tree: [],
  tests: [],
  active: false,
  stopped: false,
};
type Reply =
  | { type: "ready" }
  | {
      type: "loading" | "fatal" | "compile_error" | "log";
      message: string;
      error?: boolean;
      run?: number;
    }
  | {
      type: "snapshot";
      run: number;
      state: { tree?: SceneNode[]; nodes?: string[]; x: number; y: number; text?: string };
    }
  | { type: "result"; run: number; tests: TestResult[] };

async function runtimeBase() {
  if (import.meta.env.VITE_GODOT_RUNTIME_URL)
    return new URL(import.meta.env.VITE_GODOT_RUNTIME_URL, document.baseURI);
  const base = new URL("./runtime/", document.baseURI);
  // An existing plain static server on 4175 cannot serve an opaque-origin WASM fetch.
  // Keep supporting its companion CORS server; Vite dev/preview need no second process.
  if (
    ["localhost", "127.0.0.1"].includes(location.hostname) &&
    location.port === "4175"
  ) {
    try {
      const res = await fetch(new URL("index.html", base), { method: "HEAD" });
      if (res.headers.get("access-control-allow-origin") !== "*")
        return new URL("http://127.0.0.1:4176/");
    } catch {
      return new URL("http://127.0.0.1:4176/");
    }
  }
  return base;
}

// Owns only the sandboxed iframe. React owns the surrounding UI, status and progress.
export function createSession(
  host: HTMLElement,
  id: string,
  w: Workshop,
  read: () => Draft,
  update: (v: RuntimeView) => void,
  onGraded: (failedChecks: string[], passed: boolean) => void,
) {
  let view = { ...initialView },
    frame: HTMLIFrameElement | null = null,
    ready = false,
    token = "",
    run = 0,
    pending: Record<string, unknown> | null = null,
    hadError = false,
    runSignature = "";
  let loadTimer: number | undefined, checkTimer: number | undefined;
  const publish = (patch: Partial<RuntimeView>) => {
    view = { ...view, ...patch };
    update(view);
  };
  const signature = () => JSON.stringify([read().code, read().config]);
  const log = (message: string) =>
    publish({
      console: (
        (view.console === initialView.console ? "" : view.console) +
        "\n" +
        message
      ).slice(-12000),
    });
  function release() {
    clearTimeout(loadTimer);
    clearTimeout(checkTimer);
    frame?.remove();
    frame = null;
    ready = false;
    pending = null;
  }
  function stop(status = "정지됨") {
    release();
    publish({ status, active: false, stopped: true });
  }
  function send() {
    if (!frame?.contentWindow || !ready || !pending) return;
    frame.contentWindow.postMessage(
      { channel: "fieldwork", token, type: "run", payload: pending },
      "*",
    );
    publish({
      status: pending.check
        ? "실행 결과 검사 중…"
        : "실행 중 · 게임을 클릭해 조작",
    });
    if (pending.check)
      checkTimer = window.setTimeout(
        () =>
          publish({
            verdict:
              "검사 응답이 없습니다. Console을 확인하거나 정지 후 다시 실행하세요.",
          }),
        15000,
      );
    pending = null;
  }
  function launch(check: boolean) {
    if (w.expanded && frame) release();
    run++;
    hadError = false;
    clearTimeout(checkTimer);
    runSignature = signature();
    pending = {
      run,
      lesson: id,
      code: read().code,
      config: { ...read().config },
      check,
      stage: w.stage || "2d",
      checker: w.checker || "",
    };
    publish({
      console: "",
      tree: [],
      tests: [],
      active: true,
      stopped: false,
      verdict: check
        ? "약 2초 동안 실제 노드 상태를 검사합니다."
        : "게임 화면과 Console에서 실행 결과를 확인하세요.",
    });
    if (frame) {
      if (ready) send();
      else publish({ status: "엔진 로딩 중 · 최신 코드를 실행할 예정입니다" });
      return;
    }
    token = crypto.randomUUID();
    frame = document.createElement("iframe");
    frame.title = "Godot 게임 실행 화면";
    frame.setAttribute("sandbox", "allow-scripts allow-pointer-lock");
    frame.allow = "autoplay";
    const created = frame;
    publish({ status: "Godot 엔진을 불러오는 중…" });
    void runtimeBase()
      .then((base) => {
        if (frame !== created) return;
        const url = new URL("index.html", base);
        url.hash = encodeURIComponent(
          JSON.stringify({ token, parentOrigin: location.origin }),
        );
        created.src = url.href;
        host.append(created);
      })
      .catch((error) => {
        if (frame === created) {
          stop("실행 오류");
          log(String(error));
        }
      });
    loadTimer = window.setTimeout(() => {
      if (!ready) {
        stop("엔진 로딩 실패");
        publish({
          verdict:
            "Godot 실행 파일을 불러오지 못했습니다. 연결 상태와 런타임 서버를 확인해 주세요.",
        });
      }
    }, 60000);
  }
  function listener(e: MessageEvent) {
    if (
      !frame ||
      e.source !== frame.contentWindow ||
      e.data?.channel !== "fieldwork" ||
      e.data.token !== token
    )
      return;
    const d: Reply = e.data.payload;
    if (!d || typeof d.type !== "string") return;
    // The engine announces readiness with run 0 before receiving its first run.
    if (
      d.type !== "ready" &&
      d.type !== "fatal" &&
      d.type !== "loading" &&
      "run" in d &&
      d.run !== undefined &&
      d.run !== run
    )
      return;
    switch (d.type) {
      case "ready":
        ready = true;
        clearTimeout(loadTimer);
        send();
        break;
      case "loading":
        if (!ready) publish({ status: "Godot 로딩 " + d.message });
        break;
      case "fatal":
        stop("실행 오류");
        log(d.message);
        publish({ verdict: d.message });
        break;
      case "log":
        log(d.message);
        if (d.error) hadError = true;
        break;
      case "compile_error":
        hadError = true;
        clearTimeout(checkTimer);
        log(d.message);
        publish({ status: "실행 오류", verdict: d.message });
        break;
      case "snapshot": {
        const s = d.state;
        publish({
          tree: s.tree ?? [],
          scene:
            (s.nodes || []).join("\n") +
            "\n\nPlayer (" +
            Number(s.x).toFixed(1) +
            ", " +
            Number(s.y).toFixed(1) +
            ")\nStatus: " +
            (s.text || ""),
        });
        break;
      }
      case "result": {
        clearTimeout(checkTimer);
        if (signature() !== runSignature) {
          publish({
            verdict:
              "실행 후 코드가 바뀌었습니다. 현재 코드로 다시 채점하세요.",
          });
          break;
        }
        const tests = Array.isArray(d.tests) ? d.tests : [],
          pass = tests.length > 0 && tests.every((t) => t.pass) && !hadError;
        const previousFailures = new Set(read().lastFailedChecks);
        publish({
          tests: tests.map((test) => ({
            ...test,
            newlySolved: !hadError && test.pass && previousFailures.has(test.name),
          })),
          status: pass ? "검사 통과 · 실행 중" : "검사 완료 · 실행 중",
          verdict: pass
            ? "표시된 자동 검사 조건을 통과했습니다. 실행 화면도 확인한 뒤 개념 퀴즈로 이어가세요."
            : hadError
              ? "실행 중 오류가 있습니다. Console을 확인한 뒤 다시 채점하세요."
              : "아직 목표와 다릅니다. Inspector와 코드를 바꿔 다시 실행해 보세요.",
        });
        if (!hadError && tests.length)
          onGraded(tests.filter((test) => !test.pass).map((test) => test.name), pass);
        break;
      }
    }
  }
  window.addEventListener("message", listener);
  return {
    launch,
    stop,
    log,
    changed() {
      if (runSignature && signature() !== runSignature)
        publish({
          tests: [],
          verdict: "코드 또는 설정이 바뀌었습니다. 다시 채점하세요.",
        });
    },
    dispose() {
      release();
      window.removeEventListener("message", listener);
    },
  };
}
