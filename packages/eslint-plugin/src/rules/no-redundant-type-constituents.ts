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
  return (
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
    : tsutils.unionConstituents(type);
}

/**
 * Types that are deliberately broad or branded (`{}`, `object`, empty
 * interfaces, `string & {}`), and callable or constructable types, whose
 * signatures are not compared, are never treated as redundant or as overriding.
 */
function isIgnoredByAssignability(
  type: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  return (
    tsutils.isTypeFlagSet(
      type,
      ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never,
    ) ||
    (type.isUnionOrIntersection() ? type.types : [type]).some(
      part =>
        tsutils.isTypeFlagSet(part, ts.TypeFlags.NonPrimitive) ||
        (tsutils.isObjectType(part) &&
          (checker.getSignaturesOfType(part, ts.SignatureKind.Call).length >
            0 ||
            checker.getSignaturesOfType(part, ts.SignatureKind.Construct)
              .length > 0 ||
            (part.getProperties().length === 0 &&
              checker.getIndexInfosOfType(part).length === 0))),
    )
  );
}

/**
 * Removing an object type is only safe if the other one accepts the same
 * property names, optionality, and index signatures. Otherwise excess property
 * checks and the allowed keys change.
 */
function haveSameObjectShape(
  a: ts.Type,
  b: ts.Type,
  checker: ts.TypeChecker,
): boolean {
  const aProps = a.getProperties();
  return (
    aProps.length === b.getProperties().length &&
    checker.getIndexInfosOfType(a).length ===
      checker.getIndexInfosOfType(b).length &&
    aProps.every(aProp => {
      const bProp = b.getProperty(aProp.name);
      return (
        bProp &&
        tsutils.isSymbolFlagSet(aProp, ts.SymbolFlags.Optional) ===
          tsutils.isSymbolFlagSet(bProp, ts.SymbolFlags.Optional)
      );
    })
  );
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
      overridden: `'{{typeName}}' is overridden by other types in this {{container}} type.`,
      overrides: `'{{typeName}}' overrides all other types in this {{container}} type.`,
      primitiveOverridden: `{{primitive}} is overridden by the {{literal}} in this intersection type.`,
    },
    schema: [],
  },
  // eslint-disable-next-line @typescript-eslint/no-deprecated -- For compatibility with ESLint 8, see #12842
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

    /**
     * Reports object types that are assignable to (in a union) or from
     * (in an intersection) another constituent, making them redundant.
     * Literals, primitives, and null/undefined are left to the checks below,
     * so this does not depend on `strictNullChecks`.
     */
    function checkObjectTypeAssignability(
      node: TSESTree.TSIntersectionType | TSESTree.TSUnionType,
      container: 'intersection' | 'union',
    ): void {
      const types = node.types.map(typeNode =>
        services.getTypeAtLocation(typeNode),
      );
      const isIgnored = types.map(type =>
        isIgnoredByAssignability(type, checker),
      );
      const isArrayOrTuple = (type: ts.Type): boolean =>
        checker.isArrayType(type) || checker.isTupleType(type);

      node.types.forEach((typeNode, i) => {
        const type = types[i];
        if (!tsutils.isObjectType(type) || isIgnored[i]) {
          return;
        }

        const isOverridden = types.some((other, j) => {
          if (i === j || isIgnored[j]) {
            return false;
          }
          const [narrower, wider] =
            container === 'union' ? [type, other] : [other, type];
          return (
            (other.isUnionOrIntersection() ? other.types : [other]).every(
              part =>
                !tsutils.isObjectType(part) ||
                // Array instantiations have differently named symbol members
                (isArrayOrTuple(type) && isArrayOrTuple(part)) ||
                haveSameObjectShape(type, part, checker),
            ) &&
            checker.isTypeAssignableTo(narrower, wider) &&
            !checker.isTypeAssignableTo(wider, narrower)
          );
        });

        if (isOverridden) {
          context.report({
            node: typeNode,
            messageId: 'overridden',
            data: { container, typeName: checker.typeToString(type) },
          });
        }
      });
    }

    return {
      'TSIntersectionType:exit'(node: TSESTree.TSIntersectionType): void {
        checkObjectTypeAssignability(node, 'intersection');

        const seenLiteralTypes = new Map<PrimitiveTypeFlag, string[]>();
        const seenPrimitiveTypes = new Map<
          PrimitiveTypeFlag,
          TSESTree.TypeNode[]
        >();
        const seenUnionTypes = new Map<
          TSESTree.TypeNode,
          TypeFlagsWithName[]
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
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-assignment
                      primitive as keyof typeof primitiveTypeFlagNames
                    ],
                },
              });
            }
          }
        };
        if (seenUnionTypes.size > 0) {
          checkIfUnionsAreAssignable();
          return;
        }
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
                  literal: matchedLiteralTypes.join(' | '),
                  primitive: primitiveTypeFlagNames[primitiveTypeFlag],
                },
              });
            }
          }
        }
      },
      'TSUnionType:exit'(node: TSESTree.TSUnionType): void {
        checkObjectTypeAssignability(node, 'union');

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
      },
    };
  },
});
