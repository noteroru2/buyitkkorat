import { getCollection } from "astro:content";

export async function getAllContentIndex() {
  const [services, areas, articles] = await Promise.all([
    getCollection("services"),
    getCollection("areas"),
    getCollection("articles"),
  ]);

  const map = new Map<string, { title: string; href: string; excerpt?: string }>();

  for (const item of services) {
    const href = `/${item.data.slug}`;
    map.set(href, {
      title: item.data.h1,
      href,
      excerpt: item.data.excerpt,
    });
  }
  for (const item of areas) {
    const href = `/พื้นที่/${item.data.slug}`;
    map.set(href, {
      title: item.data.h1,
      href,
      excerpt: item.data.excerpt,
    });
  }
  for (const item of articles) {
    const href = `/บทความ/${item.data.slug}`;
    map.set(href, {
      title: item.data.h1,
      href,
      excerpt: item.data.excerpt,
    });
  }

  return map;
}

/** Normalize relatedPaths so slash-less slugs still resolve. */
export function normalizeContentPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function resolveRelated(
  map: Map<string, { title: string; href: string; excerpt?: string }>,
  paths: string[],
) {
  return paths
    .map((path) => map.get(normalizeContentPath(path)))
    .filter((item): item is { title: string; href: string; excerpt?: string } => Boolean(item));
}

export type IllustrationType =
  | "phone"
  | "notebook"
  | "desktop"
  | "gpu"
  | "camera"
  | "console"
  | "speaker"
  | "parcel"
  | "line"
  | "staff"
  | "devices";

export function asIllustration(value?: string): IllustrationType {
  const allowed: IllustrationType[] = [
    "phone",
    "notebook",
    "desktop",
    "gpu",
    "camera",
    "console",
    "speaker",
    "parcel",
    "line",
    "staff",
    "devices",
  ];
  if (value && (allowed as string[]).includes(value)) {
    return value as IllustrationType;
  }
  return "devices";
}
