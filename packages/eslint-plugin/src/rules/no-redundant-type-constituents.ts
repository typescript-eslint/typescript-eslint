import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  arrayGroupByToMap,
  createRule,
  getParserServices,
  isFunctionOrFunctionType,
} from '../util';

interface TypeFlagsWithName {
  typeFlags: ts.TypeFlags;
  typeName: string;
}

interface TypeWithName {
  type: ts.Type;
  typeName: string;
}

interface TypeRelation {
  subTypeWithName: TypeWithName;
  superTypeWithName: TypeWithName;
}

interface TypeWithNameAndParentNode extends TypeWithName {
  parentTypeNode: TSESTree.TypeNode;
}

function addToMapGroup<Key, Value>(
  map: Map<Key, Value[]>,
  key: Key,
  value: Value,
): void {
  const existing = map.get(key);

  if (existing) {
    existing.push(value);
  } else {
    map.set(key, [value]);
  }
}

function isNodeInsideReturnType(node: TSESTree.TSUnionType): boolean {
  return !!(
    node.parent.type === AST_NODE_TYPES.TSTypeAnnotation &&
    isFunctionOrFunctionType(node.parent.parent)
  );
}

enum TypeAssignability {
  Equal,
  SourceToTargetAssignable,
  TargetToSourceAssignable,
  NotAssignable,
}

function checkTypeAssignability(
  sourceType: ts.Type,
  targetType: ts.Type,
  checker: ts.TypeChecker,
): TypeAssignability {
  const isSourceAssignableToTarget = checker.isTypeAssignableTo(
    sourceType,
    targetType,
  );
  const isTargetAssignableToSource = checker.isTypeAssignableTo(
    targetType,
    sourceType,
  );

  if (isSourceAssignableToTarget && isTargetAssignableToSource) {
    return TypeAssignability.Equal;
  }
  if (isSourceAssignableToTarget) {
    return TypeAssignability.SourceToTargetAssignable;
  }
  if (isTargetAssignableToSource) {
    return TypeAssignability.TargetToSourceAssignable;
  }
  return TypeAssignability.NotAssignable;
}

function checkIntersectionTypeAssignability(
  sourceType: ts.Type,
  targetType: ts.Type,
  checker: ts.TypeChecker,
): TypeAssignability {
  if (
    tsutils.isUnionType(sourceType) &&
    !tsutils.isIntrinsicBooleanType(sourceType)
  ) {
    let assignability: TypeAssignability = TypeAssignability.NotAssignable;
    for (const typePart of sourceType.types) {
      const typeAssignability = checkIntersectionTypeAssignability(
        typePart,
        targetType,
        checker,
      );
      if (typeAssignability === TypeAssignability.NotAssignable) {
        return TypeAssignability.NotAssignable;
      }
      if (typeAssignability === TypeAssignability.Equal) {
        continue;
      }
      if (
        assignability !== TypeAssignability.NotAssignable &&
        assignability !== typeAssignability
      ) {
        return TypeAssignability.NotAssignable;
      }
      assignability = typeAssignability;
    }
    return assignability;
  }
  if (
    tsutils.isUnionType(targetType) &&
    !tsutils.isIntrinsicBooleanType(targetType)
  ) {
    let assignability: TypeAssignability = TypeAssignability.NotAssignable;
    for (const typePart of targetType.types) {
      const typeAssignability = checkIntersectionTypeAssignability(
        sourceType,
        typePart,
        checker,
      );
      if (typeAssignability === TypeAssignability.NotAssignable) {
        return TypeAssignability.NotAssignable;
      }
      if (typeAssignability === TypeAssignability.Equal) {
        continue;
      }
      if (
        assignability !== TypeAssignability.NotAssignable &&
        assignability !== typeAssignability
      ) {
        return TypeAssignability.NotAssignable;
      }
      assignability = typeAssignability;
    }
    return assignability;
  }
  if (tsutils.isObjectType(sourceType) && tsutils.isObjectType(targetType)) {
    const rawSourceAssignableToTarget = checker.isTypeAssignableTo(
      sourceType,
      targetType,
    );

    const rawTargetAssignableToSource = checker.isTypeAssignableTo(
      targetType,
      sourceType,
    );

    const targetHasOnlyOptionalProperty = hasTargetOnlyOptionalProps(
      sourceType,
      targetType,
      checker,
    );

    const sourceHasOnlyOptionalProperty = hasTargetOnlyOptionalProps(
      targetType,
      sourceType,
      checker,
    );

    const isSourceAssignableToTarget =
      rawSourceAssignableToTarget && !targetHasOnlyOptionalProperty;
    const isTargetAssignableToSource =
      rawTargetAssignableToSource && !sourceHasOnlyOptionalProperty;

    if (isSourceAssignableToTarget && isTargetAssignableToSource) {
      return TypeAssignability.Equal;
    }

    if (isSourceAssignableToTarget) {
      return TypeAssignability.SourceToTargetAssignable;
    }

    if (isTargetAssignableToSource) {
      return TypeAssignability.TargetToSourceAssignable;
    }

    return TypeAssignability.NotAssignable;
  }
  return checkTypeAssignability(sourceType, targetType, checker);
}

