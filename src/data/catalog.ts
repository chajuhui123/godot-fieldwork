export { courses, lessons, type Lesson } from "./courses";
import depthData from "./depth.json";
import core from "./core-workshops.json";
import expanded from "./expanded-workshops.json";
import capstoneData from "./capstones.json";
import sourceData from "./sources.json";

export interface Workshop {
  title: string;
  goal: string;
  steps: string[][];
  starter: string;
  solution: string;
  expected: string;
  challenge: string;
  bug: string;
  detached?: boolean;
  expanded?: boolean;
  stage?: string;
  scope?: string;
  /** 브라우저에서 실행할 수 없는 주제를 다른 API로 대신 실습하는 과제 */
  substitute?: boolean;
  checker?: string;
  assessment?: string;
}
export const workshops: Record<string, Workshop> = { ...core, ...expanded };
export const depths: Record<string, (typeof depthData)["editor"]> = depthData;
export const capstones: Record<string, (typeof capstoneData)["multimesh"]> =
  capstoneData;
export const sources: Record<string, (typeof sourceData)["editor"]> =
  sourceData;
