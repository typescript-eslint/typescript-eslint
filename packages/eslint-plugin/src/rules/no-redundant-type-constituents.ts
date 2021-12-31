import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
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

type PrimitiveTypeFlag = typeof primitiveTypeFlags[number];

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

function describeLiteralType(type: ts.Type): unknown {
  return type.isStringLiteral()
    ? JSON.stringify(type.value)
    : type.isLiteral()
    ? type.value
    : util.isTypeTemplateLiteralType(type)
    ? 'template literal type'
    : util.isTypeBigIntLiteralType(type)
    ? `${type.value.negative ? '-' : ''}${type.value.base10Value}n`
    : tsutils.isBooleanLiteralType(type, true)
    ? 'true'
    : tsutils.isBooleanLiteralType(type, false)
    ? 'false'
    : 'literal type';
}

function isNodeInsideReturnType(node: TSESTree.TSUnionType): boolean {
  return !!(
    node.parent?.type === AST_NODE_TYPES.TSTypeAnnotation &&
    node.parent.parent &&
    util.isFunctionType(node.parent.parent)
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
      primitiveOverridden: `{{primitive}} is overridden by the literal {{literal}} in this intersection type.`,
      overridden: `'never' is overridden by other types in this {{container}} type.`,
      overrides: `'{{typeName}}' overrides all other types in this {{container}} type.`,
    },
    schema: [],
    type: 'suggestion',
  },
  defaultOptions: [],
  create(context) {
    return {
      TSIntersectionType(node): void {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const seenLiteralTypes = new Map<PrimitiveTypeFlag, string[]>();
        const seenPrimitiveTypes = new Map<
          PrimitiveTypeFlag,
          TSESTree.TypeNode[]
        >();

        function checkIntersectionBottomAndTopTypes(
          nodeType: ts.Type,
          typeNode: TSESTree.TypeNode,
        ): boolean {
          for (const [typeName, messageId, check] of [
            ['any', 'overrides', util.isTypeAnyType],
            ['never', 'overrides', util.isTypeNeverType],
            ['unknown', 'overridden', util.isTypeUnknownType],
          ] as const) {
            if (check(nodeType)) {
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
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(typeNode);
          const nodeType = checker.getTypeAtLocation(tsNode);
          const typeParts = tsutils.unionTypeParts(nodeType);

          for (const typePart of typeParts) {
            if (checkIntersectionBottomAndTopTypes(typePart, typeNode)) {
              continue;
            }

            for (const literalTypeFlag of literalTypeFlags) {
              if (typePart.flags === literalTypeFlag) {
                addToMapGroup(
                  seenLiteralTypes,
                  literalToPrimitiveTypeFlags[literalTypeFlag],
                  describeLiteralType(typePart),
                );
                break;
              }
            }

            for (const primitiveTypeFlag of primitiveTypeFlags) {
              if (typePart.flags === primitiveTypeFlag) {
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
      TSUnionType(node): void {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const seenLiteralTypes = new Map<
          PrimitiveTypeFlag,
          TypeNodeWithValue[]
        >();
        const seenPrimitiveTypes = new Set<PrimitiveTypeFlag>();

        function checkUnionBottomAndTopTypes(
          nodeType: ts.Type,
          typeNode: TSESTree.TypeNode,
        ): boolean {
          for (const [typeName, check] of [
            ['any', util.isTypeAnyType],
            ['unknown', util.isTypeUnknownType],
          ] as const) {
            if (check(nodeType)) {
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

          if (util.isTypeNeverType(nodeType) && !isNodeInsideReturnType(node)) {
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
          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(typeNode);
          const nodeType = checker.getTypeAtLocation(tsNode);
          const typeParts = unionTypePartsUnlessBoolean(nodeType);

          for (const typePart of typeParts) {
            if (checkUnionBottomAndTopTypes(typePart, typeNode)) {
              continue;
            }

            for (const literalTypeFlag of literalTypeFlags) {
              if (typePart.flags === literalTypeFlag) {
                addToMapGroup(
                  seenLiteralTypes,
                  literalToPrimitiveTypeFlags[literalTypeFlag],
                  {
                    literalValue: describeLiteralType(typePart),
                    typeNode,
                  },
                );
                break;
              }
            }

            for (const primitiveTypeFlag of primitiveTypeFlags) {
              if (tsutils.isTypeFlagSet(nodeType, primitiveTypeFlag)) {
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
