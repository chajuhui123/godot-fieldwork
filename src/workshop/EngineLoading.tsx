import { useEffect, useState } from "react";
import type { RuntimeView } from "./session";

// engine.wasm + engine.pck (public/runtime/index.html의 fileSizes와 같은 값)
const TOTAL_MB = (36145869 + 2071284) / 1e6;

const steps = [
  { phase: "fetch", label: "엔진 내려받기" },
  { phase: "start", label: "게임 준비" },
  { phase: "run", label: "코드 실행" },
] as const;

export function EngineLoading({
  loading,
}: {
  loading: NonNullable<RuntimeView["loading"]>;
}) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, []);
  const current = steps.findIndex((s) => s.phase === loading.phase);
  const { percent } = loading;
  const label =
    loading.phase === "start"
      ? "내려받기를 마쳤어요. 게임을 준비하고 있어요."
      : percent === null
        ? "Godot 엔진을 불러오고 있어요."
        : `${((TOTAL_MB * percent) / 100).toFixed(1)} / ${TOTAL_MB.toFixed(0)} MB`;
  return (
    <div className="engine-loading">
      <ol className="engine-steps" aria-label="엔진 준비 단계">
        {steps.map((s, i) => (
          <li
            key={s.phase}
            className={
              i < current ? "is-done" : i === current ? "is-current" : undefined
            }
            aria-current={i === current ? "step" : undefined}
          >
            {s.label}
          </li>
        ))}
      </ol>
      <div
        className={
          "engine-bar" +
          (percent === null || loading.phase === "start"
            ? " is-indeterminate"
            : "")
        }
        role="progressbar"
        aria-label="Godot 엔진 불러오기"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={
          loading.phase === "fetch" && percent !== null ? percent : undefined
        }
        aria-valuetext={label}
      >
        <i
          style={
            loading.phase === "fetch" && percent !== null
              ? { width: percent + "%" }
              : undefined
          }
        />
      </div>
      <p className="engine-loading-label">
        <span>{label}</span>
        {loading.phase === "fetch" && percent !== null && <b>{percent}%</b>}
      </p>
      <p className="engine-loading-note">
        {slow
          ? "연결이 느리면 1분 정도 걸릴 수 있어요. 1분이 지나도 준비되지 않으면 다시 실행할 수 있어요."
          : "첫 실행에만 약 40MB를 받아요. 다음부터는 보통 더 빨리 시작해요."}
      </p>
    </div>
  );
}
