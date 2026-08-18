import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { AnalysisState } from './analysis-state';
import type { ExpressionAnalysis } from './expression-observations';
import type { Observation, SignatureParameterDomain } from './shared';

import { isBuiltinSymbolLike } from '../../util';

export interface CallableProjections {
  projectArrayElement: (observations: readonly Observation[]) => Observation[];
  projectIterableElement: (
    observations: readonly Observation[],
    isAsync: boolean,
  ) => Observation[];
  projectMapEntry: (
    observations: readonly Observation[],
    index: number,
  ) => Observation[];
  projectMethodParameter: (
    observations: readonly Observation[],
    methodName: string,
    parameterIndex: number,
  ) => Observation[];
  projectMethodReturn: (
    observations: readonly Observation[],
    methodName: string,
  ) => Observation[];
  projectSignatureReturn: (
    observations: readonly Observation[],
    kind: ts.SignatureKind,
    expectedSignature?: ts.Signature,
  ) => Observation[];
  projectTupleElement: (
    observations: readonly Observation[],
    index: number,
    rest: boolean,
  ) => Observation[];
  projectYieldedValues: (
    observations: readonly Observation[],
    isAsync: boolean,
  ) => Observation[];
}

export function createCallableProjections(
  state: AnalysisState,
  expressions: ExpressionAnalysis,
): CallableProjections {
  const {
    checker,
    expandObservations,
    expandResolvedObservations,
    isDeferredType,
    isNeverLike,
    isTypeAssignableTo,
    isUncertain,
    program,
    resolveObservation,
  } = state;
  const { getExpressionObservations, projectAwaited } = expressions;

  /**
   * A tuple slot type, unwrapping variadic slots to their element type.
   */
  function getTupleElementType(
    tuple: ts.TupleTypeReference,
    index: number,
    type: ts.Type,
  ): ts.Type | undefined {
    const flags = tuple.target.elementFlags.at(index);
    return flags != null && (flags & ts.ElementFlags.Variadic) !== 0
      ? checker.getIndexTypeOfType(type, ts.IndexKind.Number)
      : type;
  }

  /**
   * Element values of arrays and tuples, from literal syntax when
   * available, otherwise from the numeric index type.
   */
  function projectArrayElement(
    observations: readonly Observation[],
  ): Observation[] {
    return expandObservations(observations).flatMap(observation => {
      if (ts.isArrayLiteralExpression(observation.node)) {
        return observation.node.elements.flatMap(element => {
          if (ts.isOmittedExpression(element)) {
            return [{ node: element, type: checker.getUndefinedType() }];
          }
          return ts.isSpreadElement(element)
            ? projectIterableElement(
                getExpressionObservations(element.expression),
                false,
              )
            : getExpressionObservations(element);
        });
      }

      const resolved = resolveObservation(observation);
      if (isUncertain(resolved.type)) {
        return [resolved];
      }

      const resolvedType = resolved.type;
      if (checker.isTupleType(resolvedType)) {
        return checker.getTypeArguments(resolvedType).flatMap((type, index) => {
          const element = getTupleElementType(resolvedType, index, type);
          return element == null ||
            tsutils.isTypeFlagSet(element, ts.TypeFlags.Never)
            ? []
            : [{ node: observation.node, type: element }];
        });
      }

      const element = checker.getIndexTypeOfType(
        resolved.type,
        ts.IndexKind.Number,
      );
      return element == null ||
        tsutils.isTypeFlagSet(element, ts.TypeFlags.Never)
        ? []
        : [{ node: observation.node, type: element }];
    });
  }

  /**
   * Values a fixed tuple position (or its rest region) can hold.
   */
  function projectTupleElement(
    observations: readonly Observation[],
    index: number,
    rest: boolean,
  ): Observation[] {
    return expandObservations(observations).flatMap(observation => {
      if (ts.isArrayLiteralExpression(observation.node)) {
        if (rest) {
          return observation.node.elements.slice(index).flatMap(element => {
            if (ts.isOmittedExpression(element)) {
              return [{ node: element, type: checker.getUndefinedType() }];
            }
            return ts.isSpreadElement(element)
              ? projectIterableElement(
                  getExpressionObservations(element.expression),
                  false,
                )
              : getExpressionObservations(element);
          });
        }

        if (
          !observation.node.elements
            .slice(0, index + 1)
            .some(ts.isSpreadElement)
        ) {
          const element = observation.node.elements.at(index);
          return element == null || ts.isOmittedExpression(element)
            ? [
                {
                  node: element ?? observation.node,
                  type: checker.getUndefinedType(),
                },
              ]
            : getExpressionObservations(element);
        }
        // A preceding spread makes the source element at this tuple index
        // data-dependent, so use the checker's instantiated tuple type.
      }

      const resolved = resolveObservation(observation);
      if (isUncertain(resolved.type)) {
        return [resolved];
      }

      if (checker.isTupleType(resolved.type)) {
        const tuple = resolved.type;
        const typeArguments = checker.getTypeArguments(tuple);
        const selected = rest
          ? typeArguments.slice(index)
          : [typeArguments.at(index)];
        return selected.flatMap((type, offset) => {
          if (type == null) {
            return [];
          }
          const element = getTupleElementType(tuple, index + offset, type);
          return element == null ||
            tsutils.isTypeFlagSet(element, ts.TypeFlags.Never)
            ? []
            : [{ node: observation.node, type: element }];
        });
      }

      const type = checker.getIndexTypeOfType(
        resolved.type,
        ts.IndexKind.Number,
      );
      return type == null || tsutils.isTypeFlagSet(type, ts.TypeFlags.Never)
        ? []
        : [{ node: observation.node, type }];
    });
  }

  /**
   * Return-type observations of every call signature on the observed
   * callables.
   */
  function projectSignatureReturn(
    observations: readonly Observation[],
    kind: ts.SignatureKind,
    expectedSignature?: ts.Signature,
  ): Observation[] {
    return expandResolvedObservations(observations).flatMap(observation => {
      if (isUncertain(observation.type)) {
        return [observation];
      }

      const signatures = checker.getSignaturesOfType(observation.type, kind);
      const corresponding =
        expectedSignature == null
          ? signatures
          : signatures.filter(signature =>
              signaturesCanCorrespond(expectedSignature, signature),
            );
      return (corresponding.length > 0 ? corresponding : signatures).map(
        signature => ({
          node: observation.node,
          type: checker.getReturnTypeOfSignature(signature),
        }),
      );
    });
  }

  /**
   * Parameter declarations when every parameter has one; parameter-domain
   * analysis needs their syntax.
   */
  function getSignatureParameterDeclarations(
    signature: ts.Signature,
  ): readonly ts.ParameterDeclaration[] | undefined {
    const declarations = signature.parameters.map(
      parameter => parameter.valueDeclaration,
    );
    return declarations.every(
      (declaration): declaration is ts.ParameterDeclaration =>
        declaration != null && ts.isParameter(declaration),
    )
      ? declarations
      : undefined;
  }

  /**
   * The tuple constraint behind a rest parameter type, following
   * deferred types and type parameters.
   */
  function getTupleParameterConstraint(
    type: ts.Type,
    seen = new Set<ts.Type>(),
  ): ts.TupleTypeReference | undefined {
    if (checker.isTupleType(type)) {
      return type;
    }
    if (seen.has(type)) {
      return undefined;
    }
    seen.add(type);
    if (!tsutils.isTypeParameter(type) && !isDeferredType(type)) {
      return undefined;
    }
    const constraint = checker.getBaseConstraintOfType(type);
    return constraint == null || constraint === type
      ? undefined
      : getTupleParameterConstraint(constraint, seen);
  }

  /**
   * A signature's argument positions as prefix / rest / required suffix,
   * or nothing when slot assignment would be ambiguous.
   */
  function getSignatureParameterDomain(
    signature: ts.Signature,
    declarations: readonly ts.ParameterDeclaration[],
  ): SignatureParameterDomain | undefined {
    const prefix: SignatureParameterDomain['prefix'] = [];
    let rest: ts.Type | undefined;
    const suffix: SignatureParameterDomain['suffix'] = [];

    for (const [index, declaration] of declarations.entries()) {
      const parameterType = checker.getTypeOfSymbolAtLocation(
        signature.parameters[index],
        declaration,
      );
      if (declaration.dotDotDotToken == null) {
        prefix.push({
          required:
            declaration.questionToken == null &&
            declaration.initializer == null,
          type: parameterType,
        });
        continue;
      }

      const tupleType = getTupleParameterConstraint(parameterType);
      if (tupleType != null) {
        const elements = checker.getTypeArguments(tupleType);
        let sawRestElement = false;
        for (const [elementIndex, element] of elements.entries()) {
          const flags = tupleType.target.elementFlags[elementIndex];
          if (
            (flags & (ts.ElementFlags.Rest | ts.ElementFlags.Variadic)) !==
            0
          ) {
            if (rest != null) {
              return undefined;
            }
            rest =
              (flags & ts.ElementFlags.Variadic) !== 0
                ? checker.getIndexTypeOfType(element, ts.IndexKind.Number)
                : element;
            if (rest == null) {
              return undefined;
            }
            sawRestElement = true;
          } else {
            (sawRestElement ? suffix : prefix).push({
              required: (flags & ts.ElementFlags.Required) !== 0,
              type: element,
            });
          }
        }
        continue;
      }

      if (rest != null) {
        return undefined;
      }
      rest = checker.getIndexTypeOfType(parameterType, ts.IndexKind.Number);
      if (rest == null) {
        return undefined;
      }
    }

    // Mapping a required suffix from the right is unambiguous when every
    // fixed slot around it is required. If TypeScript ever exposes a tuple
    // with optional slots around a variadic middle, retain all overloads
    // rather than guessing which argument occupies which slot.
    if (
      suffix.length > 0 &&
      [...prefix, ...suffix].some(parameter => !parameter.required)
    ) {
      return undefined;
    }
    return { prefix, rest, suffix };
  }

  /**
   * The fewest arguments the domain accepts.
   */
  function getMinimumArgumentCount(domain: SignatureParameterDomain): number {
    if (domain.suffix.length > 0) {
      return domain.prefix.length + domain.suffix.length;
    }
    let minimum = 0;
    for (const [index, parameter] of domain.prefix.entries()) {
      if (parameter.required) {
        minimum = index + 1;
      }
    }
    return minimum;
  }

  /**
   * The type an argument at a given index is checked against.
   */
  function getParameterTypeAt(
    domain: SignatureParameterDomain,
    index: number,
    argumentCount: number,
  ): ts.Type | undefined {
    if (index < domain.prefix.length) {
      return domain.prefix[index].type;
    }
    const suffixStart = argumentCount - domain.suffix.length;
    if (index >= suffixStart) {
      return domain.suffix[index - suffixStart]?.type;
    }
    return domain.rest;
  }

  /**
   * Replaces a type parameter or deferred type with its constraint so the
   * overlap comparison sees a concrete upper bound.
   */
  function getComparableParameterType(type: ts.Type): ts.Type {
    if (tsutils.isTypeParameter(type) || isDeferredType(type)) {
      const constraint = checker.getBaseConstraintOfType(type);
      if (constraint != null && !isUncertain(constraint)) {
        return constraint;
      }
    }
    return type;
  }

  /**
   * The primitive-domain summary used to check cheaply that domains cannot overlap.
   */
  function getPrimitiveDomain(
    type: ts.Type,
  ):
    | 'bigint'
    | 'boolean'
    | 'null'
    | 'number'
    | 'object'
    | 'string'
    | 'symbol'
    | 'undefined'
    | undefined {
    if (tsutils.isTypeFlagSet(type, ts.TypeFlags.StringLike)) {
      return 'string';
    }
    if (tsutils.isTypeFlagSet(type, ts.TypeFlags.NumberLike)) {
      return 'number';
    }
    if (tsutils.isTypeFlagSet(type, ts.TypeFlags.BigIntLike)) {
      return 'bigint';
    }
    if (tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike)) {
      return 'boolean';
    }
    if (tsutils.isTypeFlagSet(type, ts.TypeFlags.ESSymbolLike)) {
      return 'symbol';
    }
    if (tsutils.isTypeFlagSet(type, ts.TypeFlags.Null)) {
      return 'null';
    }
    if (
      tsutils.isTypeFlagSet(type, ts.TypeFlags.Undefined | ts.TypeFlags.Void)
    ) {
      return 'undefined';
    }
    if (
      type.isIntersection() ||
      tsutils.isTypeFlagSet(
        type,
        ts.TypeFlags.Object | ts.TypeFlags.NonPrimitive,
      )
    ) {
      return 'object';
    }
    return undefined;
  }

  /**
   * Conservative overlap test between two parameter types; uncertainty
   * counts as overlap.
   */
  function parameterTypesMayOverlap(a: ts.Type, b: ts.Type): boolean {
    a = getComparableParameterType(a);
    b = getComparableParameterType(b);
    if (
      isUncertain(a) ||
      isUncertain(b) ||
      tsutils.isTypeParameter(a) ||
      tsutils.isTypeParameter(b) ||
      isDeferredType(a) ||
      isDeferredType(b)
    ) {
      return true;
    }
    if (a.isUnion()) {
      return a.types.some(member => parameterTypesMayOverlap(member, b));
    }
    if (b.isUnion()) {
      return b.types.some(member => parameterTypesMayOverlap(a, member));
    }
    if (isNeverLike(a) || isNeverLike(b)) {
      return false;
    }
    if (isTypeAssignableTo(a, b) || isTypeAssignableTo(b, a)) {
      return true;
    }

    const aDomain = getPrimitiveDomain(a);
    const bDomain = getPrimitiveDomain(b);
    if (aDomain == null || bDomain == null || aDomain === bDomain) {
      return true;
    }
    return false;
  }

  /**
   * Whether two signatures can describe the same call, so their return
   * positions are comparable.
   */
  function signaturesCanCorrespond(
    expected: ts.Signature,
    source: ts.Signature,
  ): boolean {
    const expectedParameters = getSignatureParameterDeclarations(expected);
    const sourceParameters = getSignatureParameterDeclarations(source);
    if (expectedParameters == null || sourceParameters == null) {
      return true;
    }
    const expectedDomain = getSignatureParameterDomain(
      expected,
      expectedParameters,
    );
    const sourceDomain = getSignatureParameterDomain(source, sourceParameters);
    if (expectedDomain == null || sourceDomain == null) {
      return true;
    }

    const expectedMaximum =
      expectedDomain.rest == null
        ? expectedDomain.prefix.length + expectedDomain.suffix.length
        : Infinity;
    const sourceMaximum =
      sourceDomain.rest == null
        ? sourceDomain.prefix.length + sourceDomain.suffix.length
        : Infinity;
    const minimumCommonArgumentCount = Math.max(
      getMinimumArgumentCount(expectedDomain),
      getMinimumArgumentCount(sourceDomain),
    );
    const maximumCommonArgumentCount = Math.min(expectedMaximum, sourceMaximum);
    if (minimumCommonArgumentCount > maximumCommonArgumentCount) {
      return false;
    }

    const fixedFootprint = Math.max(
      expectedDomain.prefix.length + expectedDomain.suffix.length,
      sourceDomain.prefix.length + sourceDomain.suffix.length,
    );
    const lastArgumentCount = Number.isFinite(maximumCommonArgumentCount)
      ? maximumCommonArgumentCount
      : Math.max(minimumCommonArgumentCount, fixedFootprint) + 1;

    for (
      let argumentCount = minimumCommonArgumentCount;
      argumentCount <= lastArgumentCount;
      argumentCount += 1
    ) {
      let overlaps = true;
      for (let index = 0; index < argumentCount; index += 1) {
        const expectedType = getParameterTypeAt(
          expectedDomain,
          index,
          argumentCount,
        );
        const sourceType = getParameterTypeAt(
          sourceDomain,
          index,
          argumentCount,
        );
        if (
          expectedType == null ||
          sourceType == null ||
          !parameterTypesMayOverlap(expectedType, sourceType)
        ) {
          overlaps = false;
          break;
        }
      }
      if (overlaps) {
        return true;
      }
    }
    return false;
  }

  /**
   * Resolves each observation's `methodName` call signatures and projects
   * them through `projectSignature`; opaque observations pass through.
   */
  function flatMapMethodSignatures(
    observations: readonly Observation[],
    methodName: string,
    projectSignature: (signature: ts.Signature, node: ts.Node) => Observation[],
  ): Observation[] {
    return expandResolvedObservations(observations).flatMap(observation => {
      if (isUncertain(observation.type)) {
        return [observation];
      }

      const method = checker.getPropertyOfType(observation.type, methodName);
      if (method == null) {
        return [];
      }

      const methodType = checker.getTypeOfSymbolAtLocation(
        method,
        observation.node,
      );
      return checker
        .getSignaturesOfType(methodType, ts.SignatureKind.Call)
        .flatMap(signature => projectSignature(signature, observation.node));
    });
  }

  function projectMethodReturn(
    observations: readonly Observation[],
    methodName: string,
  ): Observation[] {
    return flatMapMethodSignatures(
      observations,
      methodName,
      (signature, node) => [
        { node, type: checker.getReturnTypeOfSignature(signature) },
      ],
    );
  }

  function projectMethodParameter(
    observations: readonly Observation[],
    methodName: string,
    parameterIndex: number,
  ): Observation[] {
    return flatMapMethodSignatures(
      observations,
      methodName,
      (signature, node) => {
        const parameter = signature.getParameters().at(parameterIndex);
        return parameter == null
          ? []
          : [
              {
                node,
                type: checker.getTypeOfSymbolAtLocation(parameter, node),
              },
            ];
      },
    );
  }

  /**
   * Yield values read from an iterator's `next` result shape.
   */
  function getIteratorResultValues(
    iterator: Observation,
    isAsync: boolean,
  ): Observation[] {
    const resolved = resolveObservation(iterator);
    const next = checker.getPropertyOfType(resolved.type, 'next');
    if (next == null) {
      return [];
    }

    const nextType = checker.getTypeOfSymbolAtLocation(next, iterator.node);
    return checker
      .getSignaturesOfType(nextType, ts.SignatureKind.Call)
      .flatMap(signature => {
        const rawResult = checker.getReturnTypeOfSignature(signature);
        const result = isAsync ? checker.getAwaitedType(rawResult) : rawResult;
        if (result == null) {
          return [];
        }

        return tsutils.unionConstituents(result).flatMap(resultPart => {
          const done = checker.getPropertyOfType(resultPart, 'done');
          if (done != null) {
            const doneType = checker.getTypeOfSymbolAtLocation(
              done,
              iterator.node,
            );
            if (
              !isTypeAssignableTo(checker.getFalseType(), doneType) &&
              !isTypeAssignableTo(checker.getUndefinedType(), doneType)
            ) {
              return [];
            }
          }

          const value = checker.getPropertyOfType(resultPart, 'value');
          return value == null
            ? []
            : [
                {
                  node: iterator.node,
                  type: checker.getTypeOfSymbolAtLocation(value, iterator.node),
                },
              ];
        });
      });
  }

  /**
   * Async generators await each yielded value; sync ones emit it as-is.
   */
  function projectYieldedValues(
    observations: readonly Observation[],
    isAsync: boolean,
  ): Observation[] {
    if (!isAsync) {
      return [...observations];
    }
    return projectAwaited(observations);
  }

  /**
   * Element observations from iterable arguments of built-in collection
   * constructors.
   */
  function projectBuiltinConstructorIterable(
    observation: Observation,
    constructorName: string | string[],
  ): Observation[] | undefined {
    if (
      !ts.isNewExpression(observation.node) ||
      observation.node.typeArguments != null ||
      !isBuiltinSymbolLike(
        program,
        checker.getTypeAtLocation(observation.node.expression),
        constructorName,
      )
    ) {
      return undefined;
    }

    const source = observation.node.arguments?.at(0);
    return source == null
      ? []
      : projectIterableElement(getExpressionObservations(source), false);
  }

  /**
   * Element values of sync or async iterables, from iterator signatures
   * or literal syntax.
   */
  function projectIterableElement(
    observations: readonly Observation[],
    isAsync: boolean,
  ): Observation[] {
    return expandResolvedObservations(observations).flatMap(observation => {
      if (isUncertain(observation.type)) {
        return [observation];
      }

      if (!isAsync) {
        const constructed = projectBuiltinConstructorIterable(observation, [
          'MapConstructor',
          'SetConstructor',
          'WeakMapConstructor',
          'WeakSetConstructor',
        ]);
        if (constructed != null) {
          return constructed;
        }
      }

      if (
        checker.isArrayType(observation.type) ||
        checker.isTupleType(observation.type)
      ) {
        return projectYieldedValues(
          projectArrayElement([observation]),
          isAsync,
        );
      }

      const iteratorProperty =
        (isAsync &&
          tsutils.getWellKnownSymbolPropertyOfType(
            observation.type,
            'asyncIterator',
            checker,
          )) ||
        tsutils.getWellKnownSymbolPropertyOfType(
          observation.type,
          'iterator',
          checker,
        );
      if (iteratorProperty == null) {
        return projectYieldedValues(
          getIteratorResultValues(observation, isAsync),
          isAsync,
        );
      }

      const iteratorMethod = checker.getTypeOfSymbolAtLocation(
        iteratorProperty,
        observation.node,
      );
      return projectYieldedValues(
        checker
          .getSignaturesOfType(iteratorMethod, ts.SignatureKind.Call)
          .flatMap(signature => {
            const iteratorType = checker.getReturnTypeOfSignature(signature);
            return getIteratorResultValues(
              { node: observation.node, type: iteratorType },
              isAsync,
            );
          }),
        isAsync,
      );
    });
  }

  /**
   * Key or value observations of map-like entries.
   */
  function projectMapEntry(
    observations: readonly Observation[],
    index: number,
  ): Observation[] {
    const entries = projectIterableElement(observations, false);
    if (entries.length > 0) {
      return projectTupleElement(entries, index, false);
    }

    // WeakMap is not iterable, but its public `get` signature exposes both
    // generic positions. The same fallback also keeps derived map-like
    // interfaces analyzable when they intentionally hide iteration.
    return index === 0
      ? projectMethodParameter(observations, 'get', 0)
      : projectMethodReturn(observations, 'get');
  }

  return {
    projectArrayElement,
    projectIterableElement,
    projectMapEntry,
    projectMethodParameter,
    projectMethodReturn,
    projectSignatureReturn,
    projectTupleElement,
    projectYieldedValues,
  };
}
