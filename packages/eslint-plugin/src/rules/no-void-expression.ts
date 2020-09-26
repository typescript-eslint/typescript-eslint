import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as tsutils from 'tsutils';
import * as ts from 'typescript';
import * as util from '../util';

export type Options = [
  {
    // ignoreArrowShorthand: boolean;
  },
];

export type MessageId = 'invalidVoidExpr';

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
      invalidVoidExpr: '',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreArrowShorthand: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [
    {
      // ignoreArrowShorthand: false,
    },
  ],
  create(context) {
    return {
      'AwaitExpression, CallExpression, TaggedTemplateExpression'(
        node:
          | TSESTree.AwaitExpression
          | TSESTree.CallExpression
          | TSESTree.TaggedTemplateExpression,
      ): void {
        const parserServices = util.getParserServices(context);
        const checker = parserServices.program.getTypeChecker();
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node);
        const type = util.getConstrainedTypeAtLocation(checker, tsNode);
        if (!isParentAllowed(node)) {
          if (tsutils.isTypeFlagSet(type, ts.TypeFlags.VoidLike)) {
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
        default:
          return false;
      }
    }
  },
});
