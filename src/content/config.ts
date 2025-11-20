import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    excerpt: z.string().optional(),
    date: z.date(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    author: z.string().default('Coders.ia.br'),
    image: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false).optional(),
  }),
});

export const collections = {
  'blog': blogCollection,
};