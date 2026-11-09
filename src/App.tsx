import { lazy, useRef, Suspense, useEffect, useState } from "react";
import { lessons } from "./data/courses";
import { useProgress } from "./progress";
import { Home } from "./components/Home";
import { Header, Sidebar } from "./components/Shell";
import { Icons } from "./components/Icons";
const LessonPage = lazy(() =>
  import("./components/LessonPage").then((module) => ({
    default: module.LessonPage,
  })),
);

export function App() {
  const [route, setRoute] = useState(() => location.hash.slice(1));
  const menu = useRef<HTMLDialogElement>(null);
  const [generation, setGeneration] = useState(0);
  const { progress, patch, reset } = useProgress();
  const lesson = lessons.find((l) => l.id === route);
  useEffect(() => {
    const change = () => setRoute(location.hash.slice(1));
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const target = lesson ? "lesson-workspace" : "home";
  useEffect(() => {
    menu.current?.close();
    if (lesson)
      document
        .querySelector('#curriculum-nav [aria-current="page"]')
        ?.scrollIntoView({ block: "nearest" });
    document.getElementById(target)?.focus({ preventScroll: true });
    if (route === "home-method")
      document.getElementById(route)?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: lesson ? "smooth" : "instant" });
  }, [route, lesson, target]);
  return (
    <>
      <a
        className="skip-link"
        href={"#" + target}
        onClick={(e) => {
          e.preventDefault();
          document.getElementById(target)?.focus();
        }}
      >
        본문으로 건너뛰기
      </a>
      <Icons />
      <Header
        home={!lesson}
        openMenu={() => menu.current?.showModal()}
        progress={progress}
        reset={() => {
          reset();
          setGeneration((n) => n + 1);
        }}
      />
      {lesson ? (
        <div className="studio-shell">
          <dialog
            ref={menu}
            className="course-drawer"
            onClick={(e) => {
              if (
                e.target === e.currentTarget ||
                (e.target instanceof Element && e.target.closest(".lesson-nav"))
              )
                menu.current?.close();
            }}
            aria-label="학습 목차"
          >
            <div className="drawer-title">
              <b>과정 선택</b>
              <button type="button" onClick={() => menu.current?.close()}>
                닫기
              </button>
            </div>
            <Sidebar lesson={lesson} progress={progress} />
          </dialog>
          <Suspense
            fallback={
              <main className="lesson-workspace" aria-busy="true">
                수업을 불러오는 중…
              </main>
            }
          >
            <LessonPage
              key={lesson.id + ":" + generation}
              lesson={lesson}
              state={progress[lesson.id] || {}}
              save={(fields) => patch(lesson.id, fields)}
            />
          </Suspense>
        </div>
      ) : (
        <Home />
      )}
    </>
  );
}
