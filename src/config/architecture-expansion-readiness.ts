import readinessData from './architecture-expansion-readiness.json';

export type ArchitectureReadinessState =
  | 'BLOCKED'
  | 'CONDITIONALLY_READY'
  | 'READY_FOR_CONTROLLED_RELEASE';

export interface GateResult {
  id: string;
  passed: boolean;
  score: number;
  note?: string;
}

export function calculateArchitectureReadiness(
  gates: GateResult[],
): {
  state: ArchitectureReadinessState;
  score: number;
  blockers: string[];
} {
  const requiredIds = Object.keys(readinessData.requiredGates);
  const byId = new Map(gates.map((gate) => [gate.id, gate] as const));
  const blockers: string[] = [];
  let score = 0;

  for (const id of requiredIds) {
    const configured = readinessData.requiredGates[id as keyof typeof readinessData.requiredGates];
    const result = byId.get(id);
    if (!result?.passed && configured.required) blockers.push(id);
    score += result?.passed ? configured.weight : 0;
  }

  if (blockers.length) {
    return {
      state: score >= readinessData.thresholds.conditionalScoreMin
        ? 'CONDITIONALLY_READY'
        : 'BLOCKED',
      score,
      blockers,
    };
  }

  return {
    state: score >= readinessData.thresholds.readyScore
      ? 'READY_FOR_CONTROLLED_RELEASE'
      : 'CONDITIONALLY_READY',
    score,
    blockers,
  };
}

export function canAutoExpandArchitecture(): false {
  return false;
}

export function maxInitialExpansionRelease(): number {
  return readinessData.releasePolicy.initialReleaseCap;
}
