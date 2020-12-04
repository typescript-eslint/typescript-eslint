import {
  TSESTree,
  AST_NODE_TYPES,
  TSESLint,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import * as tsutils from 'tsutils';
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
  | 'conditionFixDefaultEmptyString'
  | 'conditionFixDefaultZero'
  | 'conditionFixCompareNullish'
  | 'conditionFixCastBoolean'
  | 'conditionFixCompareStringLength'
  | 'conditionFixCompareEmptyString'
  | 'conditionFixCompareZero'
  | 'conditionFixCompareNaN';

export default util.createRule<Options, MessageId>({
  name: 'strict-boolean-expressions',
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Restricts the types allowed in boolean expressions',
      category: 'Best Practices',
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

      conditionFixDefaultEmptyString:
        'Treat lack of value the same as an empty string',
      conditionFixDefaultZero: 'Treat lack of value the same as 0',
      conditionFixCompareNullish:
        'Change condition to check for null/undefined',
      conditionFixCastBoolean: 'Explicitly cast value to a boolean',
      conditionFixCompareStringLength:
        "Change condition to check string's length",
      conditionFixCompareEmptyString:
        'Change condition to check for empty string',
      conditionFixCompareZero: 'Change condition to check for 0',
      conditionFixCompareNaN: 'Change condition to check for NaN',
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
    const service = util.getParserServices(context);
    const checker = service.program.getTypeChecker();
    const compilerOptions = service.program.getCompilerOptions();
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

    const checkedNodes = new Set<TSESTree.Node>();

    return {
      ConditionalExpression: checkTestExpression,
      DoWhileStatement: checkTestExpression,
      ForStatement: checkTestExpression,
      IfStatement: checkTestExpression,
      WhileStatement: checkTestExpression,
      'LogicalExpression[operator!="??"]': checkNode,
      'UnaryExpression[operator="!"]': checkUnaryLogicalExpression,
    };

    type TestExpression =
      | TSESTree.ConditionalExpression
      | TSESTree.DoWhileStatement
      | TSESTree.ForStatement
      | TSESTree.IfStatement
      | TSESTree.WhileStatement;

    function checkTestExpression(node: TestExpression): void {
      if (node.test == null) {
        return;
      }
      checkNode(node.test, true);
    }

    function checkUnaryLogicalExpression(node: TSESTree.UnaryExpression): void {
      checkNode(node.argument, true);
    }

    /**
     * This function analyzes the type of a node and checks if it is allowed in a boolean context.
     * It can recurse when checking nested logical operators, so that only the outermost operands are reported.
     * The right operand of a logical expression is ignored unless it's a part of a test expression (if/while/ternary/etc).
     * @param node The AST node to check.
     * @param isTestExpr Whether the node is a descendant of a test expression.
     */
    function checkNode(node: TSESTree.Node, isTestExpr = false): void {
      // prevent checking the same node multiple times
      if (checkedNodes.has(node)) {
        return;
      }
      checkedNodes.add(node);

      // for logical operator, we check its operands
      if (
        node.type === AST_NODE_TYPES.LogicalExpression &&
        node.operator !== '??'
      ) {
        checkNode(node.left, isTestExpr);

        // we ignore the right operand when not in a context of a test expression
        if (isTestExpr) {
          checkNode(node.right, isTestExpr);
        }
        return;
      }

      interface WrappingFixerParams {
        /** The node we want to wrap with some code. */
        node: TSESTree.Node;
        /**
         * Descendant of `node` we want to preserve.
         * Use this to replace some node with another.
         * By default it's the node we are wrapping (so nothing is removed).
         */
        innerNode?: TSESTree.Node;
        /**
         * The function which gets the source code of the node and returns more code around it.
         * E.g. ``code => `${code} != null` ``
         */
        wrap: (code: string) => string;
      }

      /**
       * Wraps node with some code. Adds parenthesis as necessary.
       * @returns Fixer which adds the specified code and parens if necessary.
       */
      function getWrappingFixer(
        params: WrappingFixerParams,
      ): TSESLint.ReportFixFunction {
        const { node, innerNode = node, wrap } = params;
        return (fixer): TSESLint.RuleFix => {
          let code = sourceCode.getText(innerNode);

          // check the inner expression's precedence
          if (
            innerNode.type !== AST_NODE_TYPES.Literal &&
            innerNode.type !== AST_NODE_TYPES.Identifier &&
            innerNode.type !== AST_NODE_TYPES.MemberExpression &&
            innerNode.type !== AST_NODE_TYPES.CallExpression
          ) {
            // we are wrapping something else than a simple variable or function call
            // the code we are adding might have stronger precedence than our wrapped node
            // let's wrap our node in parens in case it has a weaker precedence than the code we are wrapping it in
            code = `(${code})`;
          }

          // do the wrapping
          code = wrap(code);

          // check the outer expression's precedence
          if (
            node.parent != null &&
            node.parent.type !== AST_NODE_TYPES.IfStatement &&
            node.parent.type !== AST_NODE_TYPES.ForStatement &&
            node.parent.type !== AST_NODE_TYPES.WhileStatement &&
            node.parent.type !== AST_NODE_TYPES.DoWhileStatement
          ) {
            // the whole expression's parent is something else than condition of if/for/while
            // we wrapped the node in some expression which very likely has a different precedence than original wrapped node
            // let's wrap the whole expression in parens just in case
            if (!util.isParenthesized(node, sourceCode)) {
              code = `(${code})`;
            }
          }

          return fixer.replaceText(node, code);
        };
      }

      /** @returns `true` when the node is contained within an unary logical negation expression. */
      function isNegatedNode(node: TSESTree.Node): boolean {
        return (
          node.parent?.type === AST_NODE_TYPES.UnaryExpression &&
          node.parent?.operator === '!'
        );
      }

      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      const type = util.getConstrainedTypeAtLocation(checker, tsNode);
      const types = inspectVariantTypes(tsutils.unionTypeParts(type));

      const is = (...wantedTypes: readonly VariantType[]): boolean =>
        types.size === wantedTypes.length &&
        wantedTypes.every(type => types.has(type));

      // boolean
      if (is('boolean')) {
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

      // nullable boolean
      if (is('nullish', 'boolean')) {
        if (!options.allowNullableBoolean) {
          context.report({
            node,
            messageId: 'conditionErrorNullableBoolean',
            fix: getWrappingFixer({ node, wrap: code => `${code} ?? false` }),
          });
        }
        return;
      }

      // string
      if (is('string')) {
        if (!options.allowString) {
          if (isNegatedNode(node)) {
            context.report({
              node,
              messageId: 'conditionErrorString',
              suggest: [
                {
                  messageId: 'conditionFixCompareEmptyString',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    wrap: code => `${code} === ""`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareStringLength',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    wrap: code => `${code}.length === 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    wrap: code => `!Boolean(${code})`,
                  }),
                },
              ],
            });
          } else {
            context.report({
              node,
              messageId: 'conditionErrorString',
              suggest: [
                {
                  messageId: 'conditionFixCompareEmptyString',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `${code} !== ""`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareStringLength',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `${code}.length > 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: getWrappingFixer({
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
          if (isNegatedNode(node)) {
            context.report({
              node,
              messageId: 'conditionErrorNullableString',
              suggest: [
                {
                  messageId: 'conditionFixDefaultEmptyString',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `${code} ?? ""`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareNullish',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    wrap: code => `${code} == null`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    wrap: code => `!Boolean(${code})`,
                  }),
                },
              ],
            });
          } else {
            context.report({
              node,
              messageId: 'conditionErrorNullableString',
              suggest: [
                {
                  messageId: 'conditionFixDefaultEmptyString',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `${code} ?? ""`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareNullish',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `${code} != null`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: getWrappingFixer({
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
      if (is('number')) {
        if (!options.allowNumber) {
          if (isNegatedNode(node)) {
            context.report({
              node,
              messageId: 'conditionErrorNumber',
              suggest: [
                {
                  messageId: 'conditionFixCompareZero',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    // TODO: we have to compare to 0n if the type is bigint
                    wrap: code => `${code} === 0`,
                  }),
                },
                {
                  // TODO: don't suggest this for bigint because it can't be NaN
                  messageId: 'conditionFixCompareNaN',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    wrap: code => `Number.isNaN(${code})`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    wrap: code => `!Boolean(${code})`,
                  }),
                },
              ],
            });
          } else {
            context.report({
              node,
              messageId: 'conditionErrorNumber',
              suggest: [
                {
                  messageId: 'conditionFixCompareZero',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `${code} !== 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareNaN',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `!Number.isNaN(${code})`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: getWrappingFixer({
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
          if (isNegatedNode(node)) {
            context.report({
              node,
              messageId: 'conditionErrorNullableNumber',
              suggest: [
                {
                  messageId: 'conditionFixDefaultZero',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `${code} ?? 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareNullish',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    wrap: code => `${code} == null`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: getWrappingFixer({
                    node: node.parent!,
                    innerNode: node,
                    wrap: code => `!Boolean(${code})`,
                  }),
                },
              ],
            });
          } else {
            context.report({
              node,
              messageId: 'conditionErrorNullableNumber',
              suggest: [
                {
                  messageId: 'conditionFixDefaultZero',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `${code} ?? 0`,
                  }),
                },
                {
                  messageId: 'conditionFixCompareNullish',
                  fix: getWrappingFixer({
                    node,
                    wrap: code => `${code} != null`,
                  }),
                },
                {
                  messageId: 'conditionFixCastBoolean',
                  fix: getWrappingFixer({
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
          if (isNegatedNode(node)) {
            context.report({
              node,
              messageId: 'conditionErrorNullableObject',
              fix: getWrappingFixer({
                node: node.parent!,
                innerNode: node,
                wrap: code => `${code} == null`,
              }),
            });
          } else {
            context.report({
              node,
              messageId: 'conditionErrorNullableObject',
              fix: getWrappingFixer({
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
                fix: getWrappingFixer({
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
      | 'string'
      | 'number'
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

      if (
        types.some(type =>
          tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike),
        )
      ) {
        variantTypes.add('boolean');
      }

      if (
        types.some(type => tsutils.isTypeFlagSet(type, ts.TypeFlags.StringLike))
      ) {
        variantTypes.add('string');
      }

      if (
        types.some(type =>
          tsutils.isTypeFlagSet(
            type,
            ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike,
          ),
        )
      ) {
        variantTypes.add('number');
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
                ts.TypeFlags.Any |
                ts.TypeFlags.Unknown |
                ts.TypeFlags.Never,
            ),
        )
      ) {
        variantTypes.add('object');
      }

      if (
        types.some(
          type => util.isTypeAnyType(type) || util.isTypeUnknownType(type),
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
