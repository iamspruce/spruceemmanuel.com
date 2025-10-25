import { defineCollection, z } from "astro:content";

const writingCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    features: z.array(
      z.object({
        name: z.string(),
        link: z.string(),
      })
    ),
  }),
});

const projectsCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image(),
      link: z.string().optional(),
    }),
});

const d3CourseCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    chapter: z.string(),
    order: z.number(),
    chapterOrder: z.number(),
    chapterTitle: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    hasQuiz: z.boolean().optional().default(false),
  }),
});

export const collections = {
  writing: writingCollection,
  projects: projectsCollection,
  "d3-course": d3CourseCollection,
};
