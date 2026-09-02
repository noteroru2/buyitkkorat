import architectureData from './site-architecture.json';
import releaseData from './core-hub-release.json';
import recoveryData from './internal-link-recovery.json';
import localAreaData from './local-area-release.json';
import { getGuideAuthorityRelatedUrls } from './guide-authority-architecture';

export interface RuntimeArchitectureLink {
  url: string;
  label: string;
  reason:
    | 'HOME'
    | 'PARENT'
    | 'CURRENT'
    | 'DISCOVERY'
    | 'CHILD'
    | 'SIBLING'
    | 'PEER'
    | 'APPLE_FAMILY'
    | 'LOCAL_RELATED'
    | 'GUIDE_RELATED'
    | 'CONVERSION';
}

const liveRoutes = architectureData.routes.filter((node) => node.kind === 'LIVE');
const byUrl = new Map(liveRoutes.map((node) => [node.url, node] as const));
const labels = releaseData.labels as Record<string, string>;
const coreHubs = new Map(releaseData.coreHubs.map((hub) => [hub.url, hub] as const));
const appleMembers = releaseData.appleBridge.members as string[];
const appleMemberSet = new Set(appleMembers);
const conversionBridges = recoveryData.conversionBridges as Record<string, string[]>;
const localRelatedAreas = new Map(
  localAreaData.areas.map((area) => [area.url, area.related] as const),
);

export function normalizeArchitecturePath(input: string): string {
  if (!input) return '/';
  let pathname = input;
  try {
    if (/^https?:\/\//i.test(input)) pathname = new URL(input).pathname;
  } catch {
    // Keep original and normalize below.
  }
  pathname = pathname.split('?')[0]?.split('#')[0] ?? pathname;
  try { pathname = decodeURI(pathname); } catch { /* keep */ }
  if (!pathname.startsWith('/')) pathname = `/${pathname}`;
  pathname = pathname.replace(/\/{2,}/g, '/');
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '');
  return pathname || '/';
}

export function getRuntimeLabel(url: string): string {
  if (labels[url]) return labels[url];
  if (url === '/บทความ') return 'บทความและคู่มือก่อนขาย';
  if (url === '/พื้นที่/เมืองนครราชสีมา') return 'รับซื้อไอที เมืองนครราชสีมา';
  const slug = url.split('/').filter(Boolean).at(-1) ?? url;
  return slug.replaceAll('-', ' ');
}

export function isKnownLiveArchitectureRoute(input: string): boolean {
  return byUrl.has(normalizeArchitecturePath(input));
}

function liveParentUrl(url: string): string | null {
  const node = byUrl.get(url);
  const parent = node?.recommendedParent;
  if (!parent || parent.startsWith('virtual:')) return null;
  return byUrl.has(parent) ? parent : null;
}

export function getRuntimeBreadcrumbs(input: string): RuntimeArchitectureLink[] {
  const current = normalizeArchitecturePath(input);
  if (current === '/' || !byUrl.has(current)) return [];

  const chain: string[] = [current];
  const seen = new Set<string>([current]);
  let cursor = current;
  while (true) {
    const parent = liveParentUrl(cursor);
    if (!parent || parent === '/') break;
    if (seen.has(parent)) break;
    seen.add(parent);
    chain.unshift(parent);
    cursor = parent;
  }

  const result: RuntimeArchitectureLink[] = [
    { url: '/', label: getRuntimeLabel('/'), reason: 'HOME' },
  ];
  for (const url of chain) {
    result.push({
      url,
      label: getRuntimeLabel(url),
      reason: url === current ? 'CURRENT' : 'PARENT',
    });
  }
  return result;
}

function liveChildren(url: string): string[] {
  return liveRoutes
    .filter((node) => node.indexState === 'INDEX' && node.recommendedParent === url)
    .map((node) => node.url as string);
}

/**
 * Batch 3 recovery rule: siblings rotate around the current page rather than
 * always selecting the first six. Root-level siblings are deliberately
 * disabled; explicit hub peers own cross-cluster linking from the homepage.
 */
function rotatedSiblingUrls(url: string): string[] {
  const parent = liveParentUrl(url);
  if (!parent || parent === '/') return [];
  const siblings = liveChildren(parent);
  const index = siblings.indexOf(url);
  if (index < 0 || siblings.length < 2) return [];
  const out: string[] = [];
  for (let offset = 1; offset < siblings.length; offset += 1) {
    out.push(siblings[(index + offset) % siblings.length]);
  }
  return out;
}

