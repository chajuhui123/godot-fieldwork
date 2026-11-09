import { useState, useEffect } from "react";

export interface LessonState {
  engineWorkshop?: boolean;
  workshop?: boolean;
  practice?: boolean;
  quiz?: boolean;
  challenge?: boolean;
  capstoneSteps?: number[];
}
export type Progress = Record<string, LessonState>;
export const complete = (state?: LessonState) =>
  Boolean(state?.engineWorkshop && state.quiz);
const storageKey = "godot-fieldwork-progress-v1";
export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
    } catch {
      return {};
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      /* Continue with session progress if storage is full. */
    }
  }, [progress]);
  return {
    progress,
    patch: (id: string, fields: Partial<LessonState>) =>
      setProgress((current) => ({
        ...current,
        [id]: { ...current[id], ...fields },
      })),
    reset: () => setProgress({}),
  };
}
