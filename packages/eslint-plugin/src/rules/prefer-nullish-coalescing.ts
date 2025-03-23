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
  isNodeOfTypes,
  isNullLiteral,
  isNullableType,
  isUndefinedIdentifier,
  nullThrows,
  NullThrowsReasons,
  skipChainExpression,
} from '../util';

const isIdentifierOrMemberOrChainExpression = isNodeOfTypes([
  AST_NODE_TYPES.ChainExpression,
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.MemberExpression,
] as const);

type NullishCheckOperator = '!' | '!=' | '!==' | '==' | '===' | undefined;

export type Options = [
  {
    allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing?: boolean;
    ignoreBooleanCoercion?: boolean;
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
      noStrictNullCheck:
        'This rule requires the `strictNullChecks` compiler option to be turned on to function correctly.',
      preferNullishOverOr:
        'Prefer using nullish coalescing operator (`??{{ equals }}`) instead of a logical {{ description }} (`||{{ equals }}`), as it is a safer operator.',
      preferNullishOverTernary:
        'Prefer using nullish coalescing operator (`??{{ equals }}`) instead of a ternary expression, as it is simpler to read.',
      suggestNullish: 'Fix to nullish coalescing operator (`??{{ equals }}`).',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: {
            type: 'boolean',
            description:
              'Unless this is set to `true`, the rule will error on every file whose `tsconfig.json` does _not_ have the `strictNullChecks` compiler option (or `strict`) set to `true`.',
          },
          ignoreBooleanCoercion: {
            type: 'boolean',
            description:
              'Whether to ignore arguments to the `Boolean` constructor',
          },
          ignoreConditionalTests: {
            type: 'boolean',
            description:
              'Whether to ignore cases that are located within a conditional test.',
          },
          ignoreMixedLogicalExpressions: {
            type: 'boolean',
            description:
              'Whether to ignore any logical or expressions that are part of a mixed logical expression (with `&&`).',
          },
          ignorePrimitives: {
            description:
              'Whether to ignore all (`true`) or some (an object with properties) primitive types.',
            oneOf: [
              {
                type: 'object',
                description: 'Which primitives types may be ignored.',
                properties: {
                  bigint: {
                    type: 'boolean',
                    description: 'Ignore bigint primitive types.',
                  },
                  boolean: {
                    type: 'boolean',
                    description: 'Ignore boolean primitive types.',
                  },
                  number: {
                    type: 'boolean',
                    description: 'Ignore number primitive types.',
                  },
                  string: {
                    type: 'boolean',
                    description: 'Ignore string primitive types.',
                  },
                },
              },
              {
                type: 'boolean',
                description: 'Ignore all primitive types.',
                enum: [true],
              },
            ],
          },
          ignoreTernaryTests: {
            type: 'boolean',
            description:
              'Whether to ignore any ternary expressions that could be simplified by using the nullish coalescing operator.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing: false,
      ignoreBooleanCoercion: false,
      ignoreConditionalTests: true,
      ignoreMixedLogicalExpressions: false,
      ignorePrimitives: {
        bigint: false,
        boolean: false,
        number: false,
        string: false,
      },
      ignoreTernaryTests: false,
    },
  ],
  create(
    context,
    [
      {
        allowRuleToRunWithoutStrictNullChecksIKnowWhatIAmDoing,
        ignoreBooleanCoercion,
        ignoreConditionalTests,
        ignoreMixedLogicalExpressions,
        ignorePrimitives,
        ignoreTernaryTests,
      },
    ],
  ) {
    const parserServices = getParserServices(context);
    const compilerOptions = parserServices.program.getCompilerOptions();

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
          start: { column: 0, line: 0 },
          end: { column: 0, line: 0 },
        },
        messageId: 'noStrictNullCheck',
      });
    }

    /**
     * Checks whether a type tested for truthiness is eligible for conversion to
     * a nullishness check, taking into account the rule's configuration.
     */
    function isTypeEligibleForPreferNullish(type: ts.Type): boolean {
      if (!isNullableType(type)) {
        return false;
      }

      const ignorableFlags = [
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        (ignorePrimitives === true || ignorePrimitives!.bigint) &&
          ts.TypeFlags.BigIntLike,
        (ignorePrimitives === true || ignorePrimitives!.boolean) &&
          ts.TypeFlags.BooleanLike,
        (ignorePrimitives === true || ignorePrimitives!.number) &&
          ts.TypeFlags.NumberLike,
        (ignorePrimitives === true || ignorePrimitives!.string) &&
          ts.TypeFlags.StringLike,
        /* eslint-enable @typescript-eslint/no-non-null-assertion */
      ]
        .filter((flag): flag is number => typeof flag === 'number')
        .reduce((previous, flag) => previous | flag, 0);

      if (ignorableFlags === 0) {
        // any types are eligible for conversion.
        return true;
      }

      // if the type is `any` or `unknown` we can't make any assumptions
      // about the value, so it could be any primitive, even though the flags
      // won't be set.
      //
      // technically, this is true of `void` as well, however, it's a TS error
      // to test `void` for truthiness, so we don't need to bother checking for
      // it in valid code.
      if (
        tsutils.isTypeFlagSet(type, ts.TypeFlags.Any | ts.TypeFlags.Unknown)
      ) {
        return false;
      }

      if (
        tsutils
          .typeParts(type)
          .some(t =>
            tsutils
              .intersectionTypeParts(t)
              .some(t => tsutils.isTypeFlagSet(t, ignorableFlags)),
          )
      ) {
        return false;
      }

      return true;
    }

    /**
     * Determines whether a control flow construct that uses the truthiness of
     * a test expression is eligible for conversion to the nullish coalescing
     * operator, taking into account (both dependent on the rule's configuration):
     * 1. Whether the construct is in a permitted syntactic context
     * 2. Whether the type of the test expression is deemed eligible for
     *    conversion
     *
     * @param node The overall node to be converted (e.g. `a || b` or `a ? a : b`)
     * @param testNode The node being tested (i.e. `a`)
     */
    function isTruthinessCheckEligibleForPreferNullish({
      node,
      testNode,
    }: {
      node:
        | TSESTree.AssignmentExpression
        | TSESTree.ConditionalExpression
        | TSESTree.LogicalExpression;
      testNode: TSESTree.Node;
    }): boolean {
      const testType = parserServices.getTypeAtLocation(testNode);
      if (!isTypeEligibleForPreferNullish(testType)) {
        return false;
      }

      if (ignoreConditionalTests === true && isConditionalTest(node)) {
        return false;
      }

      if (
        ignoreBooleanCoercion === true &&
        isBooleanConstructorContext(node, context)
      ) {
        return false;
      }

      return true;
    }

    function checkAndFixWithPreferNullishOverOr(
      node: TSESTree.AssignmentExpression | TSESTree.LogicalExpression,
      description: string,
      equals: string,
    ): void {
      if (
        !isTruthinessCheckEligibleForPreferNullish({
          node,
          testNode: node.left,
        })
      ) {
        return;
      }

      if (
        ignoreMixedLogicalExpressions === true &&
        isMixedLogicalExpression(node)
      ) {
        return;
      }

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
        yield fixer.replaceText(
          barBarOperator,
          node.operator.replace('||', '??'),
        );
      }

      context.report({
        node: barBarOperator,
        messageId: 'preferNullishOverOr',
        data: { description, equals },
        suggest: [
          {
            messageId: 'suggestNullish',
            data: { equals },
            fix,
          },
        ],
      });
    }

    return {
      'AssignmentExpression[operator = "||="]'(
        node: TSESTree.AssignmentExpression,
      ): void {
        checkAndFixWithPreferNullishOverOr(node, 'assignment', '=');
      },
      ConditionalExpression(node: TSESTree.ConditionalExpression): void {
        if (ignoreTernaryTests) {
          return;
        }

        let operator: NullishCheckOperator;
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
          if (['||', '||='].includes(node.test.operator)) {
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

        let nullishCoalescingLeftNode: TSESTree.Node | undefined;
        let hasTruthinessCheck = false;
        let hasNullCheckWithoutTruthinessCheck = false;
        let hasUndefinedCheckWithoutTruthinessCheck = false;

        if (!operator) {
          let testNode: TSESTree.Node | undefined;
          hasTruthinessCheck = true;

          if (isIdentifierOrMemberOrChainExpression(node.test)) {
            testNode = node.test;
          } else if (
            node.test.type === AST_NODE_TYPES.UnaryExpression &&
            isIdentifierOrMemberOrChainExpression(node.test.argument) &&
            node.test.operator === '!'
          ) {
            testNode = node.test.argument;
            operator = '!';
          }

          if (
            testNode &&
            areNodesSimilarMemberAccess(
              testNode,
              getBranchNodes(node, operator).nonNullishBranch,
            )
          ) {
            nullishCoalescingLeftNode = testNode;
          }
        } else {
          // we check that the test only contains null, undefined and the identifier
          for (const testNode of nodesInsideTestExpression) {
            if (isNullLiteral(testNode)) {
              hasNullCheckWithoutTruthinessCheck = true;
            } else if (isUndefinedIdentifier(testNode)) {
              hasUndefinedCheckWithoutTruthinessCheck = true;
            } else if (
              areNodesSimilarMemberAccess(
                testNode,
                getBranchNodes(node, operator).nonNullishBranch,
              )
            ) {
              // Only consider the first expression in a multi-part nullish check,
              // as subsequent expressions might not require all the optional chaining operators.
              // For example: a?.b?.c !== undefined && a.b.c !== null ? a.b.c : 'foo';
              // This works because `node.test` is always evaluated first in the loop
              // and has the same or more necessary optional chaining operators
              // than `node.alternate` or `node.consequent`.
              nullishCoalescingLeftNode ??= testNode;
            } else {
              return;
            }
          }
        }

        if (!nullishCoalescingLeftNode) {
          return;
        }

        const isFixableWithPreferNullishOverTernary = ((): boolean => {
          // x ? x : y and !x ? y : x patterns
          if (hasTruthinessCheck) {
            return isTruthinessCheckEligibleForPreferNullish({
              node,
              testNode: nullishCoalescingLeftNode,
            });
          }

          // it is fixable if we check for both null and undefined, or not if neither
          if (
            hasUndefinedCheckWithoutTruthinessCheck ===
            hasNullCheckWithoutTruthinessCheck
          ) {
            return hasUndefinedCheckWithoutTruthinessCheck;
          }

          // it is fixable if we loosely check for either null or undefined
          if (operator === '==' || operator === '!=') {
            return true;
          }

          const type = parserServices.getTypeAtLocation(
            nullishCoalescingLeftNode,
          );
          const flags = getTypeFlags(type);

          if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
            return false;
          }

          const hasNullType = (flags & ts.TypeFlags.Null) !== 0;

          // it is fixable if we check for undefined and the type is not nullable
          if (hasUndefinedCheckWithoutTruthinessCheck && !hasNullType) {
            return true;
          }

          const hasUndefinedType = (flags & ts.TypeFlags.Undefined) !== 0;

          // it is fixable if we check for null and the type can't be undefined
          return hasNullCheckWithoutTruthinessCheck && !hasUndefinedType;
        })();

        if (isFixableWithPreferNullishOverTernary) {
          context.report({
            node,
            messageId: 'preferNullishOverTernary',
            // TODO: also account for = in the ternary clause
            data: { equals: '' },
            suggest: [
              {
                messageId: 'suggestNullish',
                data: { equals: '' },
                fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
                  return fixer.replaceText(
                    node,
                    `${getTextWithParentheses(context.sourceCode, nullishCoalescingLeftNode)} ?? ${getTextWithParentheses(
                      context.sourceCode,
                      getBranchNodes(node, operator).nullishBranch,
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
        checkAndFixWithPreferNullishOverOr(node, 'or', '');
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
    parent.type === AST_NODE_TYPES.UnaryExpression &&
    parent.operator === '!'
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

function isMixedLogicalExpression(
  node: TSESTree.AssignmentExpression | TSESTree.LogicalExpression,
): boolean {
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
      }

      if (['||', '||='].includes(current.operator)) {
        // check the pieces of the node to catch cases like `a || b || c && d`
        queue.push(current.parent, current.left, current.right);
      }
    }
  }

  return false;
}

/**
 * Checks if two TSESTree nodes have the same member access sequence,
 * regardless of optional chaining differences.
 *
 * Note: This does not imply that the nodes are runtime-equivalent.
 *
 * Example: `a.b.c`, `a?.b.c`, `a.b?.c`, `(a?.b).c`, `(a.b)?.c` are considered similar.
 *
 * @param a First TSESTree node.
 * @param b Second TSESTree node.
 * @returns `true` if the nodes access members in the same order; otherwise, `false`.
 */
function areNodesSimilarMemberAccess(
  a: TSESTree.Node,
  b: TSESTree.Node,
): boolean {
  if (
    a.type === AST_NODE_TYPES.MemberExpression &&
    b.type === AST_NODE_TYPES.MemberExpression
  ) {
    return (
      isNodeEqual(a.property, b.property) &&
      areNodesSimilarMemberAccess(a.object, b.object)
    );
  }
  if (
    a.type === AST_NODE_TYPES.ChainExpression ||
    b.type === AST_NODE_TYPES.ChainExpression
  ) {
    return areNodesSimilarMemberAccess(
      skipChainExpression(a),
      skipChainExpression(b),
    );
  }
  return isNodeEqual(a, b);
}

/**
 * Returns the branch nodes of a conditional expression:
 * - the "nonNullish branch" is the branch when test node is not nullish
 * - the "nullish branch" is the branch when test node is nullish
 */
function getBranchNodes(
  node: TSESTree.ConditionalExpression,
  operator: NullishCheckOperator,
): {
  nonNullishBranch: TSESTree.Expression;
  nullishBranch: TSESTree.Expression;
} {
  if (!operator || ['!=', '!=='].includes(operator)) {
    return { nonNullishBranch: node.consequent, nullishBranch: node.alternate };
  }
  return { nonNullishBranch: node.alternate, nullishBranch: node.consequent };
}
