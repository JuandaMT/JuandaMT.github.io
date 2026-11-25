import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Projects: one Markdown file per project and language,
 * at src/content/projects/{en,es}/<slug>.md. The body is the case study.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One line shown on the card. */
    tagline: z.string(),
    /** The problem the project solves. Omit it if unknown (and add a TODO). */
    problem: z.string().optional(),
    /** What I did, as short bullet points. */
    contribution: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    status: z
      .enum(['production', 'in-development', 'user-testing', 'published', 'prototype'])
      .optional(),
    links: z
      .object({
        repo: z.url().optional(),
        demo: z.url().optional(),
        live: z.url().optional(),
      })
      .default({}),
    /** Shown instead of links when the code is private, e.g. "Private code · demo on request". */
    linkNote: z.string().optional(),
    order: z.number(),
    /** Generates /projects/<slug>/ with the Markdown body as case study. */
    detailPage: z.boolean().default(false),
    /** Line drawing shown on the card and in /lab/ (see ProjectVisual.astro). */
    visual: z
      .enum([
        'access',
        'coaching',
        'store',
        'fitness',
        'notebook',
        'garage',
        'roulette',
        'building',
        'crm',
      ])
      .optional(),
    /** 'lab' projects render in the smaller "side lab" block. */
    tier: z.enum(['main', 'lab']).default('main'),
    /** Missing data for this project. Shown in dev, collected in TODO.md. */
    todos: z.array(z.string()).default([]),
  }),
});

/** Experience: src/content/experience/{en,es}/<company>.md */
const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    companyUrl: z.url().optional(),
    role: z.string(),
    /** Free text so it can be "2023" or "Mar 2023". */
    start: z.string(),
    /** Omit for current positions. */
    end: z.string().optional(),
    location: z.string().optional(),
    context: z.string(),
    highlights: z.array(z.string()),
    stack: z.array(z.string()).default([]),
    order: z.number(),
    todos: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, experience };
