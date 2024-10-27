import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/utils';
import * as tsutils from 'ts-api-utils';
import * as ts from 'typescript';

import {
  createRule,
  getParserServices,
  getTextWithParentheses,
  getTypeFlags,
  isLogicalOrOperator,
  isNodeEqual,
  isNullLiteral,
  isTypeFlagSet,
  isUndefinedIdentifier,
  nullThrows,
  NullThrowsReasons,
} from '../util';

export type Options = [
  {
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    ignoreConditionalTests?: boolean;
    ignoreMixedLogicalExpressions?: boolean;
    ignorePrimitives?:
      | {
          bigint?: boolean;
          boolean?: boolean;
          number?: boolean;
          string?: boolean;
        }
      | true;
    ignoreTernaryTests?: boolean;
    ignoreBooleanCoercion?: boolean;
  },
];

export type MessageIds =
  | 'noStrictNullCheck'
  | 'preferNullishOverOr'
  | 'preferNullishOverTernary'
  | 'suggestNullish';

export default createRule<Options, MessageIds>({
  name: 'prefer-nullish-coalescing',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using the nullish coalescing operator instead of logical assignments or chaining',
      recommended: 'stylistic',
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      preferNullishOverOr:
        'Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.',
      preferNullishOverTernary:
        'Prefer using nullish coalescing operator (`??`) instead of a ternary expression, as it is simpler to read.',
      suggestNullish: 'Fix to nullish coalescing operator (`??`).',
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
            description:
              'Unless this is set to `true`, the rule will error on every file whose `tsconfig.json` does _not_ have the `strictNullChecks` compiler option (or `strict`) set to `true`.',
            type: 'boolean',
          },
          ignoreConditionalTests: {
            description:
              'Whether to ignore cases that are located within a conditional test.',
            type: 'boolean',
          },
          ignoreMixedLogicalExpressions: {
            description:
              'Whether to ignore any logical or expressions that are part of a mixed logical expression (with `&&`).',
            type: 'boolean',
          },
          ignorePrimitives: {
            description:
              'Whether to ignore all (`true`) or some (an object with properties) primitive types.',
            oneOf: [
              {
                type: 'object',
                properties: {
                  bigint: { type: 'boolean' },
                  boolean: { type: 'boolean' },
                  number: { type: 'boolean' },
                  string: { type: 'boolean' },
                },
              },
              {
                type: 'boolean',
                enum: [true],
              },
            ],
          },
          ignoreTernaryTests: {
            description:
              'Whether to ignore any ternary expressions that could be simplified by using the nullish coalescing operator.',
            type: 'boolean',
          },
          ignoreBooleanCoercion: {
            description:
              'Whether to ignore arguments to the `Boolean` constructor',
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      ignoreConditionalTests: true,
      ignoreTernaryTests: false,
      ignoreMixedLogicalExpressions: false,
      ignorePrimitives: {
        bigint: false,
        boolean: false,
        number: false,
        string: false,
      },
      ignoreBooleanCoercion: false,
    },
  ],
  create(
    context,
    [
      {
        allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing,
        ignoreConditionalTests,
        ignoreMixedLogicalExpressions,
        ignorePrimitives,
        ignoreTernaryTests,
        ignoreBooleanCoercion,
      },
    ],
  ) {
    const parserServices = getParserServices(context);
    const compilerOptions = parserServices.program.getCompilerOptions();

    const checker = parserServices.program.getTypeChecker();
    const isStrictNullChecks = tsutils.isStrictCompilerOptionEnabled(
      compilerOptions,
      'strictNullChecks',
    );

    if (
      !isStrictNullChecks &&
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing !== true
    ) {
      context.report({
        loc: {
          start: { line: 0, column: 0 },
          end: { line: 0, column: 0 },
        },
        messageId: 'noStrictNullCheck',
      });
    }

    return {
      ConditionalExpression(node: TSESTree.ConditionalExpression): void {
        if (ignoreTernaryTests) {
          return;
        }

        let operator: '!=' | '!==' | '==' | '===' | undefined;
        let nodesInsideTestExpression: TSESTree.Node[] = [];
        if (node.test.type === AST_NODE_TYPES.BinaryExpression) {
          nodesInsideTestExpression = [node.test.left, node.test.right];
          if (
            node.test.operator === '==' ||
            node.test.operator === '!=' ||
            node.test.operator === '===' ||
            node.test.operator === '!=='
          ) {
            operator = node.test.operator;
          }
        } else if (
          node.test.type === AST_NODE_TYPES.LogicalExpression &&
          node.test.left.type === AST_NODE_TYPES.BinaryExpression &&
          node.test.right.type === AST_NODE_TYPES.BinaryExpression
        ) {
          nodesInsideTestExpression = [
            node.test.left.left,
            node.test.left.right,
            node.test.right.left,
            node.test.right.right,
          ];
          if (node.test.operator === '||') {
            if (
              node.test.left.operator === '===' &&
              node.test.right.operator === '==='
            ) {
              operator = '===';
            } else if (
              ((node.test.left.operator === '===' ||
                node.test.right.operator === '===') &&
                (node.test.left.operator === '==' ||
                  node.test.right.operator === '==')) ||
              (node.test.left.operator === '==' &&
                node.test.right.operator === '==')
            ) {
              operator = '==';
            }
          } else if (node.test.operator === '&&') {
            if (
              node.test.left.operator === '!==' &&
              node.test.right.operator === '!=='
            ) {
              operator = '!==';
            } else if (
              ((node.test.left.operator === '!==' ||
                node.test.right.operator === '!==') &&
                (node.test.left.operator === '!=' ||
                  node.test.right.operator === '!=')) ||
              (node.test.left.operator === '!=' &&
                node.test.right.operator === '!=')
            ) {
              operator = '!=';
            }
          }
        }

        if (!operator) {
          return;
        }

        let identifier: TSESTree.Node | undefined;
        let hasUndefinedCheck = false;
        let hasNullCheck = false;

        // we check that the test only contains null, undefined and the identifier
        for (const testNode of nodesInsideTestExpression) {
          if (isNullLiteral(testNode)) {
            hasNullCheck = true;
          } else if (isUndefinedIdentifier(testNode)) {
            hasUndefinedCheck = true;
          } else if (
            (operator === '!==' || operator === '!=') &&
            isNodeEqual(testNode, node.consequent)
          ) {
            identifier = testNode;
          } else if (
            (operator === '===' || operator === '==') &&
            isNodeEqual(testNode, node.alternate)
          ) {
            identifier = testNode;
          } else {
            return;
          }
        }

        if (!identifier) {
          return;
        }

        const isFixable = ((): boolean => {
          // it is fixable if we check for both null and undefined, or not if neither
          if (hasUndefinedCheck === hasNullCheck) {
            return hasUndefinedCheck;
          }

          // it is fixable if we loosely check for either null or undefined
          if (operator === '==' || operator === '!=') {
            return true;
          }

          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(identifier);
          const type = checker.getTypeAtLocation(tsNode);
          const flags = getTypeFlags(type);

          if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
            return false;
          }

          const hasNullType = (flags & ts.TypeFlags.Null) !== 0;

          // it is fixable if we check for undefined and the type is not nullable
          if (hasUndefinedCheck && !hasNullType) {
            return true;
          }

          const hasUndefinedType = (flags & ts.TypeFlags.Undefined) !== 0;

          // it is fixable if we check for null and the type can't be undefined
          return hasNullCheck && !hasUndefinedType;
        })();

        if (isFixable) {
          context.report({
            node,
            messageId: 'preferNullishOverTernary',
            suggest: [
              {
                messageId: 'suggestNullish',
                fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
                  const [left, right] =
                    operator === '===' || operator === '=='
                      ? [node.alternate, node.consequent]
                      : [node.consequent, node.alternate];
                  return fixer.replaceText(
                    node,
                    `${getTextWithParentheses(context.sourceCode, left)} ?? ${getTextWithParentheses(
                      context.sourceCode,
                      right,
                    )}`,
                  );
                },
              },
            ],
          });
        }
      },

      'LogicalExpression[operator = "||"]'(
        node: TSESTree.LogicalExpression,
      ): void {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = checker.getTypeAtLocation(tsNode.left);
        if (!isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined)) {
          return;
        }

        if (ignoreConditionalTests === true && isConditionalTest(node)) {
          return;
        }

        if (
          ignoreBooleanCoercion === true &&
          isBooleanConstructorContext(node, context)
        ) {
          return;
        }

        const isMixedLogical = isMixedLogicalExpression(node);
        if (ignoreMixedLogicalExpressions === true && isMixedLogical) {
          return;
        }

        // https://github.com/typescript-eslint/typescript-eslint/issues/5439
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const ignorableFlags = [
          (ignorePrimitives === true || ignorePrimitives!.bigint) &&
            ts.TypeFlags.BigIntLike,
          (ignorePrimitives === true || ignorePrimitives!.boolean) &&
            ts.TypeFlags.BooleanLike,
          (ignorePrimitives === true || ignorePrimitives!.number) &&
            ts.TypeFlags.NumberLike,
          (ignorePrimitives === true || ignorePrimitives!.string) &&
            ts.TypeFlags.StringLike,
        ]
          .filter((flag): flag is number => typeof flag === 'number')
          .reduce((previous, flag) => previous | flag, 0);
        if (
          type.flags !== ts.TypeFlags.Null &&
          type.flags !== ts.TypeFlags.Undefined &&
          (type as ts.UnionOrIntersectionType).types.some(t =>
            tsutils
              .intersectionTypeParts(t)
              .some(t => tsutils.isTypeFlagSet(t, ignorableFlags)),
          )
        ) {
          return;
        }
        /* eslint-enable @typescript-eslint/no-non-null-assertion */

        const barBarOperator = nullThrows(
          context.sourceCode.getTokenAfter(
            node.left,
            token =>
              token.type === AST_TOKEN_TYPES.Punctuator &&
              token.value === node.operator,
          ),
          NullThrowsReasons.MissingToken('operator', node.type),
        );

        function* fix(
          fixer: TSESLint.RuleFixer,
        ): IterableIterator<TSESLint.RuleFix> {
          if (isLogicalOrOperator(node.parent)) {
            // '&&' and '??' operations cannot be mixed without parentheses (e.g. a && b ?? c)
            if (
              node.left.type === AST_NODE_TYPES.LogicalExpression &&
              !isLogicalOrOperator(node.left.left)
            ) {
              yield fixer.insertTextBefore(node.left.right, '(');
            } else {
              yield fixer.insertTextBefore(node.left, '(');
            }
            yield fixer.insertTextAfter(node.right, ')');
          }
          yield fixer.replaceText(barBarOperator, '??');
        }

        context.report({
          node: barBarOperator,
          messageId: 'preferNullishOverOr',
          suggest: [
            {
              messageId: 'suggestNullish',
              fix,
            },
          ],
        });
      },
    };
  },
});

