// These types are shared by both server and client
export interface LessonData {
  slug: string;
  title: string;
  description: string;
  href: string;
  order: number;
}

export interface ChapterData {
  slug: string;
  title: string;
  order: number;
  lessons: LessonData[];
}
