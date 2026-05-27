import { defineCollection, z } from "astro:content";

const insights = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().max(80),
    description: z.string().max(170),
    primaryKeyword: z.string(),
    secondaryKeywords: z.array(z.string()).optional(),
    category: z.enum(["performance", "security", "general"]),
    publishedDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    readingTime: z.number().int().positive(),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
  }),
});

export const collections = { insights };
