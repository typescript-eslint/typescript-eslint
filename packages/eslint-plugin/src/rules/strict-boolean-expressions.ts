import type { ParserServices, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';

import * as util from '../util';

export type Options = [
  {
    allowString?: boolean;
    allowNumber?: boolean;
    allowNullableObject?: boolean;
    allowNullableBoolean?: boolean;
    allowNullableString?: boolean;
    allowNullableNumber?: boolean;
    allowAny?: boolean;
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
  },
];

export type MessageId =
  | 'conditionErrorOther'
  | 'conditionErrorAny'
  | 'conditionErrorNullish'
  | 'conditionErrorNullableBoolean'
  | 'conditionErrorString'
  | 'conditionErrorNullableString'
  | 'conditionErrorNumber'
  | 'conditionErrorNullableNumber'
  | 'conditionErrorObject'
  | 'conditionErrorNullableObject'
  | 'noStrictNullCheck'
  | 'conditionFixDefaultFalse'
  | 'conditionFixDefaultEmptyString'
  | 'conditionFixDefaultZero'
  | 'conditionFixCompareNullish'
  | 'conditionFixCastBoolean'
  | 'conditionFixCompareTrue'
  | 'conditionFixCompareFalse'
  | 'conditionFixCompareStringLength'
  | 'conditionFixCompareEmptyString'
  | 'conditionFixCompareZero'
  | 'conditionFixCompareNaN';

export default util.createRule<Options, MessageId>({
  name: 'strict-boolean-expressions',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    hasSuggestions: true,
    docs: {
      description: 'Disallow certain types in boolean expressions',
      recommended: false,
      requiresTypeChecking: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowString: { type: 'boolean' },
          allowNumber: { type: 'boolean' },
          allowNullableObject: { type: 'boolean' },
          allowNullableBoolean: { type: 'boolean' },
          allowNullableString: { type: 'boolean' },
          allowNullableNumber: { type: 'boolean' },
          allowAny: { type: 'boolean' },
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      conditionErrorOther:
        'Unexpected value in conditional. ' +
        'A boolean expression is required.',
      conditionErrorAny:
        'Unexpected any value in conditional. ' +
        'An explicit comparison or type cast is required.',
      conditionErrorNullish:
        'Unexpected nullish value in conditional. ' +
        'The condition is always false.',
      conditionErrorNullableBoolean:
        'Unexpected nullable boolean value in conditional. ' +
        'Please handle the nullish case explicitly.',
      conditionErrorString:
        'Unexpected string value in conditional. ' +
        'An explicit empty string check is required.',
      conditionErrorNullableString:
        'Unexpected nullable string value in conditional. ' +
        'Please handle the nullish/empty cases explicitly.',
      conditionErrorNumber:
        'Unexpected number value in conditional. ' +
        'An explicit zero/NaN check is required.',
      conditionErrorNullableNumber:
        'Unexpected nullable number value in conditional. ' +
        'Please handle the nullish/zero/NaN cases explicitly.',
      conditionErrorObject:
        'Unexpected object value in conditional. ' +
        'The condition is always true.',
      conditionErrorNullableObject:
        'Unexpected nullable object value in conditional. ' +
        'An explicit null check is required.',
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',

      conditionFixDefaultFalse:
        'Explicitly treat nullish value the same as false (`value ?? false`)',
      conditionFixDefaultEmptyString:
        'Explicitly treat nullish value the same as an empty string (`value ?? ""`)',
      conditionFixDefaultZero:
        'Explicitly treat nullish value the same as 0 (`value ?? 0`)',
      conditionFixCompareNullish:
        'Change condition to check for null/undefined (`value != null`)',
      conditionFixCastBoolean:
        'Explicitly cast value to a boolean (`Boolean(value)`)',
      conditionFixCompareTrue:
        'Change condition to check if true (`value === true`)',
      conditionFixCompareFalse:
        'Change condition to check if false (`value === false`)',
      conditionFixCompareStringLength:
        "Change condition to check string's length (`value.length !== 0`)",
      conditionFixCompareEmptyString:
        'Change condition to check for empty string (`value !== ""`)',
      conditionFixCompareZero:
        'Change condition to check for 0 (`value !== 0`)',
      conditionFixCompareNaN:
        'Change condition to check for NaN (`!Number.isNaN(value)`)',
    },
  },
  defaultOptions: [
    {
      allowString: true,
      allowNumber: true,
      allowNullableObject: true,
      allowNullableBoolean: false,
      allowNullableString: false,
      allowNullableNumber: false,
      allowAny: false,
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
    },
  ],
  create(context, [options]) {
    const parserServices = util.getParserServices(context);
    const typeChecker = parserServices.program.getTypeChecker();
    const compilerOptions = parserServices.program.getCompilerOptions();
    const sourceCode = context.getSourceCode();
    const isStrictNullChecks = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'strictNullChecks',
    );

    if (
      !isStrictNullChecks &&
      options.allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing !== true
    ) {
      context.report({
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
        messageId: 'noStrictNullCheck',
      });
    }

    const traversedNodes = new Set<TSESTree.Node>();

    return {
      ConditionalExpression: traverseTestExpression,
      DoWhileStatement: traverseTestExpression,
      ForStatement: traverseTestExpression,
      IfStatement: traverseTestExpression,
      WhileStatement: traverseTestExpression,
      'LogicalExpression[operator!="??"]': traverseLogicalExpression,
      'UnaryExpression[operator="!"]': traverseUnaryLogicalExpression,
    };

    type TestExpression =
      | TSESTree.ConditionalExpression
      | TSESTree.DoWhileStatement
      | TSESTree.ForStatement
      | TSESTree.IfStatement
      | TSESTree.WhileStatement;

    /**
     * Inspects condition of a test expression. (`if`, `while`, `for`, etc.)
     */
    function traverseTestExpression(node: TestExpression): void {
      if (node.test == null) {
        return;
      }
      traverseNode(node.test, true);
    }

    /**
     * Inspects the argument of a unary logical expression (`!`).
     */
    function traverseUnaryLogicalExpression(
      node: TSESTree.UnaryExpression,
    ): void {
      traverseNode(node.argument, true);
    }

    /**
     * Inspects the arguments of a logical expression (`&&`, `||`).
     *
     * If the logical expression is a descendant of a test expression,
     * the `isCondition` flag should be set to true.
     * Otherwise, if the logical expression is there on it's own,
     * it's used for control flow and is not a condition itself.
     */
    function traverseLogicalExpression(
      node: TSESTree.LogicalExpression,
      isCondition = false,
    ): void {
      // left argument is always treated as a condition
      traverseNode(node.left, true);
      // if the logical expression is used for control flow,
      // then it's right argument is used for it's side effects only
      traverseNode(node.right, isCondition);
    }

    /**
     * Inspects any node.
     *
     * If it's a logical expression then it recursively traverses its arguments.
     * If it's any other kind of node then it's type is finally checked against the rule,
     * unless `isCondition` flag is set to false, in which case
     * it's assumed to be used for side effects only and is skipped.
     */
    function traverseNode(node: TSESTree.Node, isCondition: boolean): void {
      // prevent checking the same node multiple times
      if (traversedNodes.has(node)) {
        return;
      }
      traversedNodes.add(node);

      // for logical operator, we check its operands
      if (
        node.type === AST_NODE_TYPES.LogicalExpression &&
        node.operator !== '??'
      ) {
        traverseLogicalExpression(node, isCondition);
        return;
      }

      // skip if node is not a condition
      if (!isCondition) {
        return;
      }

      checkNode(node);
    }

    /**
     * This function does the actual type check on a node.
     * It analyzes the type of a node and checks if it is allowed in a boolean context.
     */
    function checkNode(node: TSESTree.Node): void {
      const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
      const type = util.getConstrainedTypeAtLocation(typeChecker, tsNode);
      const types = inspectVariantTypes(tsutils.unionTypeParts(type));

      const is = (...wantedTypes: readonly VariantType[]): boolean =>
        types.size === wantedTypes.length &&
        wantedTypes.every(type => types.has(type));

      // boolean
      if (is('boolean') || is('truthy boolean')) {
        // boolean is always okay
        return;
      }

      // never
      if (is('never')) {
        // never is always okay
        return;
      }

      // nullish
      if (is('nullish')) {
        // condition is always false
        context.report({ node, messageId: 'conditionErrorNullish' });
        return;
      }

      // Known edge case: boolean `true` and nullish values are always valid boolean expressions
      if (is('nullish', 'truthy boolean')) {
        return;
      }

      // nullable boolean
      if (is('nullish', 'boolean')) {
        if (!options.allowNullableBoolean) {
          if (isLogicalNegationExpression(node.parent!)) {
            // if (!nullableBoolean)
            context.report({
              node,
              messageId: 'conditionErrorNullableBoolean',
              suggest: [
                {
                  messageId: 'conditionFixDefaultFalse',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} ?? false`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareFalse',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `${code} === false`,
                  }),
                },
              ],
            });
          } else {
            // if (nullableBoolean)
            context.report({
              node,
              messageId: 'conditionErrorNullableBoolean',
              suggest: [
                {
                  messageId: 'conditionFixDefaultFalse',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} ?? false`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareTrue',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} === true`,
                  }),
                },
              ],
            });
          }
        }
        return;
      }

      // Known edge case: truthy primitives and nullish values are always valid boolean expressions
      if (
        (options.allowNumber && is('nullish', 'truthy number')) ||
        (options.allowString && is('nullish', 'truthy string'))
      ) {
        return;
      }

      // string
      if (is('string') || is('truthy string')) {
        if (!options.allowString) {
          if (isLogicalNegationExpression(node.parent!)) {
            // if (!string)
            context.report({
              node,
              messageId: 'conditionErrorString',
              suggest: [
                {
                  messageId: 'conditionFixCompareStringLength',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `${code}.length === 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareEmptyString',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `${code} === ""`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `!Boolean(${code})`,
                  }),
                },
              ],
            });
          } else {
            // if (string)
            context.report({
              node,
              messageId: 'conditionErrorString',
              suggest: [
                {
                  messageId: 'conditionFixCompareStringLength',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code}.length > 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareEmptyString',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} !== ""`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `Boolean(${code})`,
                  }),
                },
              ],
            });
          }
        }
        return;
      }

      // nullable string
      if (is('nullish', 'string')) {
        if (!options.allowNullableString) {
          if (isLogicalNegationExpression(node.parent!)) {
            // if (!nullableString)
            context.report({
              node,
              messageId: 'conditionErrorNullableString',
              suggest: [
                {
                  messageId: 'conditionFixCompareNullish',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `${code} == null`,
                  }),
                },
                {
                  messageId: 'conditionFixDefaultEmptyString',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} ?? ""`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `!Boolean(${code})`,
                  }),
                },
              ],
            });
          } else {
            // if (nullableString)
            context.report({
              node,
              messageId: 'conditionErrorNullableString',
              suggest: [
                {
                  messageId: 'conditionFixCompareNullish',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} != null`,
                  }),
                },
                {
                  messageId: 'conditionFixDefaultEmptyString',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} ?? ""`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `Boolean(${code})`,
                  }),
                },
              ],
            });
          }
        }
        return;
      }

      // number
      if (is('number') || is('truthy number')) {
        if (!options.allowNumber) {
          if (isArrayLengthExpression(node, typeChecker, parserServices)) {
            if (isLogicalNegationExpression(node.parent!)) {
              // if (!array.length)
              context.report({
                node,
                messageId: 'conditionErrorNumber',
                fix: util.getWrappingFixer({
                  sourceCode,
                  node: node.parent,
                  innerNode: node,
                  wrap: code => `${code} === 0`,
                }),
              });
            } else {
              // if (array.length)
              context.report({
                node,
                messageId: 'conditionErrorNumber',
                fix: util.getWrappingFixer({
                  sourceCode,
                  node,
                  wrap: code => `${code} > 0`,
                }),
              });
            }
          } else if (isLogicalNegationExpression(node.parent!)) {
            // if (!number)
            context.report({
              node,
              messageId: 'conditionErrorNumber',
              suggest: [
                {
                  messageId: 'conditionFixCompareZero',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    // TODO: we have to compare to 0n if the type is bigint
                    wrap: code => `${code} === 0`,
                  }),
                },
                {
                  // TODO: don't suggest this for bigint because it can't be NaN
                  messageId: 'conditionFixCompareNaN',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `Number.isNaN(${code})`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `!Boolean(${code})`,
                  }),
                },
              ],
            });
          } else {
            // if (number)
            context.report({
              node,
              messageId: 'conditionErrorNumber',
              suggest: [
                {
                  messageId: 'conditionFixCompareZero',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} !== 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareNaN',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `!Number.isNaN(${code})`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `Boolean(${code})`,
                  }),
                },
              ],
            });
          }
        }
        return;
      }

      // nullable number
      if (is('nullish', 'number')) {
        if (!options.allowNullableNumber) {
          if (isLogicalNegationExpression(node.parent!)) {
            // if (!nullableNumber)
            context.report({
              node,
              messageId: 'conditionErrorNullableNumber',
              suggest: [
                {
                  messageId: 'conditionFixCompareNullish',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `${code} == null`,
                  }),
                },
                {
                  messageId: 'conditionFixDefaultZero',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} ?? 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node: node.parent,
                    innerNode: node,
                    wrap: code => `!Boolean(${code})`,
                  }),
                },
              ],
            });
          } else {
            // if (nullableNumber)
            context.report({
              node,
              messageId: 'conditionErrorNullableNumber',
              suggest: [
                {
                  messageId: 'conditionFixCompareNullish',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} != null`,
                  }),
                },
                {
                  messageId: 'conditionFixDefaultZero',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `${code} ?? 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: util.getWrappingFixer({
                    sourceCode,
                    node,
                    wrap: code => `Boolean(${code})`,
                  }),
                },
              ],
            });
          }
        }
        return;
      }

      // object
      if (is('object')) {
        // condition is always true
        context.report({ node, messageId: 'conditionErrorObject' });
        return;
      }

      // nullable object
      if (is('nullish', 'object')) {
        if (!options.allowNullableObject) {
          if (isLogicalNegationExpression(node.parent!)) {
            // if (!nullableObject)
            context.report({
              node,
              messageId: 'conditionErrorNullableObject',
              fix: util.getWrappingFixer({
                sourceCode,
                node: node.parent,
                innerNode: node,
                wrap: code => `${code} == null`,
              }),
            });
          } else {
            // if (nullableObject)
            context.report({
              node,
              messageId: 'conditionErrorNullableObject',
              fix: util.getWrappingFixer({
                sourceCode,
                node,
                wrap: code => `${code} != null`,
              }),
            });
          }
        }
        return;
      }

      // any
      if (is('any')) {
        if (!options.allowAny) {
          context.report({
            node,
            messageId: 'conditionErrorAny',
            suggest: [
              {
                messageId: 'conditionFixCastBoolean',
                fix: util.getWrappingFixer({
                  sourceCode,
                  node,
                  wrap: code => `Boolean(${code})`,
                }),
              },
            ],
          });
        }
        return;
      }

      // other
      context.report({ node, messageId: 'conditionErrorOther' });
    }

    /** The types we care about */
    type VariantType =
      | 'nullish'
      | 'boolean'
      | 'truthy boolean'
      | 'string'
      | 'truthy string'
      | 'number'
      | 'truthy number'
      | 'object'
      | 'any'
      | 'never';

    /**
     * Check union variants for the types we care about
     */
    function inspectVariantTypes(types: ts.Type[]): Set<VariantType> {
      const variantTypes = new Set<VariantType>();

      if (
        types.some(type =>
          tsutils.isTypeFlagSet(
            type,
            ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.VoidLike,
          ),
        )
      ) {
        variantTypes.add('nullish');
      }
      const booleans = types.filter(type =>
        tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
      );

      // If incoming type is either "true" or "false", there will be one type
      // object with intrinsicName set accordingly
      // If incoming type is boolean, there will be two type objects with
      // intrinsicName set "true" and "false" each because of tsutils.unionTypeParts()
      if (booleans.length === 1) {
        tsutils.isBooleanLiteralType(booleans[0], true)
          ? variantTypes.add('truthy boolean')
          : variantTypes.add('boolean');
      } else if (booleans.length === 2) {
        variantTypes.add('boolean');
      }

      const strings = types.filter(type =>
        tsutils.isTypeFlagSet(type, ts.TypeFlags.StringLike),
      );

      if (strings.length) {
        if (strings.some(type => type.isStringLiteral() && type.value !== '')) {
          variantTypes.add('truthy string');
        } else {
          variantTypes.add('string');
        }
      }

      const numbers = types.filter(type =>
        tsutils.isTypeFlagSet(
          type,
          ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike,
        ),
      );
      if (numbers.length) {
        if (numbers.some(type => type.isNumberLiteral() && type.value !== 0)) {
          variantTypes.add('truthy number');
        } else {
          variantTypes.add('number');
        }
      }

      if (
        types.some(
          type =>
            !tsutils.isTypeFlagSet(
              type,
              ts.TypeFlags.Null |
                ts.TypeFlags.Undefined |
                ts.TypeFlags.VoidLike |
                ts.TypeFlags.BooleanLike |
                ts.TypeFlags.StringLike |
                ts.TypeFlags.NumberLike |
                ts.TypeFlags.BigIntLike |
                ts.TypeFlags.TypeParameter |
                ts.TypeFlags.Any |
                ts.TypeFlags.Unknown |
                ts.TypeFlags.Never,
            ),
        )
      ) {
        variantTypes.add('object');
      }

      if (
        types.some(type =>
          util.isTypeFlagSet(
            type,
            ts.TypeFlags.TypeParameter |
              ts.TypeFlags.Any |
              ts.TypeFlags.Unknown,
          ),
        )
      ) {
        variantTypes.add('any');
      }

      if (types.some(type => tsutils.isTypeFlagSet(type, ts.TypeFlags.Never))) {
        variantTypes.add('never');
      }

      return variantTypes;
    }
  },
});

function isLogicalNegationExpression(
  node: TSESTree.Node,
): node is TSESTree.UnaryExpression {
  return node.type === AST_NODE_TYPES.UnaryExpression && node.operator === '!';
}

function isArrayLengthExpression(
  node: TSESTree.Node,
  typeChecker: ts.TypeChecker,
  parserServices: ParserServices,
): node is TSESTree.MemberExpressionNonComputedName {
  if (node.type !== AST_NODE_TYPES.MemberExpression) {
    return false;
  }
  if (node.computed) {
    return false;
  }
  if (node.property.name !== 'length') {
    return false;
  }
  const objectTsNode = parserServices.esTreeNodeToTSNodeMap.get(node.object);
  const objectType = util.getConstrainedTypeAtLocation(
    typeChecker,
    objectTsNode,
  );
  return util.isTypeArrayTypeOrUnionOfArrayTypes(objectType, typeChecker);
}
