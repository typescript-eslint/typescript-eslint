import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  arrayGroupByToMap,
  createRule,
  getParserServices,
  isFunctionOrFunctionType,
  isTypeAnyType,
  isTypeBigIntLiteralType,
  isTypeNeverType,
  isTypeTemplateLiteralType,
  isTypeUnknownType,
} from '../util';

const literalToPrimitiveTypeFlags = {
  [ts.TypeFlags.BigIntLiteral]: ts.TypeFlags.BigInt,
  [ts.TypeFlags.BooleanLiteral]: ts.TypeFlags.Boolean,
  [ts.TypeFlags.NumberLiteral]: ts.TypeFlags.Number,
  [ts.TypeFlags.StringLiteral]: ts.TypeFlags.String,
  [ts.TypeFlags.TemplateLiteral]: ts.TypeFlags.String,
} as const;

const literalTypeFlags = [
  ts.TypeFlags.BigIntLiteral,
  ts.TypeFlags.BooleanLiteral,
  ts.TypeFlags.NumberLiteral,
  ts.TypeFlags.StringLiteral,
  ts.TypeFlags.TemplateLiteral,
] as const;

const primitiveTypeFlags = [
  ts.TypeFlags.BigInt,
  ts.TypeFlags.Boolean,
  ts.TypeFlags.Number,
  ts.TypeFlags.String,
] as const;

const primitiveTypeFlagNames = {
  [ts.TypeFlags.BigInt]: 'bigint',
  [ts.TypeFlags.Boolean]: 'boolean',
  [ts.TypeFlags.Number]: 'number',
  [ts.TypeFlags.String]: 'string',
} as const;

const primitiveTypeFlagTypes = {
  bigint: ts.TypeFlags.BigIntLiteral,
  boolean: ts.TypeFlags.BooleanLiteral,
  number: ts.TypeFlags.NumberLiteral,
  string: ts.TypeFlags.StringLiteral,
} as const;

const keywordNodeTypesToTsTypes = new Map([
  [TSESTree.AST_NODE_TYPES.TSAnyKeyword, ts.TypeFlags.Any],
  [TSESTree.AST_NODE_TYPES.TSBigIntKeyword, ts.TypeFlags.BigInt],
  [TSESTree.AST_NODE_TYPES.TSBooleanKeyword, ts.TypeFlags.Boolean],
  [TSESTree.AST_NODE_TYPES.TSNeverKeyword, ts.TypeFlags.Never],
  [TSESTree.AST_NODE_TYPES.TSNumberKeyword, ts.TypeFlags.Number],
  [TSESTree.AST_NODE_TYPES.TSStringKeyword, ts.TypeFlags.String],
  [TSESTree.AST_NODE_TYPES.TSUnknownKeyword, ts.TypeFlags.Unknown],
]);

type PrimitiveTypeFlag = (typeof primitiveTypeFlags)[number];

interface TypeFlagsWithName {
  typeFlags: ts.TypeFlags;
  typeName: string;
}

interface TypeNodeWithValue {
  literalValue: unknown;
  typeNode: TSESTree.TypeNode;
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

function describeLiteralType(type: ts.Type): string {
  if (type.isStringLiteral()) {
    return JSON.stringify(type.value);
  }

  if (isTypeBigIntLiteralType(type)) {
    return `${type.value.negative ? '-' : ''}${type.value.base10Value}n`;
  }

  if (type.isLiteral()) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return type.value.toString();
  }

  if (tsutils.isIntrinsicErrorType(type) && type.aliasSymbol) {
    return type.aliasSymbol.escapedName.toString();
  }

  if (isTypeAnyType(type)) {
    return 'any';
  }

  if (isTypeNeverType(type)) {
    return 'never';
  }

  if (isTypeUnknownType(type)) {
    return 'unknown';
  }

  if (isTypeTemplateLiteralType(type)) {
    return 'template literal type';
  }

