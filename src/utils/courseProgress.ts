import type { ChapterData } from "./courseTypes";

export interface LessonProgress {
  title: string;
  completed: boolean;
  skipped: boolean;
  quizResults?: {
    passed: number;
    failed: number;
    totalQuizzes: number;
  };
}

export interface ChapterProgress {
  title: string;
  lessons: Record<string, LessonProgress>;
  quizSummary?: {
    totalPassed: number;
    totalFailed: number;
    totalQuizzes: number;
    percentage: number;
  };
}

export interface CourseProgress {
  chapters: Record<string, ChapterProgress>;
  completed: number;
  skipped: number;
  total: number;
}

const STORAGE_KEY = "d3js-course-progress";

class CourseProgressManager {
  private progress: CourseProgress;

  constructor() {
    this.progress = this.loadProgress();
  }

  private loadProgress(): CourseProgress {
    if (typeof window === "undefined") {
      return this.getDefaultProgress();
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }

    return this.getDefaultProgress();
  }

  private getDefaultProgress(): CourseProgress {
    return {
      chapters: {},
      completed: 0,
      skipped: 0,
      total: 0,
    };
  }

  private saveProgress(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }

  public initializeChapter(
    chapterSlug: string,
    chapterTitle: string,
    lessons: Array<{ slug: string; title: string }>
  ): void {
    console.log(`[Progress Manager] Initializing chapter: ${chapterSlug}`);
    if (!this.progress.chapters[chapterSlug]) {
      this.progress.chapters[chapterSlug] = {
        title: chapterTitle,
        lessons: {},
      };

      lessons.forEach((lesson) => {
        console.log(`[Progress Manager]  -> Adding lesson: ${lesson.slug}`);
        this.progress.chapters[chapterSlug].lessons[lesson.slug] = {
          title: lesson.title,
          completed: false,
          skipped: false,
        };
      });

      this.updateTotals();
      this.saveProgress();
    } else {
      console.log(
        `[Progress Manager] Chapter ${chapterSlug} already initialized.`
      );
    }
  }

  public markLessonCompleted(chapterSlug: string, lessonSlug: string): void {
    console.log(
      `[Progress Manager] Attempting to mark COMPLETE: ${chapterSlug} / ${lessonSlug}`
    );
    const chapter = this.progress.chapters[chapterSlug];
    if (!chapter) {
      console.error(
        `[Progress Manager] FAILED: Chapter '${chapterSlug}' not found.`
      );
      return;
    }

    const lesson = chapter.lessons[lessonSlug];
    if (lesson && !lesson.completed) {
      console.log("[Progress Manager] SUCCESS: Lesson marked complete.");
      lesson.completed = true;
      lesson.skipped = false;
      this.updateTotals();
      this.saveProgress();
    } else if (lesson?.completed) {
      console.warn("[Progress Manager] SKIPPED: Lesson already complete.");
    } else {
      console.error(
        `[Progress Manager] FAILED: Lesson '${lessonSlug}' not found in chapter '${chapterSlug}'.`
      );
    }
  }

  public markLessonSkipped(chapterSlug: string, lessonSlug: string): void {
    console.log(
      `[Progress Manager] Attempting to mark SKIPPED: ${chapterSlug} / ${lessonSlug}`
    );
    const chapter = this.progress.chapters[chapterSlug];
    if (!chapter) {
      console.error(
        `[Progress Manager] FAILED: Chapter '${chapterSlug}' not found.`
      );
      return;
    }

    const lesson = chapter.lessons[lessonSlug];
    if (lesson && !lesson.completed) {
      console.log("[Progress Manager] SUCCESS: Lesson marked skipped.");
      lesson.skipped = true;
      this.updateTotals();
      this.saveProgress();
    } else if (lesson?.completed) {
      console.warn(
        "[Progress Manager] SKIPPED: Lesson already complete, cannot mark skipped."
      );
    } else {
      console.error(
        `[Progress Manager] FAILED: Lesson '${lessonSlug}' not found in chapter '${chapterSlug}'.`
      );
    }
  }

  public getLessonProgress(
    chapterSlug: string,
    lessonSlug: string
  ): LessonProgress | null {
    return this.progress.chapters[chapterSlug]?.lessons[lessonSlug] || null;
  }

  public saveQuizResult(
    chapterSlug: string,
    lessonSlug: string,
    quizId: string,
    passed: boolean
  ): void {
    const lesson = this.progress.chapters[chapterSlug]?.lessons[lessonSlug];
    if (!lesson) return;

    if (!lesson.quizResults) {
      lesson.quizResults = {
        passed: 0,
        failed: 0,
        totalQuizzes: 0,
      };
    }

    if (passed) {
      lesson.quizResults.passed++;
    } else {
      lesson.quizResults.failed++;
    }
    lesson.quizResults.totalQuizzes++;

    this.saveProgress();
  }

  public calculateChapterQuizSummary(chapterSlug: string): void {
    const chapter = this.progress.chapters[chapterSlug];
    if (!chapter) return;

    let totalPassed = 0;
    let totalFailed = 0;
    let totalQuizzes = 0;

    Object.values(chapter.lessons).forEach((lesson) => {
      if (lesson.quizResults) {
        totalPassed += lesson.quizResults.passed;
        totalFailed += lesson.quizResults.failed;
        totalQuizzes += lesson.quizResults.totalQuizzes;
      }
    });

    const percentage =
      totalQuizzes > 0 ? (totalPassed / totalQuizzes) * 100 : 0;

    chapter.quizSummary = {
      totalPassed,
      totalFailed,
      totalQuizzes,
      percentage,
    };

    this.saveProgress();
  }

  public getChapterQuizSummary(chapterSlug: string) {
    return this.progress.chapters[chapterSlug]?.quizSummary;
  }

  private updateTotals(): void {
    let completed = 0;
    let skipped = 0;
    let total = 0;

    Object.values(this.progress.chapters).forEach((chapter) => {
      Object.values(chapter.lessons).forEach((lesson) => {
        total++;
        if (lesson.completed) completed++;
        else if (lesson.skipped) skipped++;
      });
    });

    this.progress.completed = completed;
    this.progress.skipped = skipped;
    this.progress.total = total;
  }

  public getAllProgress(): CourseProgress {
    return this.progress;
  }

  public resetProgress(): void {
    this.progress = this.getDefaultProgress();
    this.saveProgress();
  }
}

export const courseProgressManager = new CourseProgressManager();

export function initializeCourseProgress(structure: ChapterData[]) {
  if (typeof window === "undefined") return;

  structure.forEach((chapter) => {
    courseProgressManager.initializeChapter(
      chapter.slug,
      chapter.title,
      chapter.lessons.map((l) => ({ slug: l.slug, title: l.title }))
    );
  });
}
