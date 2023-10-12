import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import { createRule, isDefinitionFile } from '../util';

type Options = [
  {
    allowDeclarations?: boolean;
    allowDefinitionFiles?: boolean;
  },
];
type MessageIds = 'moduleSyntaxIsPreferred';

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
        properties: {
          allowDeclarations: {
            description:
              'Whether to allow `declare` with custom TypeScript namespaces.',
            type: 'boolean',
          },
          allowDefinitionFiles: {
            description:
              'Whether to allow `declare` with custom TypeScript namespaces inside definition files.',
            type: 'boolean',
          },
        },
        additionalProperties: false,
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
    const filename = context.getFilename();

    function isDeclaration(node: TSESTree.Node): boolean {
      if (
        node.type === AST_NODE_TYPES.TSModuleDeclaration &&
        node.declare === true
      ) {
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
          (allowDefinitionFiles && isDefinitionFile(filename)) ||
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
