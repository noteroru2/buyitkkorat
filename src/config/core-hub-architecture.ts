import architectureData from './site-architecture.json';
import releaseData from './core-hub-release.json';

export type CoreHubRole = 'CATALOG' | 'CORE_HUB' | 'B2B_HUB' | 'JOURNEY_HUB' | 'LOCAL_HUB';

export interface CoreHubDefinition {
  url: string;
  role: CoreHubRole;
  label: string;
  sourceHint: string;
  children: string[];
  peerLinks: string[];
}

export const CORE_HUB_RELEASE = releaseData;
export const CORE_HUBS = releaseData.coreHubs as CoreHubDefinition[];
export const CORE_HUB_URLS = new Set(CORE_HUBS.map((hub) => hub.url));
export const APPLE_BRIDGE_URLS = new Set(releaseData.appleBridge.members);

const liveRoutes = architectureData.routes.filter((node) => node.kind === 'LIVE');
const byUrl = new Map(liveRoutes.map((node) => [node.url, node] as const));
const labelByUrl = releaseData.labels as Record<string, string>;

export function getCoreHub(url: string): CoreHubDefinition | undefined {
  return CORE_HUBS.find((hub) => hub.url === url);
}

export function getArchitectureLabel(url: string): string {
  return labelByUrl[url] ?? url.replace(/^\//, '').replaceAll('-', ' ');
}

export function getReleasedParentUrl(url: string): string | null {
  const node = byUrl.get(url);
  if (!node?.recommendedParent || node.recommendedParent.startsWith('virtual:')) return null;
  return byUrl.has(node.recommendedParent) ? node.recommendedParent : null;
}

export function getReleasedChildren(url: string): string[] {
  return liveRoutes
    .filter((node) => node.indexState === 'INDEX' && node.recommendedParent === url)
    .map((node) => node.url);
}

export function getReleasedSiblings(url: string, limit = 3): string[] {
  const parent = getReleasedParentUrl(url);
  if (!parent) return [];
  return getReleasedChildren(parent).filter((candidate) => candidate !== url).slice(0, limit);
}

/**
 * Batch 1 intentionally does not emit the planned Apple hub URL.
 * Until a real /รับซื้อ-apple-โคราช route exists, Apple pages use a controlled family bridge.
 */
export function getAppleBridgePeers(url: string, limit = 4): string[] {
  if (!APPLE_BRIDGE_URLS.has(url)) return [];
  return releaseData.appleBridge.members.filter((candidate) => candidate !== url).slice(0, limit);
}

export function getHomepageCoreHubLinks() {
  return releaseData.homepagePrimaryHubs.map((url) => ({ url, label: getArchitectureLabel(url) }));
}
