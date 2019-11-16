import {
  AST_TOKEN_TYPES,
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import ts from 'typescript';
import * as util from '../util';

export type Options = [
  {
    ignoreConditionalTests?: boolean;
    ignoreMixedLogicalExpressions?: boolean;
  },
];
export type MessageIds = 'preferNullish';

export default util.createRule<Options, MessageIds>({
  name: 'prefer-nullish-coalescing',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce the usage of the nullish coalescing operator instead of logical chaining',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    fixable: 'code',
    messages: {
      preferNullish:
        'Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreConditionalTests: {
            type: 'boolean',
          },
          ignoreMixedLogicalExpressions: {
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
      ignoreMixedLogicalExpressions: true,
    },
  ],
  create(context, [{ ignoreConditionalTests, ignoreMixedLogicalExpressions }]) {
    const parserServices = util.getParserServices(context);
    const sourceCode = context.getSourceCode();
    const checker = parserServices.program.getTypeChecker();

    return {
      'LogicalExpression[operator = "||"]'(
        node: TSESTree.LogicalExpression,
      ): void {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get<
          ts.BinaryExpression
        >(node);
        const type = checker.getTypeAtLocation(tsNode.left);
        const isNullish = util.isNullableType(type, { allowUndefined: true });
        if (!isNullish) {
          return;
        }

        if (ignoreConditionalTests === true && isConditionalTest(node)) {
          return;
        }

        if (
          ignoreMixedLogicalExpressions === true &&
          isMixedLogicalExpression(node)
        ) {
          return;
        }

        const barBarOperator = sourceCode.getTokenAfter(
          node.left,
          token =>
            token.type === AST_TOKEN_TYPES.Punctuator &&
            token.value === node.operator,
        )!; // there _must_ be an operator
        context.report({
          node: barBarOperator,
          messageId: 'preferNullish',
          fix(fixer) {
            return fixer.replaceText(barBarOperator, '??');
          },
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