  if (isTypeBigIntLiteralType(type)) {
    return `${type.value.negative ? '-' : ''}${type.value.base10Value}n`;
  }

  if (tsutils.isTrueLiteralType(type)) {
    return 'true';
  }

  if (tsutils.isFalseLiteralType(type)) {
    return 'false';
  }

  return 'literal type';
}

function describeLiteralTypeNode(typeNode: TSESTree.TypeNode): string {
  switch (typeNode.type) {
    case AST_NODE_TYPES.TSAnyKeyword:
      return 'any';
    case AST_NODE_TYPES.TSBooleanKeyword:
      return 'boolean';
    case AST_NODE_TYPES.TSNeverKeyword:
      return 'never';
    case AST_NODE_TYPES.TSNumberKeyword:
      return 'number';
    case AST_NODE_TYPES.TSStringKeyword:
      return 'string';
    case AST_NODE_TYPES.TSUnknownKeyword:
      return 'unknown';
    case AST_NODE_TYPES.TSLiteralType:
      switch (typeNode.literal.type) {
        case TSESTree.AST_NODE_TYPES.Literal:
          switch (typeof typeNode.literal.value) {
            case 'bigint':
              return `${typeNode.literal.value < 0 ? '-' : ''}${
                typeNode.literal.value
              }n`;
            case 'string':
              return JSON.stringify(typeNode.literal.value);
            default:
              return `${typeNode.literal.value}`;
          }
        case TSESTree.AST_NODE_TYPES.TemplateLiteral:
          return 'template literal type';
      }
  }

  return 'literal type';
}

function isNodeInsideReturnType(node: TSESTree.TSUnionType): boolean {
  return !!(
    node.parent.type === AST_NODE_TYPES.TSTypeAnnotation &&
    isFunctionOrFunctionType(node.parent.parent)
  );
}

/**
 * @remarks TypeScript stores boolean types as the union false | true, always.
 */
