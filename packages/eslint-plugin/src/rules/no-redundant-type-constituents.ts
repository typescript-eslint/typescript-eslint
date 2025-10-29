import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
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

interface TypeRedundancyRelation {
  redundantTypeWithName: TypeWithName;
  nonRedundantTypeWithName: TypeWithName;
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

function isUnionNodeInsideReturnType(node: TSESTree.TSUnionType): boolean {
  if (node.parent.type === AST_NODE_TYPES.TSUnionType) {
    return isUnionNodeInsideReturnType(node.parent);
  }
  return (
    node.parent.type === AST_NODE_TYPES.TSTypeAnnotation &&
    isFunctionOrFunctionType(node.parent.parent)
  );
}

function isObjectOrIntersectionType(
  type: ts.Type,
): type is ts.IntersectionType | ts.ObjectType {
  return tsutils.isObjectType(type) || tsutils.isIntersectionType(type);
}

function shouldCheckTypeRedundancy(
  type: ts.Type,
  checker: ts.TypeChecker,
  depth = 0,
): boolean {
  if (depth > 10) {
    return false;
  }
  if (tsutils.isObjectType(type)) {
    const symbol = type.getSymbol();
    if (!symbol) {
      return false;
    }
    const declarations = symbol.getDeclarations();
    const declaration = declarations?.[0];
    if (!declaration) {
      return false;
    }
    if (
      declaration.kind !== ts.SyntaxKind.TypeLiteral &&
      declaration.kind !== ts.SyntaxKind.InterfaceDeclaration &&
      declaration.kind !== ts.SyntaxKind.MappedType
    ) {
      return false;
    }
  }
  if (isObjectOrIntersectionType(type)) {
    const props = type.getProperties();
    for (const prop of props) {
      const type = checker.getTypeOfSymbol(prop);
      if (!shouldCheckTypeRedundancy(type, checker, depth + 1)) {
        return false;
      }
    }
    return true;
  }
  if (tsutils.isUnionType(type)) {
    return type.types.every(typePart =>
      shouldCheckTypeRedundancy(typePart, checker, depth),
    );
  }
  return true;
}

function isTargetTypeRedundantInIntersection(
  sourceType: ts.Type,
  targetType: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  if (tsutils.isUnionType(sourceType)) {
    for (const typePart of sourceType.types) {
      if (!tsutils.isObjectType(typePart)) {
        continue;
      }
      const isRedundant = isTargetTypeRedundantInIntersection(
        typePart,
        targetType,
        checker,
      );
      if (!isRedundant) {
        return false;
      }
    }
    return checker.isTypeAssignableTo(sourceType, targetType);
  }

  if (
    tsutils.isUnionType(targetType) &&
    !tsutils.isIntrinsicBooleanType(targetType)
  ) {
    for (const typePart of targetType.types) {
      if (!tsutils.isObjectType(typePart)) {
        continue;
      }
      const isRedundant = isTargetTypeRedundantInIntersection(
        sourceType,
        typePart,
        checker,
      );
      if (!isRedundant) {
        return false;
      }
    }
    return checker.isTypeAssignableTo(sourceType, targetType);
  }
  if (tsutils.isObjectType(sourceType) && tsutils.isObjectType(targetType)) {
    if (
      !shouldCheckTypeRedundancy(sourceType, checker) ||
      !shouldCheckTypeRedundancy(targetType, checker)
    ) {
      return false;
    }
    const sourceProps = sourceType.getProperties();
    const targetProps = targetType.getProperties();
    if (targetProps.length === 0) {
      return false;
    }

    for (const targetProp of targetProps) {
      const sourceProp = sourceProps.find(
        prop => prop.getName() === targetProp.getName(),
      );

      if (!sourceProp) {
        return false;
      }

      const sourcePropType = checker.getTypeOfSymbol(sourceProp);
      if (!shouldCheckTypeRedundancy(sourcePropType, checker)) {
        return false;
      }
      const targetPropType = checker.getTypeOfSymbol(targetProp);
      if (!shouldCheckTypeRedundancy(targetPropType, checker)) {
        return false;
      }
      const targetPropTypeIsRedundant = isTargetTypeRedundantInIntersection(
        sourcePropType,
        targetPropType,
        checker,
      );
      if (!targetPropTypeIsRedundant) {
        return false;
      }
    }
    return true;
  }
  return checker.isTypeAssignableTo(sourceType, targetType);
}

function isTargetTypeRedundantInUnion(
  sourceType: ts.Type,
  targetType: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  if (
    tsutils.isUnionType(targetType) &&
    !tsutils.isIntrinsicBooleanType(targetType)
  ) {
    for (const typePart of targetType.types) {
      const isRedundant = isTargetTypeRedundantInUnion(
        sourceType,
        typePart,
        checker,
      );
      if (!isRedundant) {
        return false;
      }
    }
    return true;
  }
  if (tsutils.isUnionType(sourceType)) {
    for (const typePart of sourceType.types) {
      const isRedundant = isTargetTypeRedundantInUnion(
        typePart,
        targetType,
        checker,
      );
      if (isRedundant) {
        return true;
      }
    }
    return false;
  }
  if (
    isObjectOrIntersectionType(sourceType) &&
    isObjectOrIntersectionType(targetType)
  ) {
    const sourceProps = sourceType.getProperties();
    const targetProps = targetType.getProperties();

    if (sourceProps.length !== targetProps.length) {
      return false;
    }
    if (targetProps.length === 0) {
      return false;
    }

    for (const targetProp of targetProps) {
      const sourceProp = sourceProps.find(
        prop => prop.getName() === targetProp.getName(),
      );

      if (!sourceProp) {
        return false;
      }

      const sourcePropType = checker.getTypeOfSymbol(sourceProp);
      if (!shouldCheckTypeRedundancy(sourcePropType, checker)) {
        return false;
      }
      const targetPropType = checker.getTypeOfSymbol(targetProp);
      if (!shouldCheckTypeRedundancy(targetPropType, checker)) {
        return false;
      }
      const targetPropTypeIsRedundant = isTargetTypeRedundantInUnion(
        sourcePropType,
        targetPropType,
        checker,
      );
      if (!targetPropTypeIsRedundant) {
        return false;
      }
    }
    return true;
  }
  return checker.isTypeAssignableTo(targetType, sourceType);
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

function getGroupTypeRelationsByNonRedundantType(
  typeRedundancyRelations: TypeRedundancyRelation[],
) {
  const groups = new Map<ts.Type, TypeRedundancyRelation[]>();

  for (const typeRedundancyRelation of typeRedundancyRelations) {
    addToMapGroup(
      groups,
      typeRedundancyRelation.nonRedundantTypeWithName.type,
      typeRedundancyRelation,
    );
  }
  return groups;
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

    function reportRedundantTypes(
      redundantTypes: Map<TSESTree.TypeNode, TypeRedundancyRelation[]>,
      container: 'intersection' | 'union',
    ) {
      for (const [typeNode, typeRelations] of redundantTypes) {
        const groupTypeRelationsByNonRedundantType =
          getGroupTypeRelationsByNonRedundantType(typeRelations);

        for (const [
          nonRedundantType,
          typeRelationAndNames,
        ] of groupTypeRelationsByNonRedundantType) {
          const nonRedundantTypeName = checker.typeToString(nonRedundantType);
          const mergedRedundantTypeName = mergeTypeNames(
            typeRelationAndNames.map(
              ({ redundantTypeWithName }) => redundantTypeWithName,
            ),
            container === 'union' ? '|' : '&',
          );

          context.report({
            node: typeNode,
            messageId: 'typeOverridden',
            data: {
              container,
              nonRedundantType: nonRedundantTypeName,
              redundantType: mergedRedundantTypeName,
            },
          });
        }
      }
    }

    function getUnionTypePart(
      typeNode: ts.Node,
      checker: ts.TypeChecker,
    ): TypeWithName[] {
      if (ts.isParenthesizedTypeNode(typeNode)) {
        return getUnionTypePart(typeNode.type, checker);
      }
      if (ts.isUnionTypeNode(typeNode)) {
        return typeNode.types.flatMap(typeNode =>
          getUnionTypePart(typeNode, checker),
        );
      }
      const type = checker.getTypeAtLocation(typeNode);

      if (!shouldCheckTypeRedundancy(type, checker)) {
        return [];
      }

      if (
        ts.isTypeReferenceNode(typeNode) &&
        tsutils.isUnionOrIntersectionType(type)
      ) {
        const node = getTypeNodeFromReferenceType(type);
        if (node && node !== typeNode) {
          return getUnionTypePart(node, checker);
        }
      }
      return [
        {
          type,
          typeName: checker.typeToString(type),
        },
      ];
    }

    function getIntersectionTypePart(
      typeNode: ts.Node,
      checker: ts.TypeChecker,
    ): TypeWithName[] {
      if (ts.isParenthesizedTypeNode(typeNode)) {
        return getIntersectionTypePart(typeNode.type, checker);
      }

      if (ts.isIntersectionTypeNode(typeNode)) {
        return typeNode.types.flatMap(typeNode =>
          getIntersectionTypePart(typeNode, checker),
        );
      }

      const type = checker.getTypeAtLocation(typeNode);

      if (!shouldCheckTypeRedundancy(type, checker)) {
        return [];
      }

      if (
        ts.isTypeReferenceNode(typeNode) &&
        tsutils.isUnionOrIntersectionType(type)
      ) {
        const node = getTypeNodeFromReferenceType(type);
        if (node && node !== typeNode) {
          return getIntersectionTypePart(node, checker);
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
      TSIntersectionType(node: TSESTree.TSIntersectionType): void {
        const seenTypes = new Set<TypeWithNameAndParentNode>();
        const redundantTypes = new Map<
          TSESTree.TypeNode,
          TypeRedundancyRelation[]
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
          const typeParts = getIntersectionTypePart(tsTypeNode, checker);

          for (const typePart of typeParts) {
            if (
              typePart.type.flags & ts.TypeFlags.Never ||
              typePart.type.flags & ts.TypeFlags.Any ||
              typePart.type.flags & ts.TypeFlags.Unknown
            ) {
              checkIntersectionBottomAndTopTypes(
                {
                  typeFlags: typePart.type.flags,
                  typeName: typePart.typeName,
                },
                typeNode,
              );
              continue;
            }
            const { type: targetType, typeName: targetTypeName } = typePart;

            for (const seenType of seenTypes) {
              const {
                type: sourceType,
                parentTypeNode,
                typeName: sourceTypeName,
              } = seenType;
              const targetTypeIsRedundant = isTargetTypeRedundantInIntersection(
                sourceType,
                targetType,
                checker,
              );
              const sourceTypeIsRedundant = isTargetTypeRedundantInIntersection(
                targetType,
                sourceType,
                checker,
              );
              if (
                targetTypeIsRedundant &&
                targetTypeIsRedundant === sourceTypeIsRedundant
              ) {
                continue;
              }
              if (sourceTypeIsRedundant) {
                addToMapGroup(redundantTypes, parentTypeNode, {
                  nonRedundantTypeWithName: {
                    type: targetType,
                    typeName: targetTypeName,
                  },
                  redundantTypeWithName: {
                    type: sourceType,
                    typeName: sourceTypeName,
                  },
                });
              }
              if (targetTypeIsRedundant) {
                addToMapGroup(redundantTypes, typeNode, {
                  nonRedundantTypeWithName: {
                    type: sourceType,
                    typeName: sourceTypeName,
                  },
                  redundantTypeWithName: {
                    type: targetType,
                    typeName: targetTypeName,
                  },
                });
              }
            }
          }
          for (const typePart of typeParts) {
            if (
              typePart.type.flags === ts.TypeFlags.Any ||
              typePart.type.flags === ts.TypeFlags.Unknown ||
              typePart.type.flags === ts.TypeFlags.Never
            ) {
              continue;
            }

            seenTypes.add({
              ...typePart,
              parentTypeNode: typeNode,
            });
          }
        }
        reportRedundantTypes(redundantTypes, 'intersection');
      },
      TSUnionType(node: TSESTree.TSUnionType): void {
        const seenTypes = new Set<TypeWithNameAndParentNode>();
        const redundantTypes = new Map<
          TSESTree.TypeNode,
          TypeRedundancyRelation[]
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
            !isUnionNodeInsideReturnType(node)
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
          const typeParts = getUnionTypePart(tsTypeNode, checker);
          for (const typePart of typeParts) {
            if (
              typePart.type.flags & ts.TypeFlags.Never ||
              typePart.type.flags & ts.TypeFlags.Any ||
              typePart.type.flags & ts.TypeFlags.Unknown
            ) {
              checkUnionBottomAndTopTypes(
                {
                  typeFlags: typePart.type.flags,
                  typeName: typePart.typeName,
                },
                typeNode,
              );
              continue;
            }

            const { type: targetType, typeName: targetTypeName } = typePart;
            for (const seenType of seenTypes) {
              const {
                type: sourceType,
                parentTypeNode,
                typeName: sourceTypeName,
              } = seenType;
              const targetTypeIsRedundant = isTargetTypeRedundantInUnion(
                sourceType,
                targetType,
                checker,
              );
              const sourceTypeIsRedundant = isTargetTypeRedundantInUnion(
                targetType,
                sourceType,
                checker,
              );
              if (
                targetTypeIsRedundant &&
                targetTypeIsRedundant === sourceTypeIsRedundant
              ) {
                continue;
              }
              if (sourceTypeIsRedundant) {
                addToMapGroup(redundantTypes, parentTypeNode, {
                  nonRedundantTypeWithName: {
                    type: targetType,
                    typeName: targetTypeName,
                  },
                  redundantTypeWithName: {
                    type: sourceType,
                    typeName: sourceTypeName,
                  },
                });
              }
              if (targetTypeIsRedundant) {
                addToMapGroup(redundantTypes, typeNode, {
                  nonRedundantTypeWithName: {
                    type: sourceType,
                    typeName: sourceTypeName,
                  },
                  redundantTypeWithName: {
                    type: targetType,
                    typeName: targetTypeName,
                  },
                });
              }
            }
          }

          for (const typePart of typeParts) {
            if (
              typePart.type.flags === ts.TypeFlags.Any ||
              typePart.type.flags === ts.TypeFlags.Unknown ||
              typePart.type.flags === ts.TypeFlags.Never
            ) {
              continue;
            }
            seenTypes.add({
              ...typePart,
              parentTypeNode: typeNode,
            });
          }
        }

        reportRedundantTypes(redundantTypes, 'union');
      },
    };
  },
});
