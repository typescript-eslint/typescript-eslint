import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import * as util from '../util';

type Options = [
  {
    allowDeclarations?: boolean;
    allowDefinitionFiles?: boolean;
  },
];
type MessageIds = 'moduleSyntaxIsPreferred';

export default util.createRule<Options, MessageIds>({
  name: 'no-namespace',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow custom TypeScript modules and namespaces',
      recommended: 'error',
    },
    messages: {
      moduleSyntaxIsPreferred:
        'ES2015 module syntax is preferred over custom TypeScript modules and namespaces.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowDeclarations: {
            type: 'boolean',
          },
          allowDefinitionFiles: {
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
      "TSModuleDeclaration[global!=true][id.type='Identifier']"(
        node: TSESTree.TSModuleDeclaration,
      ): void {
        if (
          node.parent.type === AST_NODE_TYPES.TSModuleDeclaration ||
          (allowDefinitionFiles && util.isDefinitionFile(filename)) ||
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