function unionTypePartsUnlessBoolean(type: ts.Type): ts.Type[] {
  return type.isUnion() &&
    type.types.length === 2 &&
    tsutils.isFalseLiteralType(type.types[0]) &&
    tsutils.isTrueLiteralType(type.types[1])
    ? [type]
    : tsutils.unionTypeParts(type);
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
  if (tsutils.isUnionType(sourceType)) {
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
  if (tsutils.isUnionType(targetType)) {
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
  // const typeRelationAndName = typeRelations.map(
  //   ({ subTypeWithName, superTypeWithName }) => {
  //     return {
  //       subTypeName: subType.getText(),
  //       subTypeNode: subType,
  //       superTypeName: superType.getText(),
  //       superTypeNode: subType,
  //     };
  //   },
  // );

  return arrayGroupByToMap(
    typeRelations,
    ({ superTypeWithName }) => superTypeWithName.typeName,
  );
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
      literalOverridden: `{{literal}} is overridden by {{primitive}} in this union type.`,
      objectOverridden: `{{subType}} is overridden by {{superType}} in this union type.`,
      overridden: `'{{typeName}}' is overridden by other types in this {{container}} type.`,
      overrides: `'{{typeName}}' overrides all other types in this {{container}} type.`,
      primitiveOverridden: `{{primitive}} is overridden by the {{literal}} in this intersection type.`,
      superObjectTypeOverridden: `{{superType}} is overridden by {{subType}} in this intersection type.`,
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const services = getParserServices(context);
    const checker = services.program.getTypeChecker();
    const typesCache = new Map<TSESTree.TypeNode, TypeFlagsWithName[]>();

    function getTypeNodeTypePartFlags(
      typeNode: TSESTree.TypeNode,
    ): TypeFlagsWithName[] {
      const keywordTypeFlags = keywordNodeTypesToTsTypes.get(typeNode.type);
      if (keywordTypeFlags) {
        return [
          {
            typeFlags: keywordTypeFlags,
            typeName: describeLiteralTypeNode(typeNode),
          },
        ];
      }

      if (
        typeNode.type === AST_NODE_TYPES.TSLiteralType &&
        typeNode.literal.type === AST_NODE_TYPES.Literal
      ) {
        return [
          {
            typeFlags:
              primitiveTypeFlagTypes[
                typeof typeNode.literal
                  .value as keyof typeof primitiveTypeFlagTypes
              ],
            typeName: describeLiteralTypeNode(typeNode),
          },
        ];
      }

      if (typeNode.type === AST_NODE_TYPES.TSUnionType) {
        return typeNode.types.flatMap(getTypeNodeTypePartFlags);
      }

      const nodeType = services.getTypeAtLocation(typeNode);
      const typeParts = unionTypePartsUnlessBoolean(nodeType);

      return typeParts.map(typePart => ({
        typeFlags: typePart.flags,
        typeName: describeLiteralType(typePart),
      }));
    }

    function getObjectUnionTypePart(
      typeNode: ts.Node,
      checker: ts.TypeChecker,
    ): TypeWithName[] {
      if (ts.isParenthesizedTypeNode(typeNode)) {
        return getObjectUnionTypePart(typeNode.type, checker);
      }

      if (
        ts.isTypeLiteralNode(typeNode) ||
        ts.isIntersectionTypeNode(typeNode)
      ) {
        const type = checker.getTypeFromTypeNode(typeNode);
        return [
          {
            type,
            typeName: checker.typeToString(type),
          },
        ];
      }
      if (ts.isUnionTypeNode(typeNode)) {
        return typeNode.types.flatMap(typeNode =>
          getObjectUnionTypePart(typeNode, checker),
        );
      }
      if (ts.isTypeReferenceNode(typeNode)) {
        const type = checker.getTypeFromTypeNode(typeNode);
        const node = getTypeNodeFromReferenceType(type);

        if (node && node !== typeNode) {
          return getObjectUnionTypePart(node, checker);
        }
      }
      return [];
    }

    function getObjectInterSectionTypePart(
      typeNode: ts.Node,
      checker: ts.TypeChecker,
    ): TypeWithName[] {
      if (ts.isParenthesizedTypeNode(typeNode)) {
        return getObjectInterSectionTypePart(typeNode.type, checker);
      }

      if (ts.isTypeLiteralNode(typeNode) || ts.isUnionTypeNode(typeNode)) {
        const type = checker.getTypeFromTypeNode(typeNode);
        return [
          {
            type,
            typeName: checker.typeToString(type),
          },
        ];
      }
      if (ts.isIntersectionTypeNode(typeNode)) {
        return typeNode.types.flatMap(typeNode =>
          getObjectInterSectionTypePart(typeNode, checker),
        );
      }

      if (ts.isTypeReferenceNode(typeNode)) {
        const type = checker.getTypeFromTypeNode(typeNode);
        const node = getTypeNodeFromReferenceType(type);
        if (node && node !== typeNode) {
          return getObjectInterSectionTypePart(node, checker);
        }
      }
      return [];
    }

    function getTypeNodeTypePartFlagsCached(
      typeNode: TSESTree.TypeNode,
    ): TypeFlagsWithName[] {
      const existing = typesCache.get(typeNode);
      if (existing) {
        return existing;
      }

      const created = getTypeNodeTypePartFlags(typeNode);
      typesCache.set(typeNode, created);
      return created;
    }

    return {
      'TSIntersectionType:exit'(node: TSESTree.TSIntersectionType): void {
        const seenLiteralTypes = new Map<PrimitiveTypeFlag, string[]>();
        const seenPrimitiveTypes = new Map<
          PrimitiveTypeFlag,
          TSESTree.TypeNode[]
        >();
        const seenUnionTypes = new Map<
          TSESTree.TypeNode,
          TypeFlagsWithName[]
        >();

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
          const typePartFlags = getTypeNodeTypePartFlagsCached(typeNode);

          for (const typePart of typePartFlags) {
            if (checkIntersectionBottomAndTopTypes(typePart, typeNode)) {
              continue;
            }

            for (const literalTypeFlag of literalTypeFlags) {
              if (typePart.typeFlags === literalTypeFlag) {
                addToMapGroup(
                  seenLiteralTypes,
                  literalToPrimitiveTypeFlags[literalTypeFlag],
                  typePart.typeName,
                );
                break;
              }
            }

            for (const primitiveTypeFlag of primitiveTypeFlags) {
              if (typePart.typeFlags === primitiveTypeFlag) {
                addToMapGroup(seenPrimitiveTypes, primitiveTypeFlag, typeNode);
              }
            }
          }
          // if any typeNode is TSTypeReference and typePartFlags have more than 1 element, than the referenced type is definitely a union.
          if (typePartFlags.length >= 2) {
            seenUnionTypes.set(typeNode, typePartFlags);
          }

          const tsTypeNode = services.esTreeNodeToTSNodeMap.get(typeNode);
          const objectTypeParts = getObjectInterSectionTypePart(
            tsTypeNode,
            checker,
          );

          for (const objectTypePart of objectTypeParts) {
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
            seenObjectTypes.add({
              ...objectTypePart,
              parentTypeNode: typeNode,
            });
          }
        }
        /**
         * @example
         * ```ts
         * type F = "a"|2|"b";
         * type I = F & string;
         * ```
         * This function checks if all the union members of `F` are assignable to the other member of `I`. If every member is assignable, then its reported else not.
         */
        const checkIfUnionsAreAssignable = (): undefined => {
          for (const [typeRef, typeValues] of seenUnionTypes) {
            let primitive: number | undefined = undefined;
            for (const { typeFlags } of typeValues) {
              if (
                seenPrimitiveTypes.has(
                  literalToPrimitiveTypeFlags[
                    typeFlags as keyof typeof literalToPrimitiveTypeFlags
                  ],
                )
              ) {
                primitive =
                  literalToPrimitiveTypeFlags[
                    typeFlags as keyof typeof literalToPrimitiveTypeFlags
                  ];
              } else {
                primitive = undefined;
                break;
              }
            }
            if (Number.isInteger(primitive)) {
              context.report({
                node: typeRef,
                messageId: 'primitiveOverridden',
                data: {
                  literal: typeValues.map(name => name.typeName).join(' | '),
                  primitive:
                    primitiveTypeFlagNames[
                      primitive as keyof typeof primitiveTypeFlagNames
                    ],
                },
              });
            }
          }
        };
        if (seenUnionTypes.size > 0) {
          checkIfUnionsAreAssignable();
        } else {
          // For each primitive type of all the seen primitive types,
          // if there was a literal type seen that overrides it,
          // report each of the primitive type's type nodes
          for (const [primitiveTypeFlag, typeNodes] of seenPrimitiveTypes) {
            const matchedLiteralTypes = seenLiteralTypes.get(primitiveTypeFlag);
            if (matchedLiteralTypes) {
              for (const typeNode of typeNodes) {
                context.report({
                  node: typeNode,
                  messageId: 'primitiveOverridden',
                  data: {
                    literal: matchedLiteralTypes.join(' & '),
                    primitive: primitiveTypeFlagNames[primitiveTypeFlag],
                  },
                });
              }
            }
          }
        }

        for (const [typeNode, typeRelations] of overriddenObjectTypes) {
          const groupTypeRelationsBySuperTypeName =
            getGroupTypeRelationsBySuperTypeName(typeRelations);

          for (const [
            superTypeName,
            typeRelationAndNames,
          ] of groupTypeRelationsBySuperTypeName) {
            const mergedSubTypeName = mergeTypeNames(
              typeRelationAndNames.map(
                ({ subTypeWithName }) => subTypeWithName,
              ),
              '&',
            );

            context.report({
              node: typeNode,
              messageId: 'superObjectTypeOverridden',
              data: {
                subType: mergedSubTypeName,
                superType: superTypeName,
              },
            });
          }
        }
      },
      'TSUnionType:exit'(node: TSESTree.TSUnionType): void {
        const seenLiteralTypes = new Map<
          PrimitiveTypeFlag,
          TypeNodeWithValue[]
        >();
        const seenPrimitiveTypes = new Set<PrimitiveTypeFlag>();

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
          const typePartFlags = getTypeNodeTypePartFlagsCached(typeNode);

          for (const typePart of typePartFlags) {
            if (checkUnionBottomAndTopTypes(typePart, typeNode)) {
              continue;
            }

            for (const literalTypeFlag of literalTypeFlags) {
              if (typePart.typeFlags === literalTypeFlag) {
                addToMapGroup(
                  seenLiteralTypes,
                  literalToPrimitiveTypeFlags[literalTypeFlag],
                  {
                    literalValue: typePart.typeName,
                    typeNode,
                  },
                );
                break;
              }
            }

            for (const primitiveTypeFlag of primitiveTypeFlags) {
              if ((typePart.typeFlags & primitiveTypeFlag) !== 0) {
                seenPrimitiveTypes.add(primitiveTypeFlag);
              }
            }
          }

          const tsTypeNode = services.esTreeNodeToTSNodeMap.get(typeNode);
          const objectTypeParts = getObjectUnionTypePart(tsTypeNode, checker);

          for (const objectTypePart of objectTypeParts) {
            const { type: targetType, typeName: targetTypeName } =
              objectTypePart;

            for (const seenObjectType of seenObjectTypes) {
              const {
                type: sourceType,
                parentTypeNode,
                typeName: sourceTypeName,
              } = seenObjectType;
              if (!hasSameKeys(sourceType, targetType, checker)) {
                break;
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
            seenObjectTypes.add({
              ...objectTypePart,
              parentTypeNode: typeNode,
            });
          }
        }

        interface TypeFlagWithText {
          literalValue: unknown;
          primitiveTypeFlag: PrimitiveTypeFlag;
        }

        const overriddenTypeNodes = new Map<
          TSESTree.TypeNode,
          TypeFlagWithText[]
        >();

        // For each primitive type of all the seen literal types,
        // if there was a primitive type seen that overrides it,
        // upsert the literal text and primitive type under the backing type node
        for (const [primitiveTypeFlag, typeNodesWithText] of seenLiteralTypes) {
          if (seenPrimitiveTypes.has(primitiveTypeFlag)) {
            for (const { literalValue, typeNode } of typeNodesWithText) {
              addToMapGroup(overriddenTypeNodes, typeNode, {
                literalValue,
                primitiveTypeFlag,
              });
            }
          }
        }

        // For each type node that had at least one overridden literal,
        // group those literals by their primitive type,
        // then report each primitive type with all its literals
        for (const [typeNode, typeFlagsWithText] of overriddenTypeNodes) {
          const grouped = arrayGroupByToMap(
            typeFlagsWithText,
            pair => pair.primitiveTypeFlag,
          );

          for (const [primitiveTypeFlag, pairs] of grouped) {
            context.report({
              node: typeNode,
              messageId: 'literalOverridden',
              data: {
                literal: pairs.map(pair => pair.literalValue).join(' | '),
                primitive: primitiveTypeFlagNames[primitiveTypeFlag],
              },
            });
          }
        }

        for (const [typeNode, typeRelations] of overriddenObjectTypes) {
          const groupTypeRelationsBySuperTypeName =
            getGroupTypeRelationsBySuperTypeName(typeRelations);

          for (const [
            superTypeName,
            typeRelationAndNames,
          ] of groupTypeRelationsBySuperTypeName) {
            const mergedSubTypeName = mergeTypeNames(
              typeRelationAndNames.map(
                ({ subTypeWithName }) => subTypeWithName,
              ),
              '|',
            );

            context.report({
              node: typeNode,
              messageId: 'objectOverridden',
              data: {
                subType: mergedSubTypeName,
                superType: superTypeName,
              },
            });
          }
        }
      },
    };
  },
});
