import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils';
import * as util from '../util';

export type Options = ['property' | 'method'];

export type MessageId = 'errorMethod' | 'errorProperty';

export default util.createRule<Options, MessageId>({
  name: 'method-signature-style',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces using a particular method signature syntax.',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      errorMethod:
        'Shorthand method signature is forbidden. Use a function property instead.',
      errorProperty:
        'Function property signature is forbidden. Use a method shorthand instead.',
    },
    schema: [
      {
        enum: ['property', 'method'],
      },
    ],
  },
  defaultOptions: ['property'],

  create(context, [mode]) {
    const sourceCode = context.getSourceCode();

    return {
      TSMethodSignature(node): void {
        if (mode === 'method') {
          return;
        }

        context.report({ node, messageId: 'errorMethod' });
      },
      TSPropertySignature(node): void {
        if (
          node.typeAnnotation?.typeAnnotation.type !==
          AST_NODE_TYPES.TSFunctionType
        ) {
          return;
        }

        if (mode === 'property') {
          return;
        }

        context.report({ node, messageId: 'errorProperty' });
      },
    };
  },
});