function isConditionalTest(node: TSESTree.Node): boolean {
  const parent = node.parent;
  if (parent == null) {
    return false;
  }

  if (parent.type === AST_NODE_TYPES.LogicalExpression) {
    return isConditionalTest(parent);
  }

  if (
    parent.type === AST_NODE_TYPES.ConditionalExpression &&
    (parent.consequent === node || parent.alternate === node)
  ) {
    return isConditionalTest(parent);
  }

  if (
    parent.type === AST_NODE_TYPES.SequenceExpression &&
    parent.expressions.at(-1) === node
  ) {
    return isConditionalTest(parent);
  }

  if (
    (parent.type === AST_NODE_TYPES.ConditionalExpression ||
      parent.type === AST_NODE_TYPES.DoWhileStatement ||
      parent.type === AST_NODE_TYPES.IfStatement ||
      parent.type === AST_NODE_TYPES.ForStatement ||
      parent.type === AST_NODE_TYPES.WhileStatement) &&
    parent.test === node
  ) {
    return true;
  }

  return false;
}

function isBooleanConstructorContext(
  node: TSESTree.Node,
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): boolean {
  const parent = node.parent;
  if (parent == null) {
    return false;
  }

  if (parent.type === AST_NODE_TYPES.LogicalExpression) {
    return isBooleanConstructorContext(parent, context);
  }

  if (
    parent.type === AST_NODE_TYPES.ConditionalExpression &&
    (parent.consequent === node || parent.alternate === node)
  ) {
    return isBooleanConstructorContext(parent, context);
  }

  if (
    parent.type === AST_NODE_TYPES.SequenceExpression &&
    parent.expressions.at(-1) === node
  ) {
    return isBooleanConstructorContext(parent, context);
  }

  return isBuiltInBooleanCall(parent, context);
}

function isBuiltInBooleanCall(
  node: TSESTree.Node,
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
): boolean {
  if (
    node.type === AST_NODE_TYPES.CallExpression &&
    node.callee.type === AST_NODE_TYPES.Identifier &&
    // eslint-disable-next-line @typescript-eslint/internal/prefer-ast-types-enum
    node.callee.name === 'Boolean' &&
    node.arguments[0]
  ) {
    const scope = context.sourceCode.getScope(node);
    const variable = scope.set.get(AST_TOKEN_TYPES.Boolean);
    return variable == null || variable.defs.length === 0;
  }
  return false;
}

function isMixedLogicalExpression(node: TSESTree.LogicalExpression): boolean {
  const seen = new Set<TSESTree.Node | undefined>();
  const queue = [node.parent, node.left, node.right];
  for (const current of queue) {
    if (seen.has(current)) {
      continue;
    }
    seen.add(current);

    if (current.type === AST_NODE_TYPES.LogicalExpression) {
      if (current.operator === '&&') {
        return true;
      } else if (current.operator === '||') {
        // check the pieces of the node to catch cases like `a || b || c && d`
        queue.push(current.parent, current.left, current.right);
      }
    }
  }

  return false;
}
