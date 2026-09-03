import triageData from './cannibalization-triage.json';

export type CannibalizationDecision =
  | 'KEEP'
  | 'DIFFERENTIATE'
  | 'HOLD_GSC'
  | 'MERGE_CANDIDATE'
  | 'REDIRECT_CANDIDATE';

export interface CannibalizationGroup {
  id: string;
  title: string;
  decision: CannibalizationDecision;
  owner: string;
  urls: string[];
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  gscRequired: boolean;
  contract: string;
  action: string;
}

export const cannibalizationGroups =
  triageData.groups as CannibalizationGroup[];

export function getCannibalizationGroupsForUrl(url: string): CannibalizationGroup[] {
  return cannibalizationGroups.filter((group) => group.urls.includes(url));
}

export function isConsolidationDecision(decision: CannibalizationDecision): boolean {
  return decision === 'MERGE_CANDIDATE' || decision === 'REDIRECT_CANDIDATE';
}

/**
 * Batch 4 safety contract:
 * this helper deliberately NEVER authorizes a destructive SEO change.
 * GSC evidence can only move a candidate into human review.
 */
export function canAutoExecuteCannibalizationChange(): false {
  return false;
}
