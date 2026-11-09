import { useRef } from "react";
import { courses, lessons, type Lesson } from "../data/courses";
import { complete, type Progress } from "../progress";
import { Icon } from "./Icons";

export function Header({
  home,
  progress,
  reset,
  openMenu,
  resumeHref,
}: {
  home: boolean;
  resumeHref?: string;
  progress: Progress;
  reset: () => void;
  openMenu: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const done = lessons.filter((l) => complete(progress[l.id])).length;
  return (
    <>
      <header className="app-header">
        <a className="brand" href="#home" aria-label="Godot Fieldwork 홈">
          <img
            className="brand-logo"
            src="assets/godot-logo.svg"
            alt="Godot"
            width="104"
            height="42"
          />
          <div>
            <strong>Godot Fieldwork</strong>
          </div>
        </a>
        {home ? (
          <nav className="home-nav" aria-label="홈 메뉴">
            <a className="home-nav-secondary" href="credits.html">
              출처 안내
            </a>
            <a className="home-nav-primary" href={resumeHref ?? "#editor"}>
              {resumeHref ? "이어하기 →" : "학습 시작 →"}
            </a>
          </nav>
        ) : (
          <>
            <button
              className="menu-launch"
              aria-haspopup="dialog"
              onClick={openMenu}
            >
              학습 목차
            </button>
            <div className="header-progress" aria-label="전체 진도">
              <span id="progress-label">
                기본 {done} / {lessons.length} 완료
              </span>
              <div
                className="progress-track"
                id="progress-track"
                role="progressbar"
                aria-label="완료한 레슨"
                aria-valuemin={0}
                aria-valuemax={lessons.length}
                aria-valuenow={done}
              >
                <i
                  id="progress-bar"
                  style={{ width: (done / lessons.length) * 100 + "%" }}
                />
              </div>
            </div>
            <button
              className="quiet-button"
              id="reset-progress"
              onClick={() => {
                if (dialog.current) {
                  dialog.current.returnValue = "";
                  dialog.current.showModal();
                }
              }}
            >
              <Icon name="reset" />
              진도 초기화
            </button>
          </>
        )}
      </header>
      <dialog
        id="reset-dialog"
        ref={dialog}
        onClose={() => {
          if (dialog.current?.returnValue === "confirm") reset();
        }}
      >
        <form method="dialog">
          <h2>학습 진도를 초기화할까요?</h2>
          <p>이 브라우저에 저장된 실습·퀴즈 완료 기록만 지워집니다.</p>
          <div className="dialog-actions">
            <button value="cancel" className="quiet-button">
              취소
            </button>
            <button value="confirm" className="danger-button">
              초기화
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}

export function Sidebar({
  lesson,
  progress,
}: {
  lesson: Lesson;
  progress: Progress;
}) {
  const current = courses.find((c) => c.lessons.includes(lesson))!;
  return (
    <aside className="curriculum" aria-label="학습 목차">
      <div className="curriculum-scroll">
        <div className="curriculum-intro">
          <b>학습 목차</b>
          <p>실습하고, 개념을 확인하세요.</p>
          <label className="course-jump" htmlFor="course-jump">
            과정 바로가기
          </label>
          <select
            id="course-jump"
            value={current.id}
            onChange={(e) => {
              location.hash = courses.find(
                (c) => c.id === e.target.value,
              )!.lessons[0].id;
            }}
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title} ({c.lessons.length}개 수업)
              </option>
            ))}
          </select>
        </div>
        <nav id="curriculum-nav">
          {courses.map((c) => (
            <section className="module" key={c.id}>
              <div className="module-title">
                <b>{c.title}</b>
                <i>
                  {c.lessons.filter((l) => complete(progress[l.id])).length}/
                  {c.lessons.length}
                </i>
              </div>
              {c.lessons.map((l, i) => (
                <button
                  type="button"
                  key={l.id}
                  className={"lesson-nav" + (l === lesson ? " active" : "")}
                  aria-current={l === lesson ? "page" : undefined}
                  data-lesson={l.id}
                  onClick={() => {
                    location.hash = l.id;
                  }}
                >
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <span>{l.title}</span>
                  {complete(progress[l.id]) && (
                    <span className="done">
                      <Icon name="check" />
                    </span>
                  )}
                </button>
              ))}
            </section>
          ))}
        </nav>
        <div className="source-note">
          <Icon name="book" />
          <p>
            Godot Engine 4.x 한국어 공식 문서의 구조와 용어를 바탕으로
            재구성했습니다.
          </p>
        </div>
      </div>
      <div className="site-credit" aria-label="저작권 및 제작자">
        <span>© 2026 Juhee Cha</span>
        <span>
          제작{" "}
          <a
            href="https://github.com/chajuhui123"
            target="_blank"
            rel="noopener noreferrer"
          >
            Juhee Cha의 GitHub<span className="credit-link-note"> (새 탭)</span>
          </a>
        </span>
        <a href="credits.html">문서 출처와 라이선스</a>
      </div>
    </aside>
  );
}
