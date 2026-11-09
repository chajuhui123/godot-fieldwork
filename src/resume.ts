import { lessons, type Lesson } from "./data/courses";
import { complete, type Progress } from "./progress";

// 별도 키를 써서 기존 진도(godot-fieldwork-progress-v1) 형식을 바꾸지 않는다.
const lastLessonKey = "godot-fieldwork-last-lesson-v1";

export function rememberLesson(id: string) {
  try {
    localStorage.setItem(lastLessonKey, id);
  } catch {
    /* 저장소를 쓸 수 없으면 이어하기만 생략한다. */
  }
}

function lastLessonId() {
  try {
    return localStorage.getItem(lastLessonKey);
  } catch {
    return null;
  }
}

export interface ResumeTarget {
  lesson: Lesson;
  number: number;
  done: boolean;
  /** last: 마지막으로 연 수업, next: 기록이 없어 고른 첫 미완료 수업 */
  source: "last" | "next";
}

/** 마지막으로 연 수업, 기록이 없으면 진도가 있을 때 첫 미완료 수업. */
export function resumeTarget(progress: Progress): ResumeTarget | null {
  const id = lastLessonId();
  let index = id ? lessons.findIndex((l) => l.id === id) : -1;
  const source = index < 0 ? "next" : "last";
  if (index < 0) {
    if (!lessons.some((l) => progress[l.id])) return null;
    index = lessons.findIndex((l) => !complete(progress[l.id]));
    if (index < 0) return null;
  }
  const lesson = lessons[index];
  return {
    lesson,
    number: index + 1,
    done: complete(progress[lesson.id]),
    source,
  };
}
