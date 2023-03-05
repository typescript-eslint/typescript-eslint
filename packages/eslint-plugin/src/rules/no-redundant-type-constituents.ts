import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

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
  [TSESTree.AST_NODE_TYPES.TSUnknownKeyword, ts.TypeFlags.Unknown],
  [TSESTree.AST_NODE_TYPES.TSNumberKeyword, ts.TypeFlags.Number],
  [TSESTree.AST_NODE_TYPES.TSStringKeyword, ts.TypeFlags.String],
]);

type PrimitiveTypeFlag = typeof primitiveTypeFlags[number];

interface TypeFlagsWithName {
  typeFlags: ts.TypeFlags;
  typeName: string;
}

interface TypeNodeWithValue {
  literalValue: unknown;
  typeNode: TSESTree.TypeNode;
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

  if (type.isLiteral()) {
    if (typeof type.value === 'object') {
      // Print ts.PseudoBigInt
      return `${
        type.value.negative ? '-' : ''
      }${type.value.base10Value.toString()}n`;
    }
    return type.value.toString();
  }

  if (util.isTypeAnyType(type)) {
    return 'any';
  }

  if (util.isTypeNeverType(type)) {
    return 'never';
  }

  if (util.isTypeUnknownType(type)) {
    return 'unknown';
  }

  if (util.isTypeTemplateLiteralType(type)) {
    return 'template literal type';
  }

  if (util.isTypeBigIntLiteralType(type)) {
    return `${type.value.negative ? '-' : ''}${type.value.base10Value}n`;
  }

  if (tsutils.isBooleanLiteralType(type, true)) {
    return 'true';
  }

  if (tsutils.isBooleanLiteralType(type, false)) {
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
    node.parent?.type === AST_NODE_TYPES.TSTypeAnnotation &&
    node.parent.parent &&
    (util.isFunctionType(node.parent.parent) ||
      util.isFunction(node.parent.parent))
  );
}

/**
 * @remarks TypeScript stores boolean types as the union false | true, always.
 */
function unionTypePartsUnlessBoolean(type: ts.Type): ts.Type[] {
  return type.isUnion() &&
    type.types.length === 2 &&
    tsutils.isBooleanLiteralType(type.types[0], false) &&
    tsutils.isBooleanLiteralType(type.types[1], true)
    ? [type]
    : tsutils.unionTypeParts(type);
}

export default util.createRule({
  name: 'no-redundant-type-constituents',
  meta: {
    docs: {
      description:
        'Disallow members of unions and intersections that do nothing or override type information',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      literalOverridden: `{{literal}} is overridden by {{primitive}} in this union type.`,
      primitiveOverridden: `{{primitive}} is overridden by the {{literal}} in this intersection type.`,
      overridden: `'{{typeName}}' is overridden by other types in this {{container}} type.`,
      overrides: `'{{typeName}}' overrides all other types in this {{container}} type.`,
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    const parserServices = util.getParserServices(context);
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

      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(typeNode);
      const checker = parserServices.program.getTypeChecker();
      const nodeType = checker.getTypeAtLocation(tsNode);
      const typeParts = unionTypePartsUnlessBoolean(nodeType);

      return typeParts.map(typePart => ({
        typeFlags: typePart.flags,
        typeName: describeLiteralType(typePart),
      }));
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
                data: {
                  container: 'intersection',
                  typeName,
                },
                messageId,
                node: typeNode,
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
        }

        // For each primitive type of all the seen primitive types,
        // if there was a literal type seen that overrides it,
        // report each of the primitive type's type nodes
        for (const [primitiveTypeFlag, typeNodes] of seenPrimitiveTypes) {
          const matchedLiteralTypes = seenLiteralTypes.get(primitiveTypeFlag);
          if (matchedLiteralTypes) {
            for (const typeNode of typeNodes) {
              context.report({
                data: {
                  literal: matchedLiteralTypes.join(' | '),
                  primitive: primitiveTypeFlagNames[primitiveTypeFlag],
                },
                messageId: 'primitiveOverridden',
                node: typeNode,
              });
            }
          }
        }
      },
      'TSUnionType:exit'(node: TSESTree.TSUnionType): void {
        const seenLiteralTypes = new Map<
          PrimitiveTypeFlag,
          TypeNodeWithValue[]
        >();
        const seenPrimitiveTypes = new Set<PrimitiveTypeFlag>();

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
                data: {
                  container: 'union',
                  typeName,
                },
                messageId: 'overrides',
                node: typeNode,
              });
              return true;
            }
          }

          if (
            typeFlags === ts.TypeFlags.Never &&
            !isNodeInsideReturnType(node)
          ) {
            context.report({
              data: {
                container: 'union',
                typeName: 'never',
              },
              messageId: 'overridden',
              node: typeNode,
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
          const grouped = util.arrayGroupByToMap(
            typeFlagsWithText,
            pair => pair.primitiveTypeFlag,
          );

          for (const [primitiveTypeFlag, pairs] of grouped) {
            context.report({
              data: {
                literal: pairs.map(pair => pair.literalValue).join(' | '),
                primitive: primitiveTypeFlagNames[primitiveTypeFlag],
              },
              messageId: 'literalOverridden',
              node: typeNode,
            });
          }
        }
      },
    };
  },
});
