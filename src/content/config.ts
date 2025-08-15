import { defineCollection, z } from "astro:content";

const writingCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
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

export const collections = {
  writing: writingCollection,
  projects: projectsCollection,
};
