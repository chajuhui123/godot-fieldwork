import { Fragment, useEffect, useRef, useState } from "react";
import {
  capstones,
  courses,
  depths,
  lessons,
  sources,
  workshops,
  type Lesson,
} from "../data/catalog";
import { complete, type LessonState } from "../progress";
import { Icon } from "./Icons";
import { WorkshopPanel, workshopGoals } from "../workshop/WorkshopPanel";
import { optionOrder } from "../data/optionOrder";

interface Props {
  lesson: Lesson;
  state: LessonState;
  save: (patch: LessonState) => void;
}

function Heading({
  title,
  id,
  question,
  status,
  done,
}: {
  title: string;
  id: string;
  question: string;
  status: string;
  done?: boolean;
}) {
  return (
    <div className="section-heading">
      <div>
        {id === "quiz" && <span className="section-index">C</span>}
        <div>
          <h2 id={id + "-title"}>{title}</h2>
          <p id={id + "-question"}>{question}</p>
        </div>
      </div>
      <span id={id + "-state"} className={"state-text" + (done ? " done" : "")}>
        {status}
      </span>
    </div>
  );
}
function Quiz({ lesson, state, save }: Props) {
  const [wrong, setWrong] = useState<number>();
  const q = lesson.quiz;
  return (
    <section className="quiz-section" aria-labelledby="quiz-title">
      <Heading
        id="quiz"
        title="개념 확인"
        question={q.q}
        status={state.quiz ? "완료" : "미완료"}
        done={state.quiz}
      />
      <div className="quiz-options" id="quiz-options">
        {q.options.map((option, i) => (
          <button
            key={i}
            data-quiz={i}
            className={
              "quiz-option" +
              (state.quiz && i === q.answer
                ? " correct"
                : !state.quiz && i === wrong
                  ? " wrong"
                  : "")
            }
            disabled={state.quiz}
            onClick={() => {
              if (i === q.answer) save({ quiz: true });
              else setWrong(i);
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <div
        className={
          "feedback" +
          (state.quiz ? " success" : wrong !== undefined ? " error" : "")
        }
        role="status"
        id="quiz-feedback"
      >
        {state.quiz
          ? q.why
          : wrong !== undefined
            ? "다시 생각해 보세요. " + q.why
            : ""}
      </div>
    </section>
  );
}
function Challenge({ lesson, state, save }: Props) {
  const d = depths[lesson.id],
    q = d.challenge;
  const [selected, setSelected] = useState<number[]>(() =>
    state.challenge ? [0, 1] : [],
  );
  const [feedback, setFeedback] = useState({
    kind: "",
    text: state.challenge
      ? "이전에 완료한 문제입니다. 선택을 바꿔 다시 검토할 수 있습니다."
      : "",
  });
  const options = [...q.correct, ...q.incorrect];
  return (
    <section className="deep-section" aria-labelledby="challenge-title">
      <Heading
        id="challenge"
        title="다른 상황에 적용하기"
        question={q.question}
        status={state.challenge ? "완료 기록 있음" : "미완료"}
        done={state.challenge}
      />
      <p className="model-note">
        맞는 설명을 모두 선택하세요. 정답은 두 개입니다.
      </p>
      <form
        id="challenge-form"
        onSubmit={(e) => {
          e.preventDefault();
          const pass = selected.length === 2 && selected.every((i) => i < 2);
          setFeedback({
            kind: pass ? "success" : "error",
            text: pass
              ? "맞습니다. " + d.concept
              : !selected.length
                ? "맞다고 생각하는 설명을 먼저 선택하세요."
                : "선택을 다시 살펴보세요. " +
                  d.trap +
                  " 맞는 설명은 “" +
                  q.correct.join("”, “") +
                  "”입니다.",
          });
          if (pass) save({ challenge: true });
        }}
      >
        <div id="challenge-options">
          {optionOrder(lesson.id).map((i) => (
            <label key={i} className="challenge-option">
              <input
                type="checkbox"
                name="answer"
                value={i}
                checked={selected.includes(i)}
                onChange={(e) => {
                  setSelected(
                    e.target.checked
                      ? [...selected, i]
                      : selected.filter((v) => v !== i),
                  );
                  setFeedback({
                    kind: "",
                    text: "선택을 바꿨습니다. 다시 검토해 보세요.",
                  });
                }}
              />
              <span>{options[i]}</span>
            </label>
          ))}
        </div>
        <button className="primary-button" type="submit">
          선택 검토하기
        </button>
      </form>
      <div
        className={"feedback " + feedback.kind}
        id="challenge-feedback"
        role="status"
      >
        {feedback.text}
      </div>
    </section>
  );
}
export function LessonPage(props: Props) {
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
  }, []);
  const { lesson: l, state, save } = props,
    course = courses.find((c) => c.lessons.includes(l))!,
    d = depths[l.id],
    cap = capstones[l.id],
    done = complete(state);
  return (
    <main
      ref={main}
      id="lesson-workspace"
      className="lesson-workspace studio"
      tabIndex={-1}
    >
      <WorkshopPanel
        id={l.id}
        previouslyPassed={Boolean(state?.engineWorkshop)}
        onPass={() =>
          save({ practice: true, workshop: true, engineWorkshop: true })
        }
      >
        <div className="lesson-heading">
          <div>
            <p
              id="lesson-route"
              className="route-label"
              aria-label="현재 학습 위치"
            >
              {course.title} /{" "}
              {String(course.lessons.indexOf(l) + 1).padStart(2, "0")}
            </p>
            <h1 id="lesson-title">{l.title}</h1>
            <p id="lesson-summary" className="lesson-summary">
              {workshops[l.id].goal}
            </p>
          </div>
          <span
            id="lesson-status"
            className={"status-badge" + (done ? " done" : "")}
          >
            {done ? "기본 완료" : "기본 진행 중"}
          </span>
        </div>
        <section className="brief-concept" aria-labelledby="brief-title">
          <h2 id="brief-title">핵심 개념</h2>
          <p id="brief-concept">{d.concept}</p>
          <p className="concept-trap">
            <b>헷갈리기 쉬운 점</b> <span id="concept-trap">{d.trap}</span>
          </p>
          {!!l.prerequisites?.length && (
            <p id="prerequisite-links">
              먼저 익히면 좋은 개념:{" "}
              {l.prerequisites.map(([id, title], i) => (
                <Fragment key={id}>
                  {i > 0 && " · "}
                  <a href={"#" + id}>{title}</a>
                </Fragment>
              ))}
            </p>
          )}
        </section>
        <p className="workshop-note">
          Godot 문서 개념을 요약·재구성했습니다.{" "}
          <a href="credits.html">원저자와 CC BY 3.0</a> ·{" "}
          <a id="version-docs-link" href={sources[l.id].reference}>
            Godot 4.5 기술 참고 (영문)
          </a>
        </p>
        <section className="studio-task">
          <h2>직접 만들고 실행하기</h2>
          {workshopGoals[l.id] && <p>{workshopGoals[l.id]}</p>}
          {workshops[l.id].scope && (
            <p>
              <b>이 과제의 실행 범위</b> {workshops[l.id].scope}
            </p>
          )}
          <p className="live-challenge">
            <b>한 단계 더</b> {workshops[l.id].challenge}
          </p>
        </section>
        <Quiz {...props} />
        <Challenge {...props} />
        {cap && (
          <section
            id="capstone-section"
            className="deep-section"
            aria-labelledby="capstone-title"
          >
            <h2 id="capstone-title">{cap.title}</h2>
            <p id="capstone-description">{cap.description}</p>
            <p className="model-note">
              파트 종합 과제 · 실제 Godot에서 수행하고 항목별로 직접 확인하세요.
            </p>
            <div id="capstone-checks">
              {cap.checks.map((text, i) => (
                <label className="challenge-option" key={i}>
                  <input
                    type="checkbox"
                    checked={state.capstoneSteps?.includes(i) ?? false}
                    onChange={(e) => {
                      const prev = state.capstoneSteps || [];
                      save({
                        capstoneSteps: e.target.checked
                          ? [...prev, i]
                          : prev.filter((n) => n !== i),
                      });
                    }}
                  />
                  <span>{text}</span>
                </label>
              ))}
            </div>
          </section>
        )}
        <footer className="lesson-footer">
          <a
            id="docs-link"
            className="docs-link"
            href={l.docs}
            target="_blank"
            rel="noreferrer"
          >
            <Icon name="book" />
            공식 문서에서 더 보기
          </a>
          <button
            id="next-lesson"
            className="primary-button"
            disabled={!done}
            onClick={() => {
              location.hash =
                lessons[(lessons.indexOf(l) + 1) % lessons.length].id;
            }}
          >
            다음 실습
            <Icon name="arrow" />
          </button>
        </footer>
      </WorkshopPanel>
    </main>
  );
}
