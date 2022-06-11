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
  | 'preferNullish'
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
      preferNullish:
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

        let identifier: TSESTree.Identifier | TSESTree.MemberExpression;
        let alternate: TSESTree.Expression;
        let requiredOperator: '!==' | '===';
        if (
          (node.consequent.type === AST_NODE_TYPES.Identifier ||
            node.consequent.type === AST_NODE_TYPES.MemberExpression) &&
          ((node.test.type === AST_NODE_TYPES.BinaryExpression &&
            (node.test.operator === '!==' || node.test.operator === '!=')) ||
            (node.test.type === AST_NODE_TYPES.LogicalExpression &&
              node.test.left.type === AST_NODE_TYPES.BinaryExpression &&
              (node.test.left.operator === '!==' ||
                node.test.left.operator === '!=')))
        ) {
          identifier = node.consequent;
          alternate = node.alternate;
          requiredOperator = '!==';
        } else if (
          node.alternate.type === AST_NODE_TYPES.Identifier ||
          node.alternate.type === AST_NODE_TYPES.MemberExpression
        ) {
          identifier = node.alternate;
          alternate = node.consequent;
          requiredOperator = '===';
        } else {
          return;
        }

        if (
          isFixableLooseTernary({
            requiredOperator,
            identifier,
            node,
          }) ||
          isFixableExplicitTernary({
            requiredOperator,
            identifier,
            node,
          }) ||
          isFixableImplicitTernary({
            parserServices,
            checker,
            requiredOperator,
            identifier,
            node,
          })
        ) {
          context.report({
            node,
            messageId: 'preferNullishOverTernary',
            suggest: [
              {
                messageId: 'suggestNullish',
                fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
                  return fixer.replaceText(
                    node,
                    `${sourceCode.text.slice(
                      identifier.range[0],
                      identifier.range[1],
                    )} ?? ${sourceCode.text.slice(
                      alternate.range[0],
                      alternate.range[1],
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
          messageId: 'preferNullish',
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

/**
 * This is for ternary expressions where we check both undefined and null.
 * example: foo === undefined && foo === null ? 'a string' : foo
 * output: foo ?? 'a string'
 */
function isFixableExplicitTernary({
  requiredOperator,
  identifier,
  node,
}: {
  requiredOperator: '!==' | '===';
  identifier: TSESTree.Identifier | TSESTree.MemberExpression;
  node: TSESTree.ConditionalExpression;
}): boolean {
  if (node.test.type !== AST_NODE_TYPES.LogicalExpression) {
    return false;
  }
  if (requiredOperator === '===' && node.test.operator === '&&') {
    return false;
  }
  const { left, right } = node.test;
  if (
    left.type !== AST_NODE_TYPES.BinaryExpression ||
    right.type !== AST_NODE_TYPES.BinaryExpression
  ) {
    return false;
  }

  if (
    left.operator !== requiredOperator ||
    right.operator !== requiredOperator
  ) {
    return false;
  }

  const hasUndefinedCheck =
    (util.isNodeEqual(identifier, left.left) &&
      util.isUndefinedIdentifier(left.right)) ||
    (util.isNodeEqual(identifier, left.right) &&
      util.isUndefinedIdentifier(left.left)) ||
    (util.isNodeEqual(identifier, right.left) &&
      util.isUndefinedIdentifier(right.right)) ||
    (util.isNodeEqual(identifier, right.right) &&
      util.isUndefinedIdentifier(right.left));

  if (!hasUndefinedCheck) {
    return false;
  }

  const hasNullCheck =
    (util.isNodeEqual(identifier, left.left) &&
      util.isNullLiteral(left.right)) ||
    (util.isNodeEqual(identifier, left.right) &&
      util.isNullLiteral(left.left)) ||
    (util.isNodeEqual(identifier, right.left) &&
      util.isNullLiteral(right.right)) ||
    (util.isNodeEqual(identifier, right.right) &&
      util.isNullLiteral(right.left));

  return hasNullCheck;
}

/*
 * this is for ternary expressions where == or != is used.
 * example: foo == null ? 'a string' : a
 * example: foo != undefined ? a : 'a string'
 */
function isFixableLooseTernary({
  node,
  identifier,
  requiredOperator,
}: {
  requiredOperator: '!==' | '===';
  identifier: TSESTree.Identifier | TSESTree.MemberExpression;
  node: TSESTree.ConditionalExpression;
}): boolean {
  if (node.test.type !== AST_NODE_TYPES.BinaryExpression) {
    return false;
  }

  const { left, right, operator } = node.test;
  if (requiredOperator === '===' && operator !== '==') {
    return false;
  }
  if (requiredOperator === '!==' && operator !== '!=') {
    return false;
  }

  if (
    util.isNodeEqual(identifier, right) &&
    (util.isNullLiteral(left) || util.isUndefinedIdentifier(left))
  ) {
    return true;
  }

  if (
    util.isNodeEqual(identifier, left) &&
    (util.isNullLiteral(right) || util.isUndefinedIdentifier(right))
  ) {
    return true;
  }

  return false;
}

/**
 * This is for ternary expressions where we check only undefined or null and
 * need to type information to ensure that our checks are still correct.
 * example: const foo:? string = 'bar';
 *          foo !== undefined ? foo : 'a string';
 * output: foo ?? 'a string'
 */
function isFixableImplicitTernary({
  parserServices,
  checker,
  requiredOperator,
  identifier,
  node,
}: {
  parserServices: ReturnType<typeof util.getParserServices>;
  checker: ts.TypeChecker;
  requiredOperator: '!==' | '===';
  identifier: TSESTree.Identifier | TSESTree.MemberExpression;
  node: TSESTree.ConditionalExpression;
}): boolean {
  if (node.test.type !== AST_NODE_TYPES.BinaryExpression) {
    return false;
  }
  const { left, right, operator } = node.test;
  if (operator !== requiredOperator) {
    return false;
  }

  const i = util.isNodeEqual(identifier, left)
    ? left
    : util.isNodeEqual(identifier, right)
    ? right
    : null;
  if (!i) {
    return false;
  }

  const tsNode = parserServices.esTreeNodeToTSNodeMap.get(i);
  const type = checker.getTypeAtLocation(tsNode);
  const flags = util.getTypeFlags(type);

  if (flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return false;
  }

  const hasNullType = (flags & ts.TypeFlags.Null) !== 0;
  const hasUndefinedType = (flags & ts.TypeFlags.Undefined) !== 0;

  if (
    hasNullType &&
    !hasUndefinedType &&
    (util.isNullLiteral(right) || util.isNullLiteral(left))
  ) {
    return true;
  }

  if (
    hasUndefinedType &&
    !hasNullType &&
    (util.isUndefinedIdentifier(right) || util.isUndefinedIdentifier(left))
  ) {
    return true;
  }

  return false;
}
