// 수업 화면(편집기 + 미리보기 | 수업 본문)과 같은 배치의 자리표시자.
// 장식이므로 스크린리더에는 "수업을 불러오는 중"만 읽힌다.
const codeLines = [38, 0, 52, 46, 0, 64, 72, 58, 44, 80];

export function LessonSkeleton() {
  return (
    <main
      id="lesson-workspace"
      className="lesson-workspace lesson-skeleton"
      aria-busy="true"
      tabIndex={-1}
    >
      <p className="visually-hidden" role="status">
        수업을 불러오는 중…
      </p>
      <div className="skeleton-switch" aria-hidden="true">
        <i className="sk" style={{ width: 32 }} />
        <i className="sk" style={{ width: 32 }} />
      </div>
      <div className="skeleton-layout" aria-hidden="true">
        <div className="skeleton-code">
          <div className="skeleton-toolbar">
            <i className="sk sk-dark" style={{ width: 72 }} />
            <span>
              <i className="sk sk-dark sk-button" />
              <i className="sk sk-dark sk-button" />
            </span>
          </div>
          <div className="skeleton-editor">
            {codeLines.map((w, i) => (
              <div key={i} className="skeleton-line">
                <i className="sk sk-dark sk-gutter" />
                {w > 0 && (
                  <i className="sk sk-dark" style={{ width: w + "%" }} />
                )}
              </div>
            ))}
          </div>
          <div className="skeleton-preview">
            <i className="sk sk-dark" style={{ width: 96 }} />
            <div className="skeleton-canvas" />
          </div>
        </div>
        <div className="skeleton-reading">
          <i className="sk" style={{ width: 88, height: 12 }} />
          <i className="sk sk-title" style={{ width: "46%" }} />
          <i className="sk" style={{ width: "82%" }} />
          <i className="sk sk-heading" style={{ width: 120 }} />
          <i className="sk" style={{ width: "96%" }} />
          <i className="sk" style={{ width: "90%" }} />
          <i className="sk" style={{ width: "64%" }} />
          <i className="sk sk-heading" style={{ width: 160 }} />
          <i className="sk" style={{ width: "92%" }} />
          <i className="sk" style={{ width: "70%" }} />
        </div>
      </div>
    </main>
  );
}
