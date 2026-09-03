import guideData from './guide-authority-architecture.json';

export interface GuideAuthorityLink {
  url: string;
  title?: string;
}

const guideByUrl = new Map(
  guideData.guides.map((guide) => [guide.url, guide] as const),
);

const clusterById = new Map(
  guideData.clusters.map((cluster) => [cluster.id, cluster] as const),
);

export function getGuideAuthorityGuide(url: string) {
  return guideByUrl.get(url);
}

export function getGuideAuthorityCommercialTargets(url: string): string[] {
  return [...(guideByUrl.get(url)?.commercialTargets ?? [])].slice(
    0,
    guideData.meta.maxCommercialTargetsPerGuide,
  );
}

/**
 * Circular same-cluster discovery. This avoids one fixed "first N" set
 * and does not emit a virtual guide-cluster URL.
 */
export function getGuideAuthorityRelatedUrls(url: string): string[] {
  const guide = guideByUrl.get(url);
  if (!guide) return [];

  const members = clusterById.get(guide.cluster)?.members ?? [];
  const start = members.indexOf(url);
  if (start < 0 || members.length <= 1) return [];

  const out: string[] = [];
  for (let offset = 1; offset < members.length; offset += 1) {
    const candidate = members[(start + offset) % members.length];
    if (candidate !== url) out.push(candidate);
    if (out.length >= guideData.meta.maxRelatedGuidesPerGuide) break;
  }
  return out;
}

export function isGuideAuthorityUrl(url: string): boolean {
  return guideByUrl.has(url);
}

/** Batch 7 safety contract: candidates are planning records only. */
export function canPublishGuideCandidateAutomatically(): false {
  return false;
}

export function canEmitVirtualGuideClusterHref(): false {
  return false;
}
