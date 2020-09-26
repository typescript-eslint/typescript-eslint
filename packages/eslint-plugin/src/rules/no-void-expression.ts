import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

export type Options = [
  {
    ignoreArrowShorthand?: boolean;
    ignoreVoidOperator?: boolean;
  },
];

export type MessageId = 'invalidVoidExpr' | 'invalidVoidArrowExpr';

const defaultOptions = {
  ignoreArrowShorthand: false,
  ignoreVoidOperator: true,
};
export default util.createRule<Options, MessageId>({
  name: 'no-void-expression',
  meta: {
    docs: {
      description:
        'Requires expressions of type void to appear in statement position',
      category: 'Best Practices',
      recommended: false,
      requiresTypeChecking: true,
    },
    messages: {
      invalidVoidExpr: 'Unexpected void expression used in another expression.',
      invalidVoidArrowExpr:
        'Unexpected void expression returned from arrow function.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreArrowShorthand: { type: 'boolean' },
          ignoreVoidOperator: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [defaultOptions],
  create(context) {
    const options = { ...defaultOptions, ...context.options[0] };
    return {
      'AwaitExpression, CallExpression, TaggedTemplateExpression'(
        node:
          | TSESTree.AwaitExpression
          | TSESTree.CallExpression
          | TSESTree.TaggedTemplateExpression,
      ): void {
        const sourceCode = context.getSourceCode();
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = util.getConstrainedTypeAtLocation(checker, tsNode);

        if (!isParentAllowed(node)) {
          if (tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike)) {
            if (options.ignoreVoidOperator) {
              // this would be reported by this rule btw. such irony
              return context.report({
                node,
                messageId: 'invalidVoidExpr',
                fix: fixer => {
                  const nodeText = sourceCode.getText(node);
                  return fixer.replaceText(node, `void ${nodeText}`);
                },
              });
            }

            if (node.parent?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
              return context.report({
                node,
                messageId: 'invalidVoidArrowExpr',
                fix: fixer => {
                  const nodeText = sourceCode.getText(node);
                  return fixer.replaceText(node, `{ ${nodeText}; }`);
                },
              });
            }

            context.report({
              node,
              messageId: 'invalidVoidExpr',
            });
          }
        }
      },
    };

    function isParentAllowed(node: TSESTree.Node): boolean {
      if (node.parent == null) {
        return true;
      }
      switch (node.parent.type) {
        case AST_NODE_TYPES.ExpressionStatement:
          // e.g. `console.log("foo");`
          return true;
        case AST_NODE_TYPES.LogicalExpression:
          // e.g. `x && console.log(x);`
          return isParentAllowed(node.parent);
        case AST_NODE_TYPES.ConditionalExpression:
          // e.g. `cond ? console.log(true) : console.log(false);`
          return isParentAllowed(node.parent);
        case AST_NODE_TYPES.ArrowFunctionExpression:
          // e.g. `() => console.log("foo")`
          return options.ignoreArrowShorthand;
        case AST_NODE_TYPES.UnaryExpression:
          if (node.parent.operator === 'void') {
            // e.g. `void console.log("foo")`
            return options.ignoreVoidOperator;
          }
          return false;
        default:
          return false;
      }
    }
  },
});
