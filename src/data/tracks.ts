import { lessons, type Lesson } from "./courses";
import { complete, type Progress } from "../progress";

export interface Track {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

// 기존 수업을 2D 게임 기본기 순서로 다시 엮은 추천 경로다.
// 진도는 기존 수업 완료 기록에서 계산하므로 저장 형식이 늘지 않는다.
const twoDIds = [
  "gdscript-data",
  "nodes",
  "attach-script",
  "delta-motion",
  "input-events",
  "signals",
  "instancing",
  "first-2d-loop",
  "collision-areas",
  "ui",
];

export const twoDTrack: Track = {
  id: "2d-first-steps",
  title: "2D 게임 첫걸음",
  summary:
    "문법부터 노드·이동·입력·시그널·스폰·충돌·UI까지, 2D 게임에 필요한 기본기를 10개 수업으로 이어서 익힙니다.",
  lessons: twoDIds.map((id) => {
    const lesson = lessons.find((l) => l.id === id);
    if (!lesson) throw new Error("추천 트랙에 없는 수업 ID: " + id);
    return lesson;
  }),
};

export function trackProgress(track: Track, progress: Progress) {
  const done = track.lessons.filter((l) => complete(progress[l.id])).length;
  const next = track.lessons.find((l) => !complete(progress[l.id])) ?? null;
  return { done, total: track.lessons.length, next };
}
