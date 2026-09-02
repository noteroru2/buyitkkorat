import controlData from './seo-index-control.json';
import architectureData from './site-architecture.json';
import {
  getRuntimeBreadcrumbs,
  getRuntimeDiscoveryLinks,
  getRuntimeLabel,
  normalizeArchitecturePath,
} from './runtime-architecture';

const routeProfiles = new Map(
  controlData.routeProfiles.map((profile) => [profile.url, profile] as const),
);

const liveRoutes = new Map(
  architectureData.routes
    .filter((node) => node.kind === 'LIVE')
    .map((node) => [node.url, node] as const),
);

export function getSeoIndexProfile(input: string) {
  return routeProfiles.get(normalizeArchitecturePath(input));
}

export function getArchitectureCanonicalPath(input: string): string | null {
  const profile = getSeoIndexProfile(input);
  return profile?.canonicalPath ?? null;
}

export function getArchitectureRobots(input: string): string {
  const profile = getSeoIndexProfile(input);
  return profile?.robots ?? 'noindex,follow';
}

export function isArchitectureSitemapEligible(input: string): boolean {
  return getSeoIndexProfile(input)?.sitemapEligible === true;
}

export function toArchitectureAbsoluteUrl(pathname: string, origin?: string): string {
  const base = origin || controlData.canonical.absoluteOrigin;
  return new URL(normalizeArchitecturePath(pathname), base).href;
}

export function getArchitectureSitemapPaths(): string[] {
  return architectureData.routes
    .filter((node) => node.kind === 'LIVE' && node.indexState === 'INDEX')
    .filter((node) => routeProfiles.get(node.url)?.sitemapEligible === true)
    .map((node) => node.canonicalOwner as string);
}

export interface ArchitectureSchemaInput {
  pathname: string;
  title?: string;
  description?: string;
  origin?: string;
}

export function buildArchitectureSchema(input: ArchitectureSchemaInput): Record<string, unknown>[] {
  const pathname = normalizeArchitecturePath(input.pathname);
  const profile = routeProfiles.get(pathname);
  if (!profile || profile.indexState !== 'INDEX') return [];

  const canonicalPath = profile.canonicalPath;
  if (!canonicalPath) return [];

  const origin = input.origin || controlData.canonical.absoluteOrigin;
  const canonical = toArchitectureAbsoluteUrl(canonicalPath, origin);
  const websiteId = `${new URL('/', origin).href}#website`;
  const webpageId = `${canonical}#webpage`;
  const title = input.title?.trim() || getRuntimeLabel(pathname);
  const description = input.description?.trim();

  const graph: Record<string, unknown>[] = [];

  if (profile.webSiteSchema) {
    graph.push({
      '@type': 'WebSite',
      '@id': websiteId,
      url: new URL('/', origin).href,
      name: controlData.meta.site,
      inLanguage: 'th-TH',
    });
  }

  if (profile.webPageSchema) {
    const page: Record<string, unknown> = {
      '@type': 'WebPage',
      '@id': webpageId,
      url: canonical,
      name: title,
      isPartOf: {'@id': websiteId},
      inLanguage: 'th-TH',
    };
    if (description) page.description = description;
    graph.push(page);
  }

  if (profile.breadcrumbSchema) {
    const breadcrumbs = getRuntimeBreadcrumbs(pathname);
    if (breadcrumbs.length >= 2) {
      graph.push({
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#breadcrumb`,
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          item: toArchitectureAbsoluteUrl(item.url, origin),
        })),
      });
    }
  }

  if (profile.itemListSchema) {
    const children = getRuntimeDiscoveryLinks(pathname, 16);
    if (children.length >= 2) {
      graph.push({
        '@type': 'ItemList',
        '@id': `${canonical}#architecture-children`,
        name: `${title} — หน้าที่เกี่ยวข้อง`,
        itemListElement: children.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          url: toArchitectureAbsoluteUrl(item.url, origin),
        })),
      });
    }
  }

  return graph;
}

export function serializeArchitectureJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

/** No candidate/virtual route can be indexed or surfaced automatically. */
export function canAutoIndexUnreleasedArchitectureCandidate(): false {
  return false;
}

/** Business/entity facts are source-reviewed; Batch 9 never manufactures them. */
export function canInventBusinessSchemaFacts(): false {
  return false;
}