function mergeTypeNames(
  typeWithNames: TypeWithName[],
  operator: '&' | '|',
): string {
  if (typeWithNames.length === 1) {
    return typeWithNames[0].typeName;
  }

  const wrapType = (typeWithName: TypeWithName) => {
    if (operator === '|' && typeWithName.type.isIntersection()) {
      return `(${typeWithName.typeName})`;
    }
    if (operator === '&' && typeWithName.type.isUnion()) {
      return `(${typeWithName.typeName})`;
    }
    return typeWithName.typeName;
  };

  return typeWithNames.map(wrapType).join(` ${operator} `);
}

function getTypeNodeFromReferenceType(type: ts.Type): ts.Node | undefined {
  const symbol = type.getSymbol() ?? type.aliasSymbol;
  const declaration = symbol?.getDeclarations()?.[0];

  if (declaration) {
    if (ts.isTypeAliasDeclaration(declaration)) {
      return declaration.type;
    }
    return declaration;
  }
  return;
}

function getGroupTypeRelationsBySuperTypeName(typeRelations: TypeRelation[]) {
  return arrayGroupByToMap(
    typeRelations,
    ({ superTypeWithName }) => superTypeWithName.typeName,
  );
}

function hasTargetOnlyOptionalProps(
  sourceType: ts.ObjectType,
  targetType: ts.ObjectType,
  checker: ts.TypeChecker,
) {
  const targetProps = targetType.getProperties();
  for (const targetProp of targetProps) {
    const sourceProp = checker.getPropertyOfType(
      sourceType,
      targetProp.getName(),
    );

    if (!sourceProp) {
      if (targetProp.flags & ts.SymbolFlags.Optional) {
        return true;
      }
      continue;
    }
    const sourcePropertyType = checker.getTypeOfSymbol(sourceProp);
    const targetPropertyType = checker.getTypeOfSymbol(targetProp);
    if (
      tsutils.isObjectType(sourcePropertyType) &&
      tsutils.isObjectType(targetPropertyType)
    ) {
      const res = hasTargetOnlyOptionalProps(
        sourcePropertyType,
        targetPropertyType,
        checker,
      );
      if (res) {
        return true;
      }
    }
  }
  return false;
}

