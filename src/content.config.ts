import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const baseFields = {
  title: z.string(),
  description: z.string(),
  h1: z.string(),
  slug: z.string(),
  category: z.string(),
  intent: z.enum([
    "service",
    "product",
    "condition",
    "area",
    "article",
    "trust",
    "hub",
  ]),
  excerpt: z.string(),
  publishedDate: z.coerce.date(),
  updatedDate: z.coerce.date(),
  featured: z.boolean().default(false),
  indexable: z.boolean().default(true),
  canonical: z.string().optional(),
  ogImage: z.string().default("/og/default.png"),
  relatedPages: z.array(z.string()).default([]),
  serviceArea: z.string().default("นครราชสีมา"),
  faq: z.array(faqSchema).default([]),
  author: z.string().default("WINNER IT"),
  reviewer: z.string().default("WINNER IT"),
};

const services = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/services" }),
  schema: z.object({
    ...baseFields,
    productFocus: z.string().optional(),
    illustration: z.string().optional(),
    pilotImage: z.enum(["evaluation-workspace", "bulk-sorting-workspace"]).optional(),
  }),
});

const areas = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/areas" }),
  schema: z.object({
    ...baseFields,
    areaName: z.string(),
    areaType: z.enum(["district", "city", "landmark"]),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object({
    ...baseFields,
    readingTime: z.string().optional(),
  }),
});

export const collections = { services, areas, articles };
