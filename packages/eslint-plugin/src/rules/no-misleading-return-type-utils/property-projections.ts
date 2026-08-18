import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import type { AnalysisState } from './analysis-state';
import type { CallableProjections } from './callable-projections';
import type { ControlFlowAnalysis } from './control-flow';
import type { ExpressionAnalysis } from './expression-observations';
import type { Observation, PropertyProjection } from './shared';

import { createPropertyKeyMatching } from './property-key-matching';
import { hasAnyDecorators, MAX_ARRAY_INDEX } from './shared';

export interface PropertyProjections {
  getPropertyName: (name: ts.PropertyName) => string | undefined;
  projectIndex: (
    observations: readonly Observation[],
    keyType: ts.Type,
    coveredKeys?: ReadonlySet<string>,
  ) => Observation[];
  projectProperty: (
    observations: readonly Observation[],
    expectedProperty: ts.Symbol,
  ) => Observation[];
}

export function createPropertyProjections(
  state: AnalysisState,
  controlFlow: ControlFlowAnalysis,
  expressions: ExpressionAnalysis,
  callables: CallableProjections,
): PropertyProjections {
  const {
    checker,
    expandObservations,
    getAnalysisObjectId,
    isTypeAssignableTo,
    isUncertain,
    resolveObservation,
  } = state;
  const { getTSStaticValue, unwrapRuntimeExpression } = controlFlow;
  const { collectReturns, getExpressionObservations } = expressions;
  const { projectTupleElement } = callables;
  const { propertyKeyTypesMayOverlap, stringPropertyMatchesIndexKey } =
    createPropertyKeyMatching(state);
  const objectLiteralPropertiesByName = new WeakMap<
    ts.ObjectLiteralExpression,
    ReadonlyMap<string, ts.ObjectLiteralElementLike> | null
  >();

  /**
   * A property's declared type on the observed value, marking whether the
   * property is always present.
   */
  function projectPropertyFromType(
    observation: Observation,
    expectedProperty: ts.Symbol,
    fromObjectSpread = false,
  ): PropertyProjection {
    const resolved = resolveObservation(observation);
    const property = checker.getPropertyOfType(
      checker.getApparentType(resolved.type),
      expectedProperty.getName(),
    );
    const declarations = property?.getDeclarations();
    const isDefinitelyNonEnumerableClassMember =
      fromObjectSpread &&
      declarations != null &&
      declarations.length > 0 &&
      declarations.every(
        declaration =>
          (ts.isMethodDeclaration(declaration) ||
            ts.isGetAccessorDeclaration(declaration) ||
            ts.isSetAccessorDeclaration(declaration)) &&
          (ts.isClassDeclaration(declaration.parent) ||
            ts.isClassExpression(declaration.parent)) &&
          !hasAnyDecorators(declaration) &&
          !hasAnyDecorators(declaration.parent),
      );
    return property == null || isDefinitelyNonEnumerableClassMember
      ? { alwaysPresent: false, observations: [] }
      : {
          alwaysPresent: !tsutils.isSymbolFlagSet(
            property,
            ts.SymbolFlags.Optional,
          ),
          observations: [
            {
              node: observation.node,
              type: checker.getTypeOfSymbolAtLocation(
                property,
                observation.node,
              ),
            },
          ],
        };
  }

  /**
   * A property's values from object-literal syntax: initializers,
   * shorthand reads, and getter returns.
   */
  function projectObjectLiteralProperty(
    observation: Observation,
    expectedProperty: ts.Symbol,
    property: ts.ObjectLiteralElementLike,
  ): Observation[] {
    if (ts.isPropertyAssignment(property)) {
      return getExpressionObservations(property.initializer);
    }
    if (ts.isShorthandPropertyAssignment(property)) {
      return getExpressionObservations(property.name);
    }
    if (ts.isGetAccessorDeclaration(property)) {
      return property.body == null ? [] : collectReturns(property.body);
    }
    return projectPropertyFromType(observation, expectedProperty).observations;
  }

  /**
   * Statically-keyed properties of an object literal by key id, or
   * nothing when a key cannot be resolved.
   */
  function getIndexedObjectLiteralProperties(
    object: ts.ObjectLiteralExpression,
  ): ReadonlyMap<string, ts.ObjectLiteralElementLike> | undefined {
    const cached = objectLiteralPropertiesByName.get(object);
    if (cached != null || objectLiteralPropertiesByName.has(object)) {
      return cached ?? undefined;
    }

    const properties = new Map<string, ts.ObjectLiteralElementLike>();
    for (const property of object.properties) {
      if (ts.isSpreadAssignment(property)) {
        objectLiteralPropertiesByName.set(object, null);
        return undefined;
      }
      const name = getPropertyName(property.name);
      if (name == null) {
        objectLiteralPropertiesByName.set(object, null);
        return undefined;
      }
      properties.set(name, property);
    }
    objectLiteralPropertiesByName.set(object, properties);
    return properties;
  }

  /**
   * A property's values from each observation, with whether the property
   * is provably always present.
   */
  function projectPropertyWithPresence(
    observations: readonly Observation[],
    expectedProperty: ts.Symbol,
    fromObjectSpread = false,
  ): PropertyProjection {
    const expanded = expandObservations(observations);
    const projected = expanded.map((observation): PropertyProjection => {
      if (fromObjectSpread && ts.isArrayLiteralExpression(observation.node)) {
        const expectedName = expectedProperty.getName();
        const index = Number(expectedName);
        if (
          !Number.isInteger(index) ||
          index < 0 ||
          index >= MAX_ARRAY_INDEX ||
          String(index) !== expectedName
        ) {
          // Object spread copies an array's enumerable index properties,
          // not non-enumerable members such as `length` or prototype
          // methods exposed by its structural TypeScript type.
          return { alwaysPresent: false, observations: [] };
        }

        const prefix = observation.node.elements.slice(0, index + 1);
        if (!prefix.some(ts.isSpreadElement)) {
          const element = observation.node.elements.at(index);
          return element == null || ts.isOmittedExpression(element)
            ? { alwaysPresent: false, observations: [] }
            : {
                alwaysPresent: true,
                observations: getExpressionObservations(element),
              };
        }

        return {
          alwaysPresent: false,
          observations: projectTupleElement([observation], index, false),
        };
      }

      if (ts.isObjectLiteralExpression(observation.node)) {
        const properties = observation.node.properties;
        const expectedName = expectedProperty.getName();
        const indexedProperties = getIndexedObjectLiteralProperties(
          observation.node,
        );
        if (indexedProperties != null) {
          const property = indexedProperties.get(expectedName);
          return property == null
            ? { alwaysPresent: false, observations: [] }
            : {
                alwaysPresent: true,
                observations: projectObjectLiteralProperty(
                  observation,
                  expectedProperty,
                  property,
                ),
              };
        }

        const possibleValues: Observation[] = [];
        for (let index = properties.length - 1; index >= 0; index -= 1) {
          const property = properties[index];
          if (ts.isSpreadAssignment(property)) {
            const spreadProjection = projectPropertyWithPresence(
              getExpressionObservations(property.expression),
              expectedProperty,
              true,
            );
            possibleValues.push(...spreadProjection.observations);
            if (spreadProjection.alwaysPresent) {
              return {
                alwaysPresent: true,
                observations: possibleValues,
              };
            }
            continue;
          }

          const propertyName = getPropertyName(property.name);
          const hasUnknownComputedName =
            propertyName == null && ts.isComputedPropertyName(property.name);
          if (propertyName !== expectedName && !hasUnknownComputedName) {
            continue;
          }

          possibleValues.push(
            ...projectObjectLiteralProperty(
              observation,
              expectedProperty,
              property,
            ),
          );

          if (propertyName === expectedName) {
            return {
              alwaysPresent: true,
              observations: possibleValues,
            };
          }
        }
        return { alwaysPresent: false, observations: possibleValues };
      }

      const resolved = resolveObservation(observation);
      if (isUncertain(resolved.type)) {
        return { alwaysPresent: false, observations: [resolved] };
      }

      const projection = projectPropertyFromType(
        resolved,
        expectedProperty,
        fromObjectSpread,
      );
      return fromObjectSpread
        ? { ...projection, alwaysPresent: false }
        : projection;
    });

    return {
      alwaysPresent:
        projected.length > 0 &&
        projected.every(projection => projection.alwaysPresent),
      observations: projected.flatMap(projection => projection.observations),
    };
  }

  /**
   * Routes a property projection through object-literal syntax when
   * available, otherwise through the type.
   */
  function projectProperty(
    observations: readonly Observation[],
    expectedProperty: ts.Symbol,
  ): Observation[] {
    const projection = projectPropertyWithPresence(
      observations,
      expectedProperty,
    );
    if (projection.alwaysPresent || observations.length === 0) {
      return projection.observations;
    }
    return [
      ...projection.observations,
      { node: observations[0].node, type: checker.getUndefinedType() },
    ];
  }

  /**
   * Whether a written property name can be served by an index signature
   * key type.
   */
  function propertyNameMatchesIndexKey(
    name: ts.PropertyName,
    indexKey: ts.Type,
  ): boolean {
    if (ts.isPrivateIdentifier(name)) {
      return false;
    }
    if (ts.isComputedPropertyName(name)) {
      return propertyKeyTypesMayOverlap(
        checker.getTypeAtLocation(name.expression),
        indexKey,
      );
    }
    if (
      ts.isIdentifier(name) ||
      ts.isNumericLiteral(name) ||
      ts.isStringLiteralLike(name)
    ) {
      return stringPropertyMatchesIndexKey(name.text, indexKey);
    }
    return false;
  }

  /**
   * Whether a type's property can be served by an index signature key
   * type, via its declarations.
   */
  function propertyMatchesIndexKey(
    property: ts.Symbol,
    indexKey: ts.Type,
  ): boolean {
    return (property.getDeclarations() ?? []).some(declaration => {
      const name = ts.getNameOfDeclaration(declaration);
      return (
        name != null &&
        ts.isPropertyName(name) &&
        propertyNameMatchesIndexKey(name, indexKey)
      );
    });
  }

  /**
   * A stable key id for literal and unique-symbol key types.
   */
  function exactPropertyKeyIdFromType(type: ts.Type): string | undefined {
    if (tsutils.isStringLiteralType(type)) {
      return `string:${type.value}`;
    }
    if (tsutils.isNumberLiteralType(type)) {
      return `string:${String(type.value)}`;
    }
    if (tsutils.isUniqueESSymbolType(type)) {
      const symbol = type.getSymbol();
      return symbol == null
        ? undefined
        : `symbol:${getAnalysisObjectId(symbol)}`;
    }
    return undefined;
  }

  /**
   * A stable key id for statically-resolvable property names.
   */
  function exactPropertyKeyId(name: ts.PropertyName): string | undefined {
    if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) {
      return `string:${name.text}`;
    }
    if (ts.isNumericLiteral(name)) {
      return `string:${String(Number(name.text))}`;
    }
    if (!ts.isComputedPropertyName(name)) {
      return undefined;
    }

    const expression = unwrapRuntimeExpression(name.expression);
    const staticValue = getTSStaticValue(expression)?.value;
    if (typeof staticValue === 'string' || typeof staticValue === 'number') {
      return `string:${String(staticValue)}`;
    }
    return exactPropertyKeyIdFromType(checker.getTypeAtLocation(expression));
  }

  function propertyIsCoveredByLaterWrite(
    property: ts.Symbol,
    coveredKeys: ReadonlySet<string>,
  ): boolean {
    return (
      property.getDeclarations()?.some(declaration => {
        const name = ts.getNameOfDeclaration(declaration);
        const key =
          name != null && ts.isPropertyName(name)
            ? exactPropertyKeyId(name)
            : undefined;
        return key != null && coveredKeys.has(key);
      }) === true
    );
  }

  /**
   * Whether every key the requested key type can name was overwritten by
   * a later property write.
   */
  function keyTypeIsCoveredByLaterWrites(
    keyType: ts.Type,
    coveredKeys: ReadonlySet<string>,
  ): boolean {
    if (keyType.isUnion()) {
      return keyType.types.every(member =>
        keyTypeIsCoveredByLaterWrites(member, coveredKeys),
      );
    }
    const key = exactPropertyKeyIdFromType(keyType);
    return key != null && coveredKeys.has(key);
  }

  /**
   * Values an index signature can expose from an object literal,
   * honoring last-write-wins across properties and spreads.
   */
  function projectObjectLiteralIndex(
    object: ts.ObjectLiteralExpression,
    keyType: ts.Type,
    coveredKeys: Set<string>,
  ): Observation[] {
    const observations: Observation[] = [];
    for (let index = object.properties.length - 1; index >= 0; index -= 1) {
      const property = object.properties[index];
      if (ts.isSpreadAssignment(property)) {
        const spreadObservations = expandObservations(
          getExpressionObservations(property.expression),
        );
        if (
          spreadObservations.length > 0 &&
          spreadObservations.every(observation =>
            ts.isObjectLiteralExpression(observation.node),
          )
        ) {
          const branchCoveredKeys: Set<string>[] = [];
          for (const observation of spreadObservations) {
            const coveredInBranch = new Set(coveredKeys);
            observations.push(
              ...projectObjectLiteralIndex(
                observation.node as ts.ObjectLiteralExpression,
                keyType,
                coveredInBranch,
              ),
            );
            branchCoveredKeys.push(coveredInBranch);
          }
          for (const key of branchCoveredKeys[0]) {
            if (
              branchCoveredKeys.every(branchCovered => branchCovered.has(key))
            ) {
              coveredKeys.add(key);
            }
          }
        } else {
          observations.push(
            ...projectIndex(spreadObservations, keyType, coveredKeys),
          );
        }
        continue;
      }

      const exactKey = exactPropertyKeyId(property.name);
      const isCovered = exactKey != null && coveredKeys.has(exactKey);
      if (!isCovered && propertyNameMatchesIndexKey(property.name, keyType)) {
        if (ts.isPropertyAssignment(property)) {
          observations.push(...getExpressionObservations(property.initializer));
        } else if (ts.isShorthandPropertyAssignment(property)) {
          observations.push(...getExpressionObservations(property.name));
        } else if (ts.isGetAccessorDeclaration(property)) {
          if (property.body != null) {
            observations.push(...collectReturns(property.body));
          }
        } else {
          observations.push({
            node: property,
            type: checker.getTypeAtLocation(property),
          });
        }
      }
      if (exactKey != null) {
        coveredKeys.add(exactKey);
      }
    }
    return observations;
  }

  /**
   * Whether an index signature serves the requested key, including string
   * signatures serving numeric keys.
   */
  function indexInfoCoversKey(
    indexKey: ts.Type,
    requestedKey: ts.Type,
  ): boolean {
    return (
      isTypeAssignableTo(requestedKey, indexKey) ||
      (tsutils.isTypeFlagSet(
        requestedKey,
        ts.TypeFlags.Number | ts.TypeFlags.NumberLiteral,
      ) &&
        tsutils.isTypeFlagSet(indexKey, ts.TypeFlags.String))
    );
  }

  /**
   * The covering index signatures, narrowed to the most specific ones.
   */
  function getMostSpecificIndexInfos(
    type: ts.Type,
    requestedKey: ts.Type,
  ): readonly ts.IndexInfo[] {
    const covering = checker
      .getIndexInfosOfType(type)
      .filter(indexInfo => indexInfoCoversKey(indexInfo.keyType, requestedKey));
    return covering.filter(
      candidate =>
        !covering.some(
          other =>
            other !== candidate &&
            indexInfoCoversKey(candidate.keyType, other.keyType) &&
            !indexInfoCoversKey(other.keyType, candidate.keyType),
        ),
    );
  }

  /**
   * Values observable through a type's index signature for the requested
   * key type.
   */
  function projectIndex(
    observations: readonly Observation[],
    keyType: ts.Type,
    coveredKeys: ReadonlySet<string> = new Set(),
  ): Observation[] {
    return expandObservations(observations).flatMap(observation => {
      if (keyTypeIsCoveredByLaterWrites(keyType, coveredKeys)) {
        return [];
      }

      if (ts.isObjectLiteralExpression(observation.node)) {
        const projected = projectObjectLiteralIndex(
          observation.node,
          keyType,
          new Set(coveredKeys),
        );
        if (projected.length > 0) {
          return projected;
        }
      }

      const resolved = resolveObservation(observation);
      if (isUncertain(resolved.type)) {
        return [resolved];
      }

      const indexed = getMostSpecificIndexInfos(resolved.type, keyType)
        .map(indexInfo => indexInfo.type)
        .filter(type => !tsutils.isTypeFlagSet(type, ts.TypeFlags.Never));
      if (indexed.length > 0) {
        return indexed.map(type => ({ node: observation.node, type }));
      }

      return checker
        .getPropertiesOfType(resolved.type)
        .filter(
          property =>
            propertyMatchesIndexKey(property, keyType) &&
            !propertyIsCoveredByLaterWrite(property, coveredKeys),
        )
        .map(property => ({
          node: observation.node,
          type: checker.getTypeOfSymbolAtLocation(property, observation.node),
        }));
    });
  }

  /**
   * The static text of a property name, including computed names that
   * resolve to a well-known symbol or literal.
   */
  function getPropertyName(name: ts.PropertyName): string | undefined {
    if (
      ts.isIdentifier(name) ||
      ts.isPrivateIdentifier(name) ||
      ts.isStringLiteralLike(name) ||
      ts.isNumericLiteral(name)
    ) {
      return name.text;
    }
    if (ts.isComputedPropertyName(name)) {
      if (
        ts.isStringLiteralLike(name.expression) ||
        ts.isNumericLiteral(name.expression)
      ) {
        return name.expression.text;
      }
      const symbol = checker.getSymbolAtLocation(name);
      if (symbol != null && !symbol.getName().startsWith('__computed')) {
        return symbol.getName();
      }
    }
    return undefined;
  }

  return {
    getPropertyName,
    projectIndex,
    projectProperty,
  };
}