function hasSameKeys(
  type1: ts.Type,
  type2: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  if (tsutils.isUnionType(type1)) {
    return type1.types.some(typePart => hasSameKeys(typePart, type2, checker));
  }
  if (tsutils.isUnionType(type2)) {
    return type2.types.some(typePart => hasSameKeys(type1, typePart, checker));
  }

  const propertiesOfType1 = type1.getProperties();
  const propertiesOfType2 = type2.getProperties();

  if (propertiesOfType1.length !== propertiesOfType2.length) {
    return false;
  }
  if (propertiesOfType1.length === 0) {
    return true;
  }
  for (const propertyOfType1 of propertiesOfType1) {
    const propertyOfType2 = propertiesOfType2.find(
      p => p.getName() === propertyOfType1.getName(),
    );

    if (!propertyOfType2) {
      return false;
    }
    const valueOfType1 = propertyOfType1.valueDeclaration;
    const valueOfType2 = propertyOfType2.valueDeclaration;

    if (
      valueOfType1 &&
      ts.isPropertySignature(valueOfType1) &&
      valueOfType1.type &&
      valueOfType2 &&
      ts.isPropertySignature(valueOfType2) &&
      valueOfType2.type
    ) {
      const isType1TypeLiteral = ts.isTypeLiteralNode(valueOfType1.type);
      const isType2TypeLiteral = ts.isTypeLiteralNode(valueOfType2.type);

      if (isType1TypeLiteral !== isType2TypeLiteral) {
        return false;
      }

      if (isType1TypeLiteral) {
        return hasSameKeys(
          checker.getTypeAtLocation(valueOfType1.type),
          checker.getTypeAtLocation(valueOfType2.type),
          checker,
        );
      }
    }
  }
  return true;
}

