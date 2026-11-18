import { getCollection, type CollectionEntry } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import type { Lang } from '../i18n/utils';

export type Project = CollectionEntry<'projects'>;
export type Experience = CollectionEntry<'experience'>;

/** 'en/agency-console' → 'agency-console' */
export function slugOf(entry: { id: string }): string {
  return entry.id.split('/').slice(1).join('/');
}

export async function getProjects(lang: Lang): Promise<Project[]> {
  const all = await getCollection('projects', ({ id }) => id.startsWith(`${lang}/`));
  return all.sort((a, b) => a.data.order - b.data.order);
}

export async function getExperience(lang: Lang): Promise<Experience[]> {
  const all = await getCollection('experience', ({ id }) => id.startsWith(`${lang}/`));
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** True when a file exists under /public (used to hide CV links until the PDFs are added). */
export function publicFileExists(publicPath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', publicPath));
}
