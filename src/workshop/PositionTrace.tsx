import { frogPixels } from "./frog";
import type { TestResult } from "./session";

// The editor grader reports Inspector X, runtime X, then runtime Y in scene pixels.
export function editorPositions(tests: TestResult[]) {
  const [from, to, y] = tests.map(test => Number.parseFloat(test.actual ?? ""));
  return [from, to, y].every(Number.isFinite) && tests.length === 3 ? {from, to, y} : null;
}

export function PositionTrace({from, to, y}: {from:number; to:number; y:number}) {
  return <svg className="position-trace" aria-hidden="true" viewBox="0 0 640 360">
    <path d={`M${from},${y}H${to}`} stroke="#b9d8aa" strokeWidth="2" strokeDasharray="4 6"/>
    <svg x={from-20} y={y-20} width="40" height="40" viewBox="0 0 16 16" opacity=".5">
      {frogPixels.flatMap((row, iy) => [...row].map((pixel, ix) => pixel === "." ? null :
        <rect key={16*iy+ix} x={ix} y={iy} width="1" height="1" fill={pixel === "#" ? "#576e68" : "#cce8bf"}/>))}
    </svg>
  </svg>;
}
