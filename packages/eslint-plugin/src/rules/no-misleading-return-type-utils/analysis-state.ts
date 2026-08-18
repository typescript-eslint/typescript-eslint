import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type {
  Observation,
  ResolvedObservation,
  RuleDependencies,
} from './shared';

import {
  isRuntimeFunctionLike,
  MAX_ANALYSIS_SYNTAX_DEPTH,
  MAX_ANALYSIS_WORK,
  isDeferredType,
  isUncertain,
} from './shared';

export interface AnalysisState {
  analyzableUndefinedType: ts.Type | undefined;
  analysisBudgetExceeded: Error;
  assignabilityComparisonFailed: Error;
  checker: RuleDependencies['checker'];
  consumeAnalysisWork: () => void;
  exceedsAnalysisSyntaxDepth: (root: ts.Node) => boolean;
  expandObservations: (observations: readonly Observation[]) => Observation[];
  expandResolvedObservations: (
    observations: readonly Observation[],
  ) => ResolvedObservation[];
  getAnalysisObjectId: (value: object) => number;
  getAnalysisStateKey: (
    anchor: ts.Node,
    observations: readonly Observation[],
  ) => string;
  isDeferredType: (type: ts.Type) => boolean;
  isExemptVoidLike: (type: ts.Type) => boolean;
  isNeverLike: (type: ts.Type) => boolean;
  isStackOverflowError: (error: unknown) => boolean;
  isTypeAssignableTo: (source: ts.Type, target: ts.Type) => boolean;
  isUncertain: (type: ts.Type) => boolean;
  program: RuleDependencies['program'];
  resetAnalysisWork: () => void;
  resolveObservation: (observation: Observation) => ResolvedObservation;
  services: RuleDependencies['services'];
}

