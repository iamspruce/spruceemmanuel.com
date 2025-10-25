import { getCollection } from "astro:content";

import type { LessonData, ChapterData } from "./courseTypes";

export async function getCourseStructure(): Promise<ChapterData[]> {
  const lessons = await getCollection("d3-course");

  // Sort lessons by chapter order and lesson order
  const sortedLessons = lessons.sort((a, b) => {
    if (a.data.chapterOrder !== b.data.chapterOrder) {
      return a.data.chapterOrder - b.data.chapterOrder;
    }
    return a.data.order - b.data.order;
  });

  // Group by chapters
  const chaptersMap = new Map<string, ChapterData>();

  sortedLessons.forEach((lesson) => {
    const chapterSlug = lesson.data.chapter;

    if (!chaptersMap.has(chapterSlug)) {
      chaptersMap.set(chapterSlug, {
        slug: chapterSlug,
        title: lesson.data.chapterTitle,
        order: lesson.data.chapterOrder,
        lessons: [],
      });
    }

    const chapter = chaptersMap.get(chapterSlug)!;
    chapter.lessons.push({
      slug: lesson.slug,
      title: lesson.data.title,
      description: lesson.data.description,
      href: `/d3-course/${lesson.slug}`,
      order: lesson.data.order,
    });
  });

  return Array.from(chaptersMap.values()).sort((a, b) => a.order - b.order);
}

export async function getLessonNavigation(currentSlug: string) {
  const lessons = await getCollection("d3-course");
  const sortedLessons = lessons.sort((a, b) => {
    if (a.data.chapterOrder !== b.data.chapterOrder) {
      return a.data.chapterOrder - b.data.chapterOrder;
    }
    return a.data.order - b.data.order;
  });

  const currentIndex = sortedLessons.findIndex((l) => l.slug === currentSlug);

  let prev = null;
  let next = null;

  if (currentIndex > 0) {
    const prevLesson = sortedLessons[currentIndex - 1];
    prev = {
      href: `/d3-course/${prevLesson.slug}`,
      title: prevLesson.data.title,
    };
  }

  if (currentIndex < sortedLessons.length - 1) {
    const nextLesson = sortedLessons[currentIndex + 1];
    next = {
      href: `/d3-course/${nextLesson.slug}`,
      title: nextLesson.data.title,
    };
  }

  return { prev, next };
}

export async function getChapterLessons(chapterSlug: string) {
  const lessons = await getCollection("d3-course", (lesson) => {
    return lesson.data.chapter === chapterSlug;
  });

  return lessons.sort((a, b) => a.data.order - b.data.order);
}

export async function getNextChapter(currentChapterSlug: string) {
  const structure = await getCourseStructure();
  const currentIndex = structure.findIndex(
    (c) => c.slug === currentChapterSlug
  );

  if (currentIndex < structure.length - 1) {
    const nextChapter = structure[currentIndex + 1];
    return {
      href: nextChapter.lessons[0].href,
      title: nextChapter.title,
    };
  }

  return null;
}
