import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { AnalysisState } from './analysis-state';
import type { CallableProjections } from './callable-projections';
import type { ExpressionAnalysis } from './expression-observations';
import type { PropertyProjections } from './property-projections';
import type {
  AnalysisPath,
  Observation,
  ResolvedAnalysisTask,
  ResolvedObservation,
} from './shared';

import { isBuiltinSymbolLike, isSymbolFromDefaultLibrary } from '../../util';
import {
  ARRAY_NAMES,
  ASYNC_ITERABLE_NAMES,
  GENERATOR_NAMES,
  MAP_NAMES,
  MAX_ANALYSIS_TYPE_DEPTH,
  SET_NAMES,
  STRUCTURAL_DEFAULT_LIBRARY_NAMES,
  VALUE_WRAPPER_NAMES,
  WEAK_REF_NAMES,
} from './shared';

export interface TypeAnalysis {
  analyzeResolvedType: (
    type: ts.Type,
    anchor: ts.Node,
    observations: readonly Observation[],
    unused: ts.Type[],
    path: AnalysisPath | undefined,
  ) => void;
  analyzeTypeNode: (
    node: ts.TypeNode,
    observations: readonly Observation[],
    unused: ts.Type[],
  ) => void;
  collectUnobservedUnionMembers: (type: ts.Type, unused: ts.Type[]) => void;
  resetTypeAnalysis: () => void;
}

