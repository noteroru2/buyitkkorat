import architectureData from './site-architecture.json';

export type ArchitectureNodeKind = 'LIVE' | 'VIRTUAL';
export type ArchitectureIndexState = 'INDEX' | 'NOINDEX' | 'PLANNED';
export type ArchitectureTier = 'A' | 'B' | 'C' | 'UTILITY';
export type OwnershipStatus = 'LOCKED' | 'PROVISIONAL' | 'GSC_REQUIRED' | 'PLANNED';

export interface SiteArchitectureNode {
  id: string;
  url: string | null;
  futureUrl?: string;
  kind: ArchitectureNodeKind;
  pageType: string;
  cluster: string;
  tier: ArchitectureTier;
  indexState: ArchitectureIndexState;
  canonicalOwner: string | null;
  currentParent: string | null;
  recommendedParent: string | null;
  ownershipStatus: OwnershipStatus;
  sourceHint?: string;
  notes: string[];
}

export const SITE_ARCHITECTURE = architectureData;

export const ARCHITECTURE_NODES: SiteArchitectureNode[] = [
  ...(architectureData.virtualNodes as SiteArchitectureNode[]),
  ...(architectureData.routes as SiteArchitectureNode[]),
];

const NODE_BY_ID = new Map(ARCHITECTURE_NODES.map((node) => [node.id, node] as const));
const NODE_BY_URL = new Map(
  ARCHITECTURE_NODES.filter((node) => node.url).map((node) => [node.url as string, node] as const),
);

export function getArchitectureNode(idOrUrl: string): SiteArchitectureNode | undefined {
  return NODE_BY_ID.get(idOrUrl) ?? NODE_BY_URL.get(idOrUrl);
}

export function getArchitectureChildren(parentIdOrUrl: string): SiteArchitectureNode[] {
  return ARCHITECTURE_NODES.filter((node) => node.recommendedParent === parentIdOrUrl);
}

export function getIndexableArchitectureRoutes(): SiteArchitectureNode[] {
  return architectureData.routes.filter((node) => node.indexState === 'INDEX') as SiteArchitectureNode[];
}

/**
 * Safe for UI/internal-link consumers: returns null when the recommended parent is virtual.
 * This prevents Batch 0 from accidentally creating links to a route that does not exist yet.
 */
export function getLiveRecommendedParentUrl(idOrUrl: string): string | null {
  const node = getArchitectureNode(idOrUrl);
  if (!node?.recommendedParent) return null;
  const parent = getArchitectureNode(node.recommendedParent);
  return parent?.kind === 'LIVE' && parent.url ? parent.url : null;
}

export function getArchitectureMigrations(): SiteArchitectureNode[] {
  return (architectureData.routes as SiteArchitectureNode[]).filter(
    (node) => node.currentParent !== node.recommendedParent,
  );
}
