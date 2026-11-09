import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

const splits = {
  width: { key: "godot-fieldwork-editor-width", initial: 57.5, minimum: 320 },
  height: { key: "godot-fieldwork-editor-height", initial: 53.5, minimum: 144 },
};

function readSize(key: string, initial: number) {
  try {
    const value = Number(localStorage.getItem(key));
    if (Number.isFinite(value) && value >= 25 && value <= 75) return value;
  } catch {
    /* Storage is optional. */
  }
  return initial;
}

export function ResizableStudio({
  pane, children, axis = "width",
}: {
  pane?: string;
  children: ReactNode;
  axis?: keyof typeof splits;
}) {
  const { key, initial, minimum } = splits[axis];
  const stacked = axis === "height";
  const label = stacked ? "코드 창 높이" : "코드 창 너비";
  const layout = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(() => readSize(key, initial));
  const [available, setAvailable] = useState(1000);
  const [dragging, setDragging] = useState(false);
  const grab = useRef<{ pointer: number; offset: number } | null>(null);
  const latest = useRef(size);
  useLayoutEffect(() => {
    const el = layout.current!;
    const measure = () => setAvailable(Math.max(1, (stacked ? el.clientHeight : el.clientWidth) - 12));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [stacked]);
  const min = Math.min(50, Math.max(25, Math.ceil(minimum * 100 / available)));
  const max = 100 - min;
  const clamp = (value: number) => Math.min(max, Math.max(min, value));
  const current = clamp(size);
  function change(value: number) {
    latest.current = clamp(value);
    setSize(latest.current);
  }
  function remember() {
    try {
      localStorage.setItem(key, String(latest.current));
    } catch {
      /* In-memory width still applies. */
    }
  }
  return (
    <div
      className={stacked ? "studio-stack" : "studio-layout"}
      ref={layout}
      data-pane={pane}
      data-dragging={dragging}
      style={{ [stacked ? "--editor-height" : "--editor-fraction"]: current / 100 } as CSSProperties}
    >
      {children}
      <div
        className={stacked ? "height-divider" : "studio-divider"}
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation={stacked ? "horizontal" : "vertical"}
        aria-controls={stacked ? "workshop-editor workshop-preview" : "workshop"}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(current)}
        aria-valuetext={"코드 창 " + Math.round(current) + "%"}
        title={label + " 조절 (드래그 또는 방향키, 두 번 클릭하면 기본 비율)"}
        onPointerDown={(e) => {
          if (!e.isPrimary || e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.focus();
          e.currentTarget.setPointerCapture(e.pointerId);
          grab.current = {
            pointer: e.pointerId,
            offset: stacked ? e.clientY - e.currentTarget.getBoundingClientRect().top : e.clientX - e.currentTarget.getBoundingClientRect().left,
          };
          latest.current = current;
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const start = grab.current;
          if (!start || start.pointer !== e.pointerId) return;
          change(
            (100 *
              ((stacked ? e.clientY - layout.current!.getBoundingClientRect().top : e.clientX - layout.current!.getBoundingClientRect().left) -
                start.offset)) /
              available,
          );
        }}
        onLostPointerCapture={() => {
          if (grab.current) {
            remember();
            grab.current = null;
            setDragging(false);
          }
        }}
        onDoubleClick={() => {
          change(initial);
          remember();
        }}
        onKeyDown={(e) => {
          const next = (
            {
              [stacked ? "ArrowUp" : "ArrowLeft"]: current - 2,
              [stacked ? "ArrowDown" : "ArrowRight"]: current + 2,
              Home: min,
              End: max,
            } as Record<string, number>
          )[e.key];
          if (next === undefined) return;
          e.preventDefault();
          change(next);
          remember();
        }}
      />
    </div>
  );
}