function pushUnique(
  out: RuntimeArchitectureLink[],
  seen: Set<string>,
  url: string,
  reason: RuntimeArchitectureLink['reason'],
  current: string,
) {
  if (url === current || seen.has(url) || !byUrl.has(url)) return;
  const node = byUrl.get(url);
  if (!node || node.indexState !== 'INDEX') return;
  seen.add(url);
  out.push({ url, label: getRuntimeLabel(url), reason });
}

/**
 * Discovery links solve hub-child orphaning. Hubs may show more than six links
 * because all direct children need a deterministic route from their owner.
 */
export function getRuntimeDiscoveryLinks(input: string, limit = 16): RuntimeArchitectureLink[] {
  const current = normalizeArchitecturePath(input);
  const node = byUrl.get(current);
  if (!node || node.indexState !== 'INDEX') return [];

  const raw = current === '/'
    ? recoveryData.homepageDiscovery as string[]
    : liveChildren(current);

  const out: RuntimeArchitectureLink[] = [];
  const seen = new Set<string>([current]);
  for (const url of raw) {
    pushUnique(out, seen, url, 'DISCOVERY', current);
    if (out.length >= limit) break;
  }
  return out;
}

export function getRuntimeDiscoveryHeading(input: string): string {
  const current = normalizeArchitecturePath(input);
  const node = byUrl.get(current);
  if (current === '/') return 'บริการรับซื้อหลักในโคราช';
  if (current === '/บทความ') return 'บทความและคู่มือทั้งหมด';
  if (current === '/พื้นที่') return 'พื้นที่ให้บริการในจังหวัดนครราชสีมา';
  if (node?.cluster === 'SELLER-JOURNEY') return 'ขั้นตอนการขายสินค้า';
  return 'บริการในหมวดนี้';
}

/**
 * Related links are bounded to six. Conversion bridges are preferred on
 * articles, then explicit Apple/core-hub peers, then circular siblings.
 * Direct children are excluded here because Discovery already owns them.
 */
export function getRuntimeRelatedLinks(input: string, limit = 6): RuntimeArchitectureLink[] {
  const current = normalizeArchitecturePath(input);
  const node = byUrl.get(current);
  if (!node || node.indexState !== 'INDEX' || current === '/') return [];
  if (node.cluster === 'TRUST') return [];

  const discoveryUrls = getRuntimeDiscoveryLinks(current).map((link) => link.url);
  const out: RuntimeArchitectureLink[] = [];
  const seen = new Set<string>([current, ...discoveryUrls]);

  for (const target of conversionBridges[current] ?? []) {
    pushUnique(out, seen, target, 'CONVERSION', current);
    if (out.length >= limit) return out;
  }

  const guideRelated = getGuideAuthorityRelatedUrls(current);
  for (const target of guideRelated) {
    pushUnique(out, seen, target, 'GUIDE_RELATED', current);
    if (out.length >= limit) return out;
  }

  const localRelated = localRelatedAreas.get(current) ?? [];
  for (const target of localRelated) {
    pushUnique(out, seen, target, 'LOCAL_RELATED', current);
    if (out.length >= limit) return out;
  }

  if (appleMemberSet.has(current)) {
    const start = appleMembers.indexOf(current);
    for (let offset = 1; offset < appleMembers.length; offset += 1) {
      pushUnique(out, seen, appleMembers[(start + offset) % appleMembers.length], 'APPLE_FAMILY', current);
      if (out.length >= limit) return out;
    }
  } else {
    const hub = coreHubs.get(current);
    if (hub) {
      for (const peer of hub.peerLinks as string[]) {
        pushUnique(out, seen, peer, 'PEER', current);
        if (out.length >= limit) return out;
      }
    }
  }

  for (const sibling of rotatedSiblingUrls(current)) {
    pushUnique(out, seen, sibling, 'SIBLING', current);
    if (out.length >= limit) return out;
  }

  return out;
}

export function getRuntimeRelatedHeading(input: string): string {
  const current = normalizeArchitecturePath(input);
  const node = byUrl.get(current);
  if (node?.cluster === 'CONTENT' && conversionBridges[current]?.length) {
    return 'อ่านต่อและบริการที่เกี่ยวข้อง';
  }
  if (node?.cluster === 'CONTENT') return 'บทความที่เกี่ยวข้อง';
  if (node?.cluster === 'SELLER-JOURNEY') return 'ขั้นตอนและบริการที่เกี่ยวข้อง';
  if (node?.cluster === 'LOCATION') return 'พื้นที่ให้บริการที่เกี่ยวข้อง';
  return 'บริการที่เกี่ยวข้อง';
}

export function getRuntimeParentLink(input: string): RuntimeArchitectureLink | null {
  const current = normalizeArchitecturePath(input);
  const parent = liveParentUrl(current);
  if (!parent) return null;
  return { url: parent, label: getRuntimeLabel(parent), reason: 'PARENT' };
}