export default createRule({
  name: 'no-redundant-type-constituents',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow members of unions and intersections that do nothing or override type information',
      recommended: 'recommended',
      requiresTypeChecking: true,
    },
    messages: {
      errorTypeOverrides: `'{{typeName}}' is an 'error' type that acts as 'any' and overrides all other types in this {{container}} type.`,
      overridden: `'{{typeName}}' is overridden by other types in this {{container}} type.`,
      overrides: `'{{typeName}}' overrides all other types in this {{container}} type.`,
      typeOverridden: `{{redundantType}} is overridden by {{nonRedundantType}} in this {{container}} type.`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();

    function reportOverriddenTypes(
      overriddenObjectTypes: Map<TSESTree.TypeNode, TypeRelation[]>,
      container: 'intersection' | 'union',
    ) {
      for (const [typeNode, typeRelations] of overriddenObjectTypes) {
        const groupTypeRelationsBySuperTypeName =
          getGroupTypeRelationsBySuperTypeName(typeRelations);

        for (const [
          superTypeName,
          typeRelationAndNames,
        ] of groupTypeRelationsBySuperTypeName) {
          const mergedSubTypeName = mergeTypeNames(
            typeRelationAndNames.map(({ subTypeWithName }) => subTypeWithName),
            container === 'union' ? '|' : '&',
          );
          const redundantType =
            container === 'union' ? mergedSubTypeName : superTypeName;
          const nonRedundantType =
            container === 'union' ? superTypeName : mergedSubTypeName;
          context.report({
            node: typeNode,
            messageId: 'typeOverridden',
            data: {
              container,
              nonRedundantType,
              redundantType,
            },
          });
        }
      }
    }

    function getObjectUnionTypePart(
      typeNode: ts.Node,
      checker: ts.TypeChecker,
    ): TypeWithName[] {
      if (ts.isParenthesizedTypeNode(typeNode)) {
        return getObjectUnionTypePart(typeNode.type, checker);
      }
      if (ts.isUnionTypeNode(typeNode)) {
        return typeNode.types.flatMap(typeNode =>
          getObjectUnionTypePart(typeNode, checker),
        );
      }
      const type = checker.getTypeAtLocation(typeNode);
      if (
        ts.isTypeReferenceNode(typeNode) &&
        tsutils.isUnionOrIntersectionType(type)
      ) {
        const node = getTypeNodeFromReferenceType(type);
        if (node && node !== typeNode) {
          return getObjectUnionTypePart(node, checker);
        }
      }
      return [
        {
          type,
          typeName: checker.typeToString(type),
        },
      ];
    }

    function getObjectInterSectionTypePart(
      typeNode: ts.Node,
      checker: ts.TypeChecker,
    ): TypeWithName[] {
      if (ts.isParenthesizedTypeNode(typeNode)) {
        return getObjectInterSectionTypePart(typeNode.type, checker);
      }

      if (ts.isIntersectionTypeNode(typeNode)) {
        return typeNode.types.flatMap(typeNode =>
          getObjectInterSectionTypePart(typeNode, checker),
        );
      }

      const type = checker.getTypeAtLocation(typeNode);
      if (
        ts.isTypeReferenceNode(typeNode) &&
        tsutils.isUnionOrIntersectionType(type)
      ) {
        const node = getTypeNodeFromReferenceType(type);
        if (node && node !== typeNode) {
          return getObjectInterSectionTypePart(node, checker);
        }
      }
      return [
        {
          type,
          typeName: checker.typeToString(type),
        },
      ];
    }
    return {
      'TSIntersectionType:exit'(node: TSESTree.TSIntersectionType): void {
        const seenObjectTypes = new Set<TypeWithNameAndParentNode>();
        const overriddenObjectTypes = new Map<
          TSESTree.TypeNode,
          TypeRelation[]
        >();

        function checkIntersectionBottomAndTopTypes(
          { typeFlags, typeName }: TypeFlagsWithName,
          typeNode: TSESTree.TypeNode,
        ): boolean {
          for (const [messageId, checkFlag] of [
            ['overrides', ts.TypeFlags.Any],
            ['overrides', ts.TypeFlags.Never],
            ['overridden', ts.TypeFlags.Unknown],
          ] as const) {
            if (typeFlags === checkFlag) {
              context.report({
                node: typeNode,
                messageId:
                  typeFlags === ts.TypeFlags.Any && typeName !== 'any'
                    ? 'errorTypeOverrides'
                    : messageId,
                data: {
                  container: 'intersection',
                  typeName,
                },
              });
              return true;
            }
          }

          return false;
        }

        for (const typeNode of node.types) {
          const tsTypeNode = services.esTreeNodeToTSNodeMap.get(typeNode);
          const objectTypeParts = getObjectInterSectionTypePart(
            tsTypeNode,
            checker,
          );

          for (const objectTypePart of objectTypeParts) {
            if (
              checkIntersectionBottomAndTopTypes(
                {
                  typeFlags: objectTypePart.type.flags,
                  typeName: objectTypePart.typeName,
                },
                typeNode,
              )
            ) {
              continue;
            }
            const { type: targetType, typeName: targetTypeName } =
              objectTypePart;

            for (const seenObjectType of seenObjectTypes) {
              const {
                type: sourceType,
                parentTypeNode,
                typeName: sourceTypeName,
              } = seenObjectType;
              const typeAssignability = checkIntersectionTypeAssignability(
                sourceType,
                targetType,
                checker,
              );
              switch (typeAssignability) {
                case TypeAssignability.SourceToTargetAssignable:
                  addToMapGroup(overriddenObjectTypes, typeNode, {
                    subTypeWithName: {
                      type: sourceType,
                      typeName: sourceTypeName,
                    },
                    superTypeWithName: {
                      type: targetType,
                      typeName: targetTypeName,
                    },
                  });
                  continue;
                case TypeAssignability.TargetToSourceAssignable:
                  addToMapGroup(overriddenObjectTypes, parentTypeNode, {
                    subTypeWithName: {
                      type: targetType,
                      typeName: targetTypeName,
                    },
                    superTypeWithName: {
                      type: sourceType,
                      typeName: sourceTypeName,
                    },
                  });
              }
            }
          }
          for (const objectTypePart of objectTypeParts) {
            if (
              objectTypePart.type.flags === ts.TypeFlags.Any ||
              objectTypePart.type.flags === ts.TypeFlags.Unknown ||
              objectTypePart.type.flags === ts.TypeFlags.Never
            ) {
              continue;
            }

            seenObjectTypes.add({
              ...objectTypePart,
              parentTypeNode: typeNode,
            });
          }
        }
        reportOverriddenTypes(overriddenObjectTypes, 'intersection');
      },
      'TSUnionType:exit'(node: TSESTree.TSUnionType): void {
        const seenObjectTypes = new Set<TypeWithNameAndParentNode>();
        const overriddenObjectTypes = new Map<
          TSESTree.TypeNode,
          TypeRelation[]
        >();

        function checkUnionBottomAndTopTypes(
          { typeFlags, typeName }: TypeFlagsWithName,
          typeNode: TSESTree.TypeNode,
        ): boolean {
          for (const checkFlag of [
            ts.TypeFlags.Any,
            ts.TypeFlags.Unknown,
          ] as const) {
            if (typeFlags === checkFlag) {
              context.report({
                node: typeNode,
                messageId:
                  typeFlags === ts.TypeFlags.Any && typeName !== 'any'
                    ? 'errorTypeOverrides'
                    : 'overrides',
                data: {
                  container: 'union',
                  typeName,
                },
              });
              return true;
            }
          }

          if (
            typeFlags === ts.TypeFlags.Never &&
            !isNodeInsideReturnType(node)
          ) {
            context.report({
              node: typeNode,
              messageId: 'overridden',
              data: {
                container: 'union',
                typeName: 'never',
              },
            });
            return true;
          }

          return false;
        }

        for (const typeNode of node.types) {
          const tsTypeNode = services.esTreeNodeToTSNodeMap.get(typeNode);
          const objectTypeParts = getObjectUnionTypePart(tsTypeNode, checker);
          for (const objectTypePart of objectTypeParts) {
            if (
              checkUnionBottomAndTopTypes(
                {
                  typeFlags: objectTypePart.type.flags,
                  typeName: objectTypePart.typeName,
                },
                typeNode,
              )
            ) {
              continue;
            }

            const { type: targetType, typeName: targetTypeName } =
              objectTypePart;
            for (const seenObjectType of seenObjectTypes) {
              const {
                type: sourceType,
                parentTypeNode,
                typeName: sourceTypeName,
              } = seenObjectType;
              if (!hasSameKeys(sourceType, targetType, checker)) {
                continue;
              }

              const typeAssignability = checkTypeAssignability(
                sourceType,
                targetType,
                checker,
              );

              switch (typeAssignability) {
                case TypeAssignability.SourceToTargetAssignable:
                  addToMapGroup(overriddenObjectTypes, parentTypeNode, {
                    subTypeWithName: {
                      type: sourceType,
                      typeName: sourceTypeName,
                    },
                    superTypeWithName: {
                      type: targetType,
                      typeName: targetTypeName,
                    },
                  });
                  continue;
                case TypeAssignability.TargetToSourceAssignable:
                  addToMapGroup(overriddenObjectTypes, typeNode, {
                    subTypeWithName: {
                      type: targetType,
                      typeName: targetTypeName,
                    },
                    superTypeWithName: {
                      type: sourceType,
                      typeName: sourceTypeName,
                    },
                  });
              }
            }
          }

          for (const objectTypePart of objectTypeParts) {
            if (
              objectTypePart.type.flags === ts.TypeFlags.Any ||
              objectTypePart.type.flags === ts.TypeFlags.Unknown ||
              objectTypePart.type.flags === ts.TypeFlags.Never
            ) {
              continue;
            }
            seenObjectTypes.add({
              ...objectTypePart,
              parentTypeNode: typeNode,
            });
          }
        }

        reportOverriddenTypes(overriddenObjectTypes, 'union');
      },
    };
  },
});
