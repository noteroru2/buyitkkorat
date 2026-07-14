import { SITE } from "../data/site";

export function absoluteUrl(path: string): string {
  if (!path) return SITE.url;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.url}${normalized === "/" ? "" : normalized}`;
}

export function buildTitle(pageTitle: string, withBrand = true): string {
  const trimmed = pageTitle.trim();
  if (!withBrand) return trimmed;
  if (trimmed.includes(SITE.brand) || trimmed.includes("รับซื้อไอทีโคราช")) {
    return trimmed;
  }
  return `${trimmed} | ${SITE.brand}`;
}

export function truncateDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

export type BreadcrumbItem = {
  name: string;
  href: string;
};

export function countThaiWords(text: string): number {
  const segmenter = new Intl.Segmenter("th", { granularity: "word" });
  let count = 0;
  for (const { segment, isWordLike } of segmenter.segment(text)) {
    if (isWordLike && segment.trim()) count += 1;
  }
  return count;
}
