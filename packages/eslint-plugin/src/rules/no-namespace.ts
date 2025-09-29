import type { TSESTree } from '@typescript-eslint/utils';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isDefinitionFile } from '../util';

export type Options = [
  {
    allowDeclarations?: boolean;
    allowDefinitionFiles?: boolean;
  },
];
export type MessageIds = 'moduleSyntaxIsPreferred';

export default createRule<Options, MessageIds>({
  name: 'no-namespace',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow TypeScript namespaces',
      recommended: 'recommended',
    },
    messages: {
      moduleSyntaxIsPreferred:
        'ES2015 module syntax is preferred over namespaces.',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          allowDeclarations: {
            type: 'boolean',
            description:
              'Whether to allow `declare` with custom TypeScript namespaces.',
          },
          allowDefinitionFiles: {
            type: 'boolean',
            description:
              'Whether to allow `declare` with custom TypeScript namespaces inside definition files.',
          },
        },
      },
    ],
  },
  defaultOptions: [
    {
      allowDeclarations: false,
      allowDefinitionFiles: true,
    },
  ],
  create(context, [{ allowDeclarations, allowDefinitionFiles }]) {
    function isDeclaration(node: TSESTree.Node): boolean {
      if (node.type === AST_NODE_TYPES.TSModuleDeclaration && node.declare) {
        return true;
      }

      return node.parent != null && isDeclaration(node.parent);
    }

    return {
      "TSModuleDeclaration[global!=true][id.type!='Literal']"(
        node: TSESTree.TSModuleDeclaration,
      ): void {
        if (
          node.parent.type === AST_NODE_TYPES.TSModuleDeclaration ||
          (allowDefinitionFiles && isDefinitionFile(context.filename)) ||
          (allowDeclarations && isDeclaration(node))
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'moduleSyntaxIsPreferred',
        });
      },
    };
  },
});