export function createAnalysisState(
  dependencies: RuleDependencies,
): AnalysisState {
  const { checker, program } = dependencies;
  const compilerOptions = program.getCompilerOptions();
  const canAnalyzeVoidLikeConstituents =
    tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'strictNullChecks',
    ) &&
    tsutils.isCompilerOptionEnabled(
      compilerOptions,
      'noUncheckedIndexedAccess',
    );
  const analyzableUndefinedType = canAnalyzeVoidLikeConstituents
    ? checker.getUndefinedType()
    : undefined;
  const assignabilityBySource = new WeakMap<
    ts.Type,
    WeakMap<ts.Type, boolean>
  >();
  const analysisObjectIds = new WeakMap<object, number>();
  let analysisWorkCount = 0;
  let nextAnalysisObjectId = 0;
  const analysisBudgetExceeded = new Error('Type analysis budget exceeded');
  const assignabilityComparisonFailed = new Error(
    'TypeScript assignability comparison failed',
  );

  /**
   * `never` itself, or an intersection that reduces to it.
   */
  function isNeverLike(type: ts.Type): boolean {
    return (
      tsutils.isTypeFlagSet(type, ts.TypeFlags.Never) ||
      (type.isIntersection() &&
        isTypeAssignableTo(type, checker.getNeverType()))
    );
  }

  /**
   * `undefined`/`void` constituents are exempt unless the program models
   * unchecked index access (`strictNullChecks` + `noUncheckedIndexedAccess`).
   */
  function isExemptVoidLike(type: ts.Type): boolean {
    return (
      !canAnalyzeVoidLikeConstituents &&
      tsutils.isTypeFlagSet(type, ts.TypeFlags.Undefined | ts.TypeFlags.Void)
    );
  }

  /**
   * Measures body nesting iteratively; deeply nested syntax risks stack
   * overflows inside recursive analysis and the checker itself.
   */
  function exceedsAnalysisSyntaxDepth(root: ts.Node): boolean {
    const pending: { depth: number; node: ts.Node }[] = [
      { depth: 0, node: root },
    ];
    for (
      let current = pending.pop();
      current != null;
      current = pending.pop()
    ) {
      if (current.depth > MAX_ANALYSIS_SYNTAX_DEPTH) {
        return true;
      }
      ts.forEachChild(current.node, child => {
        if (isRuntimeFunctionLike(child)) {
          return;
        }
        pending.push({ depth: current.depth + 1, node: child });
      });
    }
    return false;
  }

  /**
   * Only call-stack RangeErrors count; other RangeErrors must propagate.
   */
  function isStackOverflowError(error: unknown): boolean {
    return (
      error instanceof RangeError &&
      error.message.toLowerCase().includes('call stack')
    );
  }

  /**
   * Charges one unit against the per-function budget and aborts the whole
   * function's analysis once it is exhausted.
   */
  function consumeAnalysisWork(): void {
    analysisWorkCount += 1;
    if (analysisWorkCount > MAX_ANALYSIS_WORK) {
      throw analysisBudgetExceeded;
    }
  }

  /**
   * Budgeted, memoized assignability; converts checker overflows on
   * pathological types into an abort of the current function.
   */
  function isTypeAssignableTo(source: ts.Type, target: ts.Type): boolean {
    const cachedByTarget = assignabilityBySource.get(source);
    const cached = cachedByTarget?.get(target);
    if (cached != null) {
      return cached;
    }
    consumeAnalysisWork();
    try {
      const result = checker.isTypeAssignableTo(source, target);
      const byTarget = cachedByTarget ?? new WeakMap<ts.Type, boolean>();
      byTarget.set(target, result);
      if (cachedByTarget == null) {
        assignabilityBySource.set(source, byTarget);
      }
      return result;
    } catch {
      // TypeScript can overflow on mutually recursive template-literal
      // types: https://github.com/microsoft/TypeScript/issues/62933
      throw assignabilityComparisonFailed;
    }
  }

  /**
   * Stable per-object ids used to build memoization keys.
   */
  function getAnalysisObjectId(value: object): number {
    const existing = analysisObjectIds.get(value);
    if (existing != null) {
      return existing;
    }
    const id = nextAnalysisObjectId;
    nextAnalysisObjectId += 1;
    analysisObjectIds.set(value, id);
    return id;
  }

  /**
   * Order-insensitive key for one (anchor, observations) analysis state.
   */
  function getAnalysisStateKey(
    anchor: ts.Node,
    observations: readonly Observation[],
  ): string {
    const observationKeys = observations
      .map(
        observation =>
          `${getAnalysisObjectId(observation.node)}:${
            observation.type == null
              ? 'deferred'
              : getAnalysisObjectId(observation.type)
          }`,
      )
      .sort();
    return `${getAnalysisObjectId(anchor)}|${[...new Set(observationKeys)].join(',')}`;
  }

  /**
   * Fills in a deferred observation's type from its node.
   */
  function resolveObservation(observation: Observation): ResolvedObservation {
    return observation.type == null
      ? {
          node: observation.node,
          type: checker.getTypeAtLocation(observation.node),
        }
      : (observation as ResolvedObservation);
  }

  /**
   * Flattens union observations and widens deferred types and type
   * parameters to their base constraints (an upper bound can retain extra
   * possibilities but never proves one absent).
   */
  function expandObservations(
    observations: readonly Observation[],
  ): Observation[] {
    function expand(
      observation: Observation,
      seen: Set<ts.Type>,
    ): Observation[] {
      const { type } = observation;
      if (type == null) {
        return [observation];
      }
      if (isNeverLike(type)) {
        return [];
      }
      if (seen.has(type)) {
        return [];
      }

      seen.add(type);
      if (type.isUnion()) {
        return type.types.flatMap(member =>
          expand({ node: observation.node, type: member }, seen),
        );
      }
      if (isDeferredType(type)) {
        const constraint = checker.getBaseConstraintOfType(type);
        if (
          constraint != null &&
          constraint !== type &&
          !isUncertain(constraint)
        ) {
          // A deferred type's base constraint is an upper bound for every
          // instantiation. Expanding that bound may retain extra
          // possibilities, but it cannot incorrectly prove one absent.
          return expand({ node: observation.node, type: constraint }, seen);
        }
      }
      if (tsutils.isTypeParameter(type)) {
        const constraint = checker.getBaseConstraintOfType(type);
        return constraint == null ||
          constraint === type ||
          isUncertain(constraint)
          ? [observation]
          : [
              observation,
              ...expand({ node: observation.node, type: constraint }, seen),
            ];
      }
      return [observation];
    }

    return observations.flatMap(observation => expand(observation, new Set()));
  }

  function expandResolvedObservations(
    observations: readonly Observation[],
  ): ResolvedObservation[] {
    return expandObservations(observations.map(resolveObservation)).map(
      resolveObservation,
    );
  }

  function resetAnalysisWork(): void {
    analysisWorkCount = 0;
  }

  return {
    analysisBudgetExceeded,
    analyzableUndefinedType,
    assignabilityComparisonFailed,
    checker,
    consumeAnalysisWork,
    exceedsAnalysisSyntaxDepth,
    expandObservations,
    expandResolvedObservations,
    getAnalysisObjectId,
    getAnalysisStateKey,
    isDeferredType,
    isExemptVoidLike,
    isNeverLike,
    isStackOverflowError,
    isTypeAssignableTo,
    isUncertain,
    program,
    resetAnalysisWork,
    resolveObservation,
    services: dependencies.services,
  };
}
