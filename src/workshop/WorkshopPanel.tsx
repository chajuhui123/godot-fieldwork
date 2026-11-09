import { PositionTrace, editorPositions } from "./PositionTrace";
import { SceneDock, SceneLayout } from "./SceneDock";
import { ResizableStudio } from "./ResizableStudio";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { workshops } from "../data/catalog";
import { draftKey, loadDraft, type SceneConfig } from "./types";
import { createEditor } from "./editor";
import { createSession, initialView } from "./session";
import { downloadProject } from "./projects";
import { EngineLoading } from "./EngineLoading";

export const workshopGoals: Record<string, string> = {
  editor:
    "Inspector에서 Player를 (320, 180)에 놓은 뒤, _ready()에서 실행 위치를 (480, 180)으로 바꾸세요.",
  nodes:
    "Scene에서 Beacon을 추가하고, 로컬 좌표와 전역 좌표를 Status에 출력하세요.",
  signals:
    "Timer를 시작하고 timeout을 연결한 뒤, 1초마다 Score가 1씩 증가하도록 작성하세요.",
  "attach-script": "Main에 스크립트를 연결하고 문구와 사각형의 색을 바꾸세요.",
  "delta-motion": "초당 120px로 오른쪽 이동해 2초 뒤 X=360에서 멈추세요.",
  "input-events":
    "방향키를 누르는 동안 이동하는 코드를 작성하세요. 게임 화면을 클릭하면 키보드로 조작할 수 있습니다.",
};
export function WorkshopPanel({
  id,
  previouslyPassed,
  onPass,
  children,
}: {
  id: string;
  previouslyPassed: boolean;
  onPass: () => void;
  children: ReactNode;
}) {
  const [pane, setPane] = useState<"lesson" | "code">("lesson");
  const [sceneOpen, setSceneOpen] = useState(() => window.innerWidth > 780);
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(
    () => window.innerWidth > 1180,
  );
  const tools = ["검사 결과", "Console", "힌트", "프로젝트"] as const;
  const [tool, setTool] = useState<(typeof tools)[number] | null>(null);
  const [grading, setGrading] = useState(false);
  const [firstPass, setFirstPass] = useState(false);
  const passedBefore = useRef(previouslyPassed);
  useEffect(() => {
    if (!firstPass) return;
    const timer = window.setTimeout(() => setFirstPass(false), 1600);
    return () => window.clearTimeout(timer);
  }, [firstPass]);
  function run(check: boolean) {
    setFirstPass(false);
    setGrading(check);
    if (check) setTool("검사 결과");
    session.current?.launch(check);
  }
  const w = workshops[id];
  const [initial] = useState(() => loadDraft(id, w.starter));
  const draft = useRef(initial),
    pass = useRef(onPass);
  useEffect(() => {
    pass.current = onPass;
  }, [onPass]);
  const [config, setConfig] = useState(initial.config);
  const [saveText, setSaveText] = useState(
    "코드는 이 브라우저에 저장됩니다 · Esc 후 Tab으로 편집기에서 이동",
  );
  const [view, setView] = useState(initialView);
  const codeHost = useRef<HTMLDivElement>(null),
    gameHost = useRef<HTMLDivElement>(null),
    consoleBox = useRef<HTMLPreElement>(null);
  const session = useRef<ReturnType<typeof createSession> | null>(null);
  const persist = () => {
    try {
      localStorage.setItem(draftKey(id), JSON.stringify(draft.current));
      setSaveText("초안 저장됨 · Esc 후 Tab으로 편집기에서 이동");
    } catch {
      setSaveText(
        "저장 공간을 사용할 수 없습니다. 프로젝트 받기로 보관하세요.",
      );
    }
  };
  useEffect(() => {
    const runtime = createSession(
      gameHost.current!,
      id,
      w,
      () => draft.current,
      setView,
      (failedChecks, passed) => {
        const first = passed && !passedBefore.current && !draft.current.enginePassed;
        draft.current = {
          ...draft.current,
          lastFailedChecks: failedChecks,
          enginePassed: passed || draft.current.enginePassed,
        };
        persist();
        if (first) {
          const preview = gameHost.current?.parentElement;
          if (preview) preview.scrollTop = 0;
          setFirstPass(true);
        }
        if (passed) {
          passedBefore.current = true;
          pass.current();
        }
      },
    );
    session.current = runtime;
    const editor = createEditor(
      codeHost.current!,
      draft.current.code,
      (code) => {
        draft.current = { ...draft.current, code };
        persist();
        runtime.changed();
      },
    );
    return () => {
      runtime.dispose();
      editor.destroy();
      session.current = null;
    };
    // LessonPage is keyed by lesson id; progress updates must not remount the editor.
  }, [id, w]);
  useEffect(() => {
    const el = consoleBox.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [view.console]);
  // 실행 오류가 나면 원인을 바로 볼 수 있게 결과(채점 중) 또는 Console을 연다.
  useEffect(() => {
    if (view.status === "실행 오류") setTool(grading ? "검사 결과" : "Console");
  }, [view.status, grading]);
  const passed = view.tests.filter((t) => t.pass).length;
  const outcome: "pass" | "fail" | "error" | "checking" | null =
    view.status === "실행 오류"
      ? "error"
      : view.tests.length
        ? view.status === "검사 통과 · 실행 중"
          ? "pass"
          : "fail"
        : grading && view.active
          ? "checking"
          : null;
  const outcomeText = {
    pass: "모든 검사 통과",
    fail: `검사 ${view.tests.length}개 중 ${passed}개 통과`,
    error: "실행 오류",
    checking: "채점 중…",
  };
  const trace = firstPass && id === "editor" ? editorPositions(view.tests) : null;
  function configure(patch: Partial<SceneConfig>) {
    const next = { ...draft.current.config, ...patch };
    draft.current = { ...draft.current, config: next };
    setConfig(next);
    persist();
    session.current?.changed();
  }
  function numberInput(
    label: string,
    key: "x" | "y" | "speed" | "beacon_x" | "wait",
    min: number,
    max: number,
    step = 1,
  ) {
    return (
      <label>
        {label}
        <input
          id={"live-" + key.replace("_", "-")}
          type="number"
          defaultValue={config[key]}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n))
              configure({ [key]: Math.min(max, Math.max(min, n)) });
          }}
        />
      </label>
    );
  }
  function toggle(label: string, key: "attached" | "autostart" | "connected") {
    return (
      <label className="live-toggle">
        <input
          id={"live-" + key}
          type="checkbox"
          checked={config[key]}
          onChange={(e) => configure({ [key]: e.target.checked })}
        />
        {label}
      </label>
    );
  }
  return (
    <ResizableStudio pane={pane}>
      <section
        id="workshop"
        className="workshop code-pane"
        aria-label="GDScript 편집기"
      >
        <div className="live-toolbar">
          <div className="live-file">main.tscn</div>
          {outcome && (
            <button
              type="button"
              id="live-result"
              className="result-pill"
              data-state={outcome}
              aria-controls="tool-body"
              onClick={() => setTool("검사 결과")}
            >
              <span aria-hidden="true" className="result-icon" />
              {outcome === "fail" ? (
                <>
                  <b>{view.tests.length - passed}개 미통과</b>
                  <span className="result-count">
                    {passed} / {view.tests.length}
                  </span>
                </>
              ) : (
                <b>{outcomeText[outcome]}</b>
              )}
            </button>
          )}
          <button id="live-run" onClick={() => run(false)}>
            실행
          </button>
          <button id="live-check" onClick={() => run(true)}>
            실행하고 채점
          </button>
          <button
            id="live-stop"
            disabled={!view.active}
            onClick={() => { setFirstPass(false); session.current?.stop(); }}
          >
            정지
          </button>
        </div>
        <ResizableStudio axis="height">
        <div className="ide-workspace" id="workshop-editor">
          <div className="ide-tabs">
            <button aria-expanded={sceneOpen} aria-controls="scene-dock" onClick={() => setSceneOpen(!sceneOpen)}>씬</button>
            <button aria-pressed={!layoutOpen} onClick={() => setLayoutOpen(false)}>main.gd</button>
            <button aria-pressed={layoutOpen} onClick={() => setLayoutOpen(true)}>레이아웃</button>
            <button
              className="inspector-toggle"
              aria-expanded={inspectorOpen}
              aria-controls="inspector-dock"
              onClick={() => setInspectorOpen(!inspectorOpen)}
            >
              Inspector
            </button>
          </div>
          <div className="ide-panes">
            <div id="scene-dock" hidden={!sceneOpen}>
              <SceneDock config={config} id={id} spatial={w.stage === "3d"} tree={view.active ? view.tree : []}/>
            </div>
            <div className="editor-area" hidden={layoutOpen}>
              <div id="live-code" ref={codeHost} />
              <p className="live-save" id="live-save" role="status">{saveText}</p>
            </div>
            {layoutOpen && <SceneLayout config={config} spatial={w.stage === "3d"}/>}
            <aside id="inspector-dock" aria-label="Inspector" hidden={!inspectorOpen}>
              <div className="live-inspector">
              <h3>Scene · Inspector</h3>
              <p className="live-tip">
                {w.expanded
                  ? "준비된 씬에 노드를 추가하고 속성을 코드로 바꿔 보세요."
                  : "설정을 바꾼 뒤 다시 실행하세요. 아래 값으로 실제 Godot 노드를 만듭니다."}
              </p>
              {!w.expanded && (
                <div className="live-properties">
                  {numberInput("Player · Position X", "x", -10000, 10000)}
                  {numberInput("Position Y", "y", -10000, 10000)}
                </div>
              )}
              {id === "exported-properties" &&
                numberInput("Inspector · speed", "speed", 0, 1000)}
              {w.expanded && (
                <p className="live-tip">
                  {w.stage === "3d"
                    ? "기본 씬: Preview / World / Stage / Mesh · Camera · Light"
                    : "기본 씬: Main / Player / Shape · Status"}
                  <br />
                  노드 추가와 설정은 코드로 작성합니다.
                </p>
              )}
              {id === "nodes" && (
                <>
                  <button
                    id="live-beacon"
                    disabled={config.beacon}
                    onClick={() => configure({ beacon: true })}
                  >
                    Player 아래 Marker2D 추가
                  </button>
                  <p id="live-beacon-note">
                    {config.beacon
                      ? "Beacon이 추가되어 있습니다."
                      : "노드 이름은 Beacon으로 만들어집니다."}
                  </p>
                  {numberInput(
                    "Beacon · Position X",
                    "beacon_x",
                    -10000,
                    10000,
                  )}
                </>
              )}
              {id === "attach-script" &&
                toggle(" Main에 main.gd 연결", "attached")}
              {id === "signals" && (
                <>
                  {numberInput("Timer · Wait Time (초)", "wait", 0.1, 10, 0.1)}
                  {toggle(" Autostart", "autostart")}
                  {toggle(
                    " timeout → Main._on_timer_timeout 연결",
                    "connected",
                  )}
                </>
              )}
              <details>
                <summary>실행 중 노드와 값</summary>
                <pre id="live-scene">{view.scene}</pre>
              </details>
            </div>
            </aside>
          </div>
        </div>
        <section id="workshop-preview" className="preview-pane" data-first-pass={firstPass || undefined} aria-label="게임 미리보기">
          <div className="live-game-label">
            <strong>게임 미리보기</strong>
            <span id="live-status" role="status">
              {firstPass ? "첫 실습 통과" : view.status}
            </span>
          </div>
          <div id="live-game" ref={gameHost}>
            {trace && <PositionTrace {...trace}/> }
            {view.loading && <EngineLoading loading={view.loading} />}
            {!view.active && (
              <div className="preview-start">
                <button type="button" onClick={() => run(false)}>
                  {view.stopped ? "다시 실행" : "미리보기 실행"}
                </button>
                <p>
                  현재 코드로 게임을 실행합니다. 첫 실행 시 약 40MB를
                  불러옵니다.
                </p>
              </div>
            )}
          </div>
          {trace && <p className="trace-caption" role="status">시작 위치는 {trace.from}, 내 코드가 옮긴 위치는 {trace.to}.</p>}
        </section>
        </ResizableStudio>
        <div className="tool-strip" aria-label="편집 도구">
          {tools.map((label) => (
            <button
              key={label}
              aria-pressed={tool === label}
              aria-controls="tool-body"
              onClick={() => setTool(tool === label ? null : label)}
            >
              {label}
              {label === "검사 결과" && view.tests.length > 0 && (
                <span className="tab-badge" data-state={outcome ?? undefined}>
                  {passed}/{view.tests.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="tool-body" id="tool-body" hidden={!tool}>
          <div hidden={tool !== "검사 결과"} className="tool-results">
            <div className="live-output" data-state={outcome ?? undefined}>
              <div>
                <h3 className="visually-hidden">검사 결과</h3>
                <div className="verdict-banner">
                  <span aria-hidden="true" className="result-icon" />
                  <div>
                    {outcome && outcome !== "checking" && (
                      <strong>{outcomeText[outcome]}</strong>
                    )}
                    <p id="live-verdict" role="status">
                      {view.verdict}
                    </p>
                  </div>
                </div>
                {view.tests.length > 0 && (
                  <div className="check-summary" id="live-summary">
                    <p>
                      검사 {view.tests.length}개 중{" "}
                      <b>{view.tests.filter((t) => t.pass).length}개 통과</b>
                    </p>
                    <ol className="check-meter" aria-hidden="true">
                      {view.tests.map((t, i) => (
                        <li key={i} className={t.pass ? "passed" : "failed"} />
                      ))}
                    </ol>
                  </div>
                )}
                <ul id="live-tests">
                  {/* 고쳐야 할 항목을 먼저 보여 준다. 같은 상태 안에서는 원래 순서를 지킨다. */}
                  {[...view.tests]
                    .sort((a, b) => Number(a.pass) - Number(b.pass))
                    .map((t, i) => (
                      <li key={i} className={t.pass ? "passed" : "failed"}>
                        <span className="check-state">
                          {t.newlySolved ? "이번에 해결" : t.pass ? "통과" : "미통과"}
                        </span>
                        <div className="check-detail">
                          <strong>{t.name}</strong>
                          {t.actual !== undefined && (
                            <dl>
                              <dt>목표</dt>
                              <dd>{t.expected}</dd>
                              <dt>이번 실행</dt>
                              <dd className="check-actual">
                                {t.actual || "(빈 문자열)"}
                              </dd>
                            </dl>
                          )}
                          {!t.pass && t.hint && (
                            <p className="check-hint">
                              <b>힌트</b> {t.hint}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
                <p className="workshop-note">
                  {w.assessment ||
                    "자동 검사는 표시된 조건만 확인합니다. 입력 방향·정지 동작과 응용 결과도 직접 비교하세요."}
                </p>
              </div>
            </div>
          </div>
          <div hidden={tool !== "Console"}>
            {" "}
            <div>
              <h3>Console</h3>
              <pre
                id="live-console"
                ref={consoleBox}
                aria-label="Godot 실행 로그"
              >
                {view.console}
              </pre>
            </div>
          </div>
          <div hidden={tool !== "힌트"} className="tool-copy">
            {" "}
            <p>{w.bug}</p>
            <p>{w.expected}</p>
            <pre>
              <code>{w.solution}</code>
            </pre>
            <p>
              위 코드를 복사해서 비교할 수 있습니다. Scene·Inspector 설정은 직접
              맞춰 주세요.
            </p>
          </div>
          <div hidden={tool !== "프로젝트"} className="tool-copy">
            {" "}
            <p>
              서비스의 Scene·Inspector는 이 수업에 필요한 조작만 제공합니다.
              전체 Godot 에디터를 그대로 옮긴 것은 아닙니다.
            </p>
            <ol>
              {w.steps.map(([a, b], i) => (
                <li key={i}>
                  <b>{a}</b>
                  <p>{b}</p>
                </li>
              ))}
            </ol>
            <p>
              실제 엔진을 브라우저에서 실행하므로 코드는 이 컴퓨터에서
              처리됩니다. 웹 실행은 Compatibility 렌더러를 사용합니다.
            </p>
            <button
              id="live-download"
              onClick={() =>
                void downloadProject(
                  id,
                  draft.current.code,
                  draft.current.config,
                  (s) => session.current?.log(s),
                )
              }
            >
              현재 코드·씬 프로젝트 받기
            </button>
            <p className="workshop-note">
              실행 환경: Godot WebAssembly ·{" "}
              <a href="runtime/GODOT-LICENSE.txt">Godot 라이선스</a> ·{" "}
              <a href="runtime/GODOT-COPYRIGHT.txt">엔진 구성 요소</a> ·{" "}
              <a href="EDITOR-LICENSES.txt">편집기 라이선스</a>
            </p>
          </div>
        </div>
      </section>
      <nav className="pane-switch" aria-label="작업 화면">
        <button
          className="mobile-code"
          aria-pressed={pane === "code"}
          onClick={() => setPane("code")}
        >
          코드
        </button>
        <button
          aria-pressed={pane === "lesson"}
          onClick={() => setPane("lesson")}
        >
          수업
        </button>
      </nav>
      <article className="reading-pane" aria-label="수업 내용">
        {children}
      </article>
    </ResizableStudio>
  );
}
