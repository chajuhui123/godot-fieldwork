import courseData from "./courses.json";
export interface Lesson {
  id: string;
  title: string;
  docs: string;
  quiz: { q: string; options: string[]; answer: number; why: string };
  prerequisites?: string[][];
}
export interface Course {
  id: string;
  title: string;
  lessons: Lesson[];
}
export const courses: Course[] = courseData;
export const lessons = courses.flatMap((course) => course.lessons);
