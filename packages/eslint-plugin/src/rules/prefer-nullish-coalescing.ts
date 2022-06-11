import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/utils';
import * as util from '../util';
import * as ts from 'typescript';

export type Options = [
  {
    ignoreConditionalTests?: boolean;
    ignoreTernaryTests?: boolean;
    ignoreMixedLogicalExpressions?: boolean;
  },
];

export type MessageIds =
  | 'preferNullishOverOr'
  | 'preferNullishOverTernary'
  | 'suggestNullish';

export default util.createRule<Options, MessageIds>({
  name: 'prefer-nullish-coalescing',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce using the nullish coalescing operator instead of logical chaining',
      recommended: 'strict',
      suggestion: true,
      requiresTypeChecking: true,
    },
    hasSuggestions: true,
    messages: {
      preferNullishOverOr:
        'Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.',
      preferNullishOverTernary:
        'Prefer using nullish coalescing operator (`??`) instead of a ternary expression, as it is simpler to read.',
      suggestNullish: 'Fix to nullish coalescing operator (`??`).',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreConditionalTests: {
            type: 'boolean',
          },
          ignoreTernaryTests: {
            type: 'boolean',
          },
          ignoreMixedLogicalExpressions: {
            type: 'boolean',
          },
          forceSuggestionFixer: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      ignoreConditionalTests: true,
      ignoreTernaryTests: true,
      ignoreMixedLogicalExpressions: true,
    },
  ],
  create(
    context,
    [
      {
        ignoreConditionalTests,
        ignoreTernaryTests,
        ignoreMixedLogicalExpressions,
      },
    ],
  ) {
    const parserServices = util.getParserServices(context);
    const sourceCode = context.getSourceCode();
    const checker = parserServices.program.getTypeChecker();

    return {
      ConditionalExpression(node: TSESTree.ConditionalExpression): void {
        if (ignoreTernaryTests) {
          return;
        }

        const operator = getOperator(node.test);

        if (!operator) {
          return;
        }

        let identifier: TSESTree.Node | undefined;
        let hasUndefinedCheck = false;
        let hasNullCheck = false;

        // we check that the test only contains null, undefined and the identifier
        for (const n of getNodes(node.test)) {
          if (util.isNullLiteral(n)) {
            hasNullCheck = true;
          } else if (util.isUndefinedIdentifier(n)) {
            hasUndefinedCheck = true;
          } else if (
            (operator === '!==' || operator === '!=') &&
            util.isNodeEqual(n, node.consequent)
          ) {
            identifier = n;
          } else if (
            (operator === '===' || operator === '==') &&
            util.isNodeEqual(n, node.alternate)
          ) {
            identifier = n;
          } else {
            return;
          }
        }

        if (!identifier) {
          return;
        }

        const isFixable = ((): boolean => {
          // it is fixable if we check for both null and undefined
          if (hasUndefinedCheck && hasNullCheck) {
            return true;
          }

          // it is fixable if we loosly check for eihter null or undefined
          if (
            (operator === '==' || operator === '!=') &&
            (hasUndefinedCheck || hasNullCheck)
          ) {
            return true;
          }

          const tsNode = parserServices.esTreeNodeToTSNodeMap.get(identifier);
          const type = checker.getTypeAtLocation(tsNode);
          const flags = util.getTypeFlags(type);

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
                    `${sourceCode.text.slice(
                      left.range[0],
                      left.range[1],
                    )} ?? ${sourceCode.text.slice(
                      right.range[0],
                      right.range[1],
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
        const isNullLiteralish = util.isNullableType(type, {
          allowUndefined: true,
        });
        if (!isNullLiteralish) {
          return;
        }

        if (ignoreConditionalTests === true && isConditionalTest(node)) {
          return;
        }

        const isMixedLogical = isMixedLogicalExpression(node);
        if (ignoreMixedLogicalExpressions === true && isMixedLogical) {
          return;
        }

        const barBarOperator = util.nullThrows(
          sourceCode.getTokenAfter(
            node.left,
            token =>
              token.type === AST_TOKEN_TYPES.Punctuator &&
              token.value === node.operator,
          ),
          util.NullThrowsReasons.MissingToken('operator', node.type),
        );

        function* fix(
          fixer: TSESLint.RuleFixer,
        ): IterableIterator<TSESLint.RuleFix> {
          if (node.parent && util.isLogicalOrOperator(node.parent)) {
            // '&&' and '??' operations cannot be mixed without parentheses (e.g. a && b ?? c)
            if (
              node.left.type === AST_NODE_TYPES.LogicalExpression &&
              !util.isLogicalOrOperator(node.left.left)
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
  const parents = new Set<TSESTree.Node | null>([node]);
  let current = node.parent;
  while (current) {
    parents.add(current);

    if (
      (current.type === AST_NODE_TYPES.ConditionalExpression ||
        current.type === AST_NODE_TYPES.DoWhileStatement ||
        current.type === AST_NODE_TYPES.IfStatement ||
        current.type === AST_NODE_TYPES.ForStatement ||
        current.type === AST_NODE_TYPES.WhileStatement) &&
      parents.has(current.test)
    ) {
      return true;
    }

    if (
      [
        AST_NODE_TYPES.ArrowFunctionExpression,
        AST_NODE_TYPES.FunctionExpression,
      ].includes(current.type)
    ) {
      /**
       * This is a weird situation like:
       * `if (() => a || b) {}`
       * `if (function () { return a || b }) {}`
       */
      return false;
    }

    current = current.parent;
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

    if (current && current.type === AST_NODE_TYPES.LogicalExpression) {
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

function getOperator(
  node: TSESTree.Expression,
): '==' | '!=' | '===' | '!==' | undefined {
  if (node.type === AST_NODE_TYPES.BinaryExpression) {
    if (
      node.operator === '==' ||
      node.operator === '!=' ||
      node.operator === '===' ||
      node.operator === '!=='
    ) {
      return node.operator;
    }
  } else if (
    node.type === AST_NODE_TYPES.LogicalExpression &&
    node.left.type === AST_NODE_TYPES.BinaryExpression &&
    node.right.type === AST_NODE_TYPES.BinaryExpression
  ) {
    if (node.operator === '||') {
      if (node.left.operator === '===' && node.right.operator === '===') {
        return '===';
      } else if (
        ((node.left.operator === '===' || node.right.operator === '===') &&
          (node.left.operator === '==' || node.right.operator === '==')) ||
        (node.left.operator === '==' && node.right.operator === '==')
      ) {
        return '==';
      }
    } else if (node.operator === '&&') {
      if (node.left.operator === '!==' && node.right.operator === '!==') {
        return '!==';
      } else if (
        ((node.left.operator === '!==' || node.right.operator === '!==') &&
          (node.left.operator === '!=' || node.right.operator === '!=')) ||
        (node.left.operator === '!=' && node.right.operator === '!=')
      ) {
        return '!=';
      }
    }
  }
  return;
}

function getNodes(node: TSESTree.Node): TSESTree.Node[] {
  if (node.type === AST_NODE_TYPES.BinaryExpression) {
    return [node.left, node.right];
  } else if (node.type === AST_NODE_TYPES.LogicalExpression) {
    return [...getNodes(node.left), ...getNodes(node.right)];
  }
  return [node];
}