export function createTypeAnalysis(
  state: AnalysisState,
  expressions: ExpressionAnalysis,
  properties: PropertyProjections,
  callables: CallableProjections,
): TypeAnalysis {
  const {
    checker,
    consumeAnalysisWork,
    expandResolvedObservations,
    getAnalysisStateKey,
    isDeferredType,
    isExemptVoidLike,
    isNeverLike,
    isTypeAssignableTo,
    isUncertain,
    program,
    resolveObservation,
  } = state;
  const { observationNeedsProjection, projectAwaited } = expressions;
  const { projectIndex, projectProperty } = properties;
  const {
    projectArrayElement,
    projectIterableElement,
    projectMapEntry,
    projectMethodParameter,
    projectMethodReturn,
    projectSignatureReturn,
    projectTupleElement,
  } = callables;
  let analyzedTypeStates = new WeakMap<ts.Type, Set<string>>();
  let analysisTasks: ResolvedAnalysisTask[] = [];
  let analysisTaskIndex = 0;
  let drainingAnalysisTasks = false;

  // Deliberately parallel to `analyzeUnion` below: this variant walks a
  // resolved union, where the checker has already normalized absorbed
  // constituents and reduced literal pairs, so it needs the boolean-pair
  // special case but no absorption handling. The syntactic variant needs the
  // opposite. Unifying them would replace those two structural differences
  // with injected callbacks.
  function analyzeResolvedUnion(
    type: ts.Type,
    anchor: ts.Node,
    observations: readonly Observation[],
    unused: ts.Type[],
    path: AnalysisPath,
  ): void {
    // `boolean` is represented internally as `false | true`, but its syntax
    // deliberately abstracts both literals just like `string` abstracts all
    // string literals.
    if (!type.isUnion() || tsutils.isTypeFlagSet(type, ts.TypeFlags.Boolean)) {
      return;
    }

    const candidates = expandResolvedObservations(observations);
    if (
      candidates.length === 0 ||
      candidates.some(candidate => isUncertain(candidate.type)) ||
      type.types.some(isUncertain)
    ) {
      return;
    }

    const observableMembers = type.types.filter(
      member => !isNeverLike(member) && !isExemptVoidLike(member),
    );
    if (
      candidates.some(
        candidate =>
          !tsutils.isTypeFlagSet(candidate.type, ts.TypeFlags.Never) &&
          !isExemptVoidLike(candidate.type) &&
          !tsutils.isTypeParameter(candidate.type) &&
          !observableMembers.some(member =>
            isTypeAssignableTo(candidate.type, member),
          ) &&
          (isDeferredType(candidate.type) ||
            isTypeAssignableTo(candidate.type, type)),
      )
    ) {
      // Deferred conditional, indexed-access, and mapped types can span a
      // union without being assignable to any one constituent until their
      // type parameters are instantiated. Treating every constituent as
      // absent would be a false positive, so this union is not divisible.
      return;
    }

    const memberTypes = new Set(type.types);
    const trueType = checker.getTrueType();
    const falseType = checker.getFalseType();
    const hasBooleanPair =
      memberTypes.has(trueType) && memberTypes.has(falseType);
    const exactCandidates = new Map<ts.Type, ResolvedObservation[]>();
    const nonExactCandidates: ResolvedObservation[] = [];
    for (const candidate of candidates) {
      if (!memberTypes.has(candidate.type)) {
        nonExactCandidates.push(candidate);
        continue;
      }
      const exact = exactCandidates.get(candidate.type);
      if (exact == null) {
        exactCandidates.set(candidate.type, [candidate]);
      } else {
        exact.push(candidate);
      }
    }

    for (const member of type.types) {
      if (
        isNeverLike(member) ||
        isExemptVoidLike(member) ||
        isCallerInstantiatedMember(member)
      ) {
        continue;
      }
      const matching =
        hasBooleanPair && (member === trueType || member === falseType)
          ? candidates.filter(candidate =>
              isTypeAssignableTo(candidate.type, checker.getBooleanType()),
            )
          : [
              ...(exactCandidates.get(member) ?? []),
              ...nonExactCandidates.filter(candidate =>
                isTypeAssignableTo(candidate.type, member),
              ),
            ];
      if (matching.length === 0) {
        unused.push(member);
      } else {
        analyzeResolvedType(member, anchor, matching, unused, path);
      }
    }
  }

  /**
   * An open member's value space is decided by the caller's instantiation
   * (`RuleMap[R]` can be anything, `T` can be `null`), so its absence in the
   * body proves nothing.
   */
  function isCallerInstantiatedMember(member: ts.Type): boolean {
    return tsutils.isTypeParameter(member) || isDeferredType(member);
  }

  /**
   * Marks every observable member unused; used when no observation
   * reaches the position at all.
   */
  function collectUnobservedUnionMembers(
    type: ts.Type,
    unused: ts.Type[],
  ): void {
    if (
      !type.isUnion() ||
      tsutils.isTypeFlagSet(type, ts.TypeFlags.Boolean) ||
      type.types.some(isUncertain)
    ) {
      return;
    }
    for (const member of type.types) {
      if (
        !isNeverLike(member) &&
        !isExemptVoidLike(member) &&
        !isCallerInstantiatedMember(member)
      ) {
        unused.push(member);
      }
    }
  }

  /**
   * Private and protected members are invisible to callers and therefore
   * not part of the misleading surface.
   */
  function isPubliclyObservableProperty(property: ts.Symbol): boolean {
    const declarations = property.getDeclarations();
    return (
      declarations == null ||
      declarations.some(declaration => {
        const name = ts.getNameOfDeclaration(declaration);
        return (
          (name == null || !ts.isPrivateIdentifier(name)) &&
          !tsutils.isModifierFlagSet(
            declaration,
            ts.ModifierFlags.Private | ts.ModifierFlags.Protected,
          )
        );
      })
    );
  }

  function analyzeStructuralMembers(
    type: ts.Type,
    anchor: ts.Node,
    observations: readonly Observation[],
    unused: ts.Type[],
    path: AnalysisPath,
    customBuiltinSurfaceOnly: boolean,
  ): void {
    const symbol = type.getSymbol();
    if (
      customBuiltinSurfaceOnly &&
      symbol != null &&
      isSymbolFromDefaultLibrary(program, symbol)
    ) {
      return;
    }

    for (const kind of [
      ts.SignatureKind.Call,
      ts.SignatureKind.Construct,
    ] as const) {
      for (const signature of checker.getSignaturesOfType(type, kind)) {
        analyzeResolvedType(
          checker.getReturnTypeOfSignature(signature),
          anchor,
          projectSignatureReturn(observations, kind, signature),
          unused,
          path,
        );
      }
    }

    for (const property of checker.getPropertiesOfType(type)) {
      if (
        !isPubliclyObservableProperty(property) ||
        (customBuiltinSurfaceOnly &&
          isSymbolFromDefaultLibrary(program, property))
      ) {
        continue;
      }
      analyzeResolvedType(
        checker.getTypeOfSymbolAtLocation(property, anchor),
        anchor,
        projectProperty(observations, property),
        unused,
        path,
      );
    }

    for (const indexInfo of checker.getIndexInfosOfType(type)) {
      analyzeResolvedType(
        indexInfo.type,
        anchor,
        projectIndex(observations, indexInfo.keyType),
        unused,
        path,
      );
    }
  }

  /**
   * Cycle check against the chain of types currently being analyzed.
   */
  function analysisPathIncludes(
    path: AnalysisPath | undefined,
    type: ts.Type,
  ): boolean {
    for (let current = path; current != null; current = current.parent) {
      if (current.type === type) {
        return true;
      }
    }
    return false;
  }

  /**
   * Dispatches one resolved type to the matching structural analysis,
   * guarded by cycle, depth, and memoization checks.
   */
  function processResolvedType(
    type: ts.Type,
    anchor: ts.Node,
    observations: readonly Observation[],
    unused: ts.Type[],
    path: AnalysisPath | undefined,
  ): void {
    if (
      isUncertain(type) ||
      isNeverLike(type) ||
      tsutils.isTypeFlagSet(
        type,
        ts.TypeFlags.TypeParameter | ts.TypeFlags.Undefined | ts.TypeFlags.Void,
      ) ||
      analysisPathIncludes(path, type) ||
      // Beyond this depth the analysis stops quietly: positions that deep are
      // left unproven instead of reported, which can only suppress
      // diagnostics.
      (path != null && path.depth >= MAX_ANALYSIS_TYPE_DEPTH)
    ) {
      return;
    }

    if (
      observations.some(
        observation =>
          observation.type === type &&
          !observationNeedsProjection(observation.node),
      )
    ) {
      // Returning an opaque expression whose type is exactly the annotated
      // type leaves every nested possibility observable. Literals and
      // constructor/call expressions are excluded because their syntax can
      // reveal a narrower structural value than contextual typing does.
      return;
    }

    const stateKey = getAnalysisStateKey(anchor, observations);
    let completedStates = analyzedTypeStates.get(type);
    if (completedStates?.has(stateKey) === true) {
      return;
    }
    if (completedStates == null) {
      completedStates = new Set();
      analyzedTypeStates.set(type, completedStates);
    }
    completedStates.add(stateKey);

    const childPath: AnalysisPath = {
      depth: (path?.depth ?? 0) + 1,
      parent: path,
      type,
    };
    if (type.isUnion()) {
      analyzeResolvedUnion(type, anchor, observations, unused, childPath);
      return;
    }

    if (tsutils.isThenableType(checker, anchor, type)) {
      const awaited = checker.getAwaitedType(type);
      if (awaited != null && awaited !== type) {
        analyzeResolvedType(
          awaited,
          anchor,
          projectAwaited(observations),
          unused,
          childPath,
        );
        analyzeStructuralMembers(
          type,
          anchor,
          observations,
          unused,
          childPath,
          true,
        );
        return;
      }
    }

    if (checker.isTupleType(type)) {
      const tuple = type;
      for (const [index, element] of checker
        .getTypeArguments(tuple)
        .entries()) {
        const flags = tuple.target.elementFlags.at(index);
        analyzeResolvedType(
          element,
          anchor,
          projectTupleElement(
            observations,
            index,
            flags != null && (flags & ts.ElementFlags.Variable) !== 0,
          ),
          unused,
          childPath,
        );
      }
      return;
    }

    const numberIndex = checker.getIndexTypeOfType(type, ts.IndexKind.Number);
    const typeSymbol = type.getSymbol();
    if (
      checker.isArrayLikeType(type) ||
      isBuiltinSymbolLike(program, type, ARRAY_NAMES) ||
      (numberIndex != null &&
        typeSymbol != null &&
        isSymbolFromDefaultLibrary(program, typeSymbol))
    ) {
      if (numberIndex != null) {
        analyzeResolvedType(
          numberIndex,
          anchor,
          projectArrayElement(observations),
          unused,
          childPath,
        );
      }
      analyzeStructuralMembers(
        type,
        anchor,
        observations,
        unused,
        childPath,
        true,
      );
      return;
    }

    if (isBuiltinSymbolLike(program, type, SET_NAMES)) {
      const iterableExpectedElements = projectIterableElement(
        [{ node: anchor, type }],
        false,
      );
      const expectedElements =
        iterableExpectedElements.length > 0
          ? iterableExpectedElements
          : projectMethodParameter([{ node: anchor, type }], 'has', 0);
      const iterableProjected = projectIterableElement(observations, false);
      const projected =
        iterableProjected.length > 0
          ? iterableProjected
          : projectMethodParameter(observations, 'has', 0);
      for (const element of expectedElements) {
        const expectedElement = resolveObservation(element);
        analyzeResolvedType(
          expectedElement.type,
          anchor,
          projected,
          unused,
          childPath,
        );
      }
      analyzeStructuralMembers(
        type,
        anchor,
        observations,
        unused,
        childPath,
        true,
      );
      return;
    }

    if (isBuiltinSymbolLike(program, type, MAP_NAMES)) {
      for (const index of [0, 1] as const) {
        const expectedArguments = projectMapEntry(
          [{ node: anchor, type }],
          index,
        );
        const projected = projectMapEntry(observations, index);
        for (const argument of expectedArguments) {
          const expectedArgument = resolveObservation(argument);
          analyzeResolvedType(
            expectedArgument.type,
            anchor,
            projected,
            unused,
            childPath,
          );
        }
      }
      analyzeStructuralMembers(
        type,
        anchor,
        observations,
        unused,
        childPath,
        true,
      );
      return;
    }

    if (isBuiltinSymbolLike(program, type, WEAK_REF_NAMES)) {
      const expectedValues = projectMethodReturn(
        [{ node: anchor, type }],
        'deref',
      );
      const projectedValues = projectMethodReturn(observations, 'deref');
      for (const value of expectedValues) {
        const expectedValue = resolveObservation(value);
        analyzeResolvedType(
          expectedValue.type,
          anchor,
          projectedValues,
          unused,
          childPath,
        );
      }
      analyzeStructuralMembers(
        type,
        anchor,
        observations,
        unused,
        childPath,
        true,
      );
      return;
    }

    if (isBuiltinSymbolLike(program, type, VALUE_WRAPPER_NAMES)) {
      const value = checker.getPropertyOfType(type, 'value');
      if (value != null) {
        analyzeResolvedType(
          checker.getTypeOfSymbolAtLocation(value, anchor),
          anchor,
          projectProperty(observations, value),
          unused,
          childPath,
        );
      }
      analyzeStructuralMembers(
        type,
        anchor,
        observations,
        unused,
        childPath,
        true,
      );
      return;
    }

    if (isBuiltinSymbolLike(program, type, GENERATOR_NAMES)) {
      const isAsync = isBuiltinSymbolLike(program, type, ASYNC_ITERABLE_NAMES);
      const expectedYields = projectIterableElement(
        [{ node: anchor, type }],
        isAsync,
      );
      const projectedYields = projectIterableElement(observations, isAsync);
      for (const element of expectedYields) {
        const expectedYield = resolveObservation(element);
        analyzeResolvedType(
          expectedYield.type,
          anchor,
          projectedYields,
          unused,
          childPath,
        );
      }
      analyzeStructuralMembers(
        type,
        anchor,
        observations,
        unused,
        childPath,
        true,
      );
      return;
    }

    if (
      !type.isIntersection() &&
      !tsutils.isTypeFlagSet(type, ts.TypeFlags.Object)
    ) {
      return;
    }

    const symbol = type.getSymbol();
    if (
      symbol != null &&
      isSymbolFromDefaultLibrary(program, symbol) &&
      !isBuiltinSymbolLike(program, type, STRUCTURAL_DEFAULT_LIBRARY_NAMES) &&
      (!tsutils.isObjectType(type) ||
        !tsutils.isObjectFlagSet(type, ts.ObjectFlags.Mapped))
    ) {
      return;
    }

    analyzeStructuralMembers(
      type,
      anchor,
      observations,
      unused,
      childPath,
      false,
    );
  }

  /**
   * Runs queued structural tasks breadth-first so a single wide type
   * cannot recurse unboundedly before others are seen.
   */
  function drainAnalysisTasks(): void {
    if (drainingAnalysisTasks) {
      return;
    }

    drainingAnalysisTasks = true;
    try {
      while (analysisTaskIndex < analysisTasks.length) {
        const task = analysisTasks[analysisTaskIndex];
        analysisTaskIndex += 1;
        processResolvedType(
          task.type,
          task.anchor,
          task.observations,
          task.unused,
          task.path,
        );
      }
    } finally {
      analysisTasks = [];
      analysisTaskIndex = 0;
      drainingAnalysisTasks = false;
    }
  }

  function analyzeResolvedType(
    type: ts.Type,
    anchor: ts.Node,
    observations: readonly Observation[],
    unused: ts.Type[],
    path: AnalysisPath | undefined,
  ): void {
    // Charge work before enqueueing so a single very wide structural type
    // cannot build an unbounded pending-task array before the drain catches up.
    consumeAnalysisWork();
    analysisTasks.push({ anchor, observations, path, type, unused });
    drainAnalysisTasks();
  }

  /**
   * Entry point for written annotations: analyzes the syntactic union
   * first, then the resolved type behind it.
   */
  function analyzeTypeNode(
    node: ts.TypeNode,
    observations: readonly Observation[],
    unused: ts.Type[],
  ): void {
    if (ts.isParenthesizedTypeNode(node)) {
      analyzeTypeNode(node.type, observations, unused);
      return;
    }

    if (typeNodeNamesWholeEnum(node)) {
      return;
    }

    if (ts.isUnionTypeNode(node)) {
      analyzeUnion(node, observations, unused);
      return;
    }

    if (ts.isFunctionTypeNode(node)) {
      analyzeTypeNode(
        node.type,
        projectSignatureReturn(observations, ts.SignatureKind.Call),
        unused,
      );
      return;
    }

    if (ts.isConstructorTypeNode(node)) {
      analyzeTypeNode(
        node.type,
        projectSignatureReturn(observations, ts.SignatureKind.Construct),
        unused,
      );
      return;
    }

    analyzeResolvedType(
      checker.getTypeFromTypeNode(node),
      node,
      observations,
      unused,
      undefined,
    );
  }

  /**
   * A bare enum reference abstracts its members the way `string` abstracts
   * string literals, so it is not treated as a union of members.
   */
  function typeNodeNamesWholeEnum(node: ts.TypeNode): boolean {
    if (!ts.isTypeReferenceNode(node) || node.typeArguments != null) {
      return false;
    }
    const symbol = checker.getTypeFromTypeNode(node).getSymbol();
    return (
      symbol != null && tsutils.isSymbolFlagSet(symbol, ts.SymbolFlags.Enum)
    );
  }

  // The syntactic counterpart of `analyzeResolvedUnion` above: written
  // constituents keep their source order and absorbed siblings, so this
  // variant handles absorption and recurses into member type nodes.
  function analyzeUnion(
    node: ts.UnionTypeNode,
    observations: readonly Observation[],
    unused: ts.Type[],
  ): void {
    const candidates = expandResolvedObservations(observations);
    if (
      candidates.length === 0 ||
      candidates.some(({ type }) => isUncertain(type))
    ) {
      return;
    }

    const members = node.types.map(typeNode => ({
      node: typeNode,
      type: checker.getTypeFromTypeNode(typeNode),
    }));
    if (members.some(({ type }) => isUncertain(type))) {
      return;
    }

    const observableMembers = members.filter(
      member => !isNeverLike(member.type) && !isExemptVoidLike(member.type),
    );
    const union = checker.getTypeFromTypeNode(node);
    if (
      candidates.some(
        candidate =>
          !tsutils.isTypeFlagSet(candidate.type, ts.TypeFlags.Never) &&
          !isExemptVoidLike(candidate.type) &&
          !tsutils.isTypeParameter(candidate.type) &&
          !observableMembers.some(member =>
            isTypeAssignableTo(candidate.type, member.type),
          ) &&
          (isDeferredType(candidate.type) ||
            isTypeAssignableTo(candidate.type, union)),
      )
    ) {
      return;
    }

    const memberTypes = new Set(members.map(member => member.type));
    const exactCandidates = new Map<ts.Type, ResolvedObservation[]>();
    const nonExactCandidates: ResolvedObservation[] = [];
    for (const candidate of candidates) {
      if (
        !memberTypes.has(candidate.type) ||
        members.some(
          member =>
            member.type !== candidate.type &&
            isTypeAssignableTo(candidate.type, member.type),
        )
      ) {
        // A candidate exactly matching a constituent that is itself
        // absorbed by a wider sibling still satisfies that wider sibling.
        // Keep it in the assignability bucket so the syntactic ordering of
        // `"a" | string` cannot make `string` look unused.
        nonExactCandidates.push(candidate);
        continue;
      }
      const exact = exactCandidates.get(candidate.type);
      if (exact == null) {
        exactCandidates.set(candidate.type, [candidate]);
      } else {
        exact.push(candidate);
      }
    }

    for (const member of members) {
      if (
        isNeverLike(member.type) ||
        isExemptVoidLike(member.type) ||
        isCallerInstantiatedMember(member.type)
      ) {
        continue;
      }

      // TypeScript reduces constituents that are already represented by a
      // wider sibling (`string | 'literal'` is just `string`). Such a
      // constituent does not expose an additional possibility to callers,
      // so it cannot be misleading on its own.
      if (
        members.some(
          other =>
            other !== member && isTypeAssignableTo(member.type, other.type),
        )
      ) {
        continue;
      }

      const matching = [
        ...(exactCandidates.get(member.type) ?? []),
        ...nonExactCandidates.filter(candidate =>
          isTypeAssignableTo(candidate.type, member.type),
        ),
      ];
      if (matching.length === 0) {
        unused.push(member.type);
      } else {
        analyzeTypeNode(member.node, matching, unused);
      }
    }
  }

  function resetTypeAnalysis(): void {
    analyzedTypeStates = new WeakMap();
    analysisTasks = [];
    analysisTaskIndex = 0;
    drainingAnalysisTasks = false;
  }

  return {
    analyzeResolvedType,
    analyzeTypeNode,
    collectUnobservedUnionMembers,
    resetTypeAnalysis,
  };
}
