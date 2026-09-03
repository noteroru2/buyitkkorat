import foundationData from './brand-model-series-foundation.json';

export type ExpansionNodeType = 'BRAND' | 'SERIES' | 'MODEL';
export type ExpansionReleaseState =
  | 'HOLD_FOUNDATION'
  | 'CANDIDATE'
  | 'EVIDENCE_READY'
  | 'CONTENT_READY'
  | 'OWNERSHIP_REVIEW'
  | 'RELEASE_APPROVED'
  | 'LIVE'
  | 'OBSERVE_GSC';

export interface ExpansionCandidate {
  id: string;
  nodeType: 'BRAND' | 'SERIES';
  label: string;
  cluster: string;
  parent: string;
  candidateUrl: string;
  priorityBand: number;
  releaseState: ExpansionReleaseState;
  evidenceState: string;
  contentState: string;
}

export const brandCandidates =
  foundationData.candidateBrands as ExpansionCandidate[];

export const seriesCandidates =
  foundationData.candidateSeries as ExpansionCandidate[];

export const releasedExpansionNodes = foundationData.releasedNodes ?? [];

export const expansionCandidates = [
  ...brandCandidates,
  ...seriesCandidates,
];

export function getExpansionCandidate(id: string): ExpansionCandidate | undefined {
  return expansionCandidates.find((candidate) => candidate.id === id);
}

export function getExpansionChildren(parent: string): ExpansionCandidate[] {
  return expansionCandidates.filter((candidate) => candidate.parent === parent);
}

export function getExpansionCandidatesByCluster(cluster: string): ExpansionCandidate[] {
  return expansionCandidates.filter((candidate) => candidate.cluster === cluster);
}

/**
 * Batch 6 is foundation-only.
 * Candidate URLs MUST NOT be emitted by production navigation/runtime helpers.
 */
export function canPublishExpansionCandidateAutomatically(): false {
  return false;
}

export function isRuntimeLinkableExpansionCandidate(): false {
  return false;
}
