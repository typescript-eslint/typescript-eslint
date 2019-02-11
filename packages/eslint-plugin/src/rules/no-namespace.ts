/**
 * @fileoverview Disallows the use of custom TypeScript modules and namespaces.
 * @author Patricio Trevino
 */

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

type Options = [
  {
    allowDeclarations?: boolean;
    allowDefinitionFiles?: boolean;
  }
];
type MessageIds = 'moduleSyntaxIsPreferred';

export default util.createRule<Options, MessageIds>({
  name: 'no-namespace',
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow the use of custom TypeScript modules and namespaces',
      tslintRuleName: 'no-namespace',
      category: 'Best Practices',
      recommended: 'error'
    },
    messages: {
      moduleSyntaxIsPreferred:
        'ES2015 module syntax is preferred over custom TypeScript modules and namespaces.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowDeclarations: {
            type: 'boolean'
          },
          allowDefinitionFiles: {
            type: 'boolean'
          }
        },
        additionalProperties: false
      }
    ]
  },
  defaultOptions: [
    {
      allowDeclarations: false,
      allowDefinitionFiles: true
    }
  ],
  create(context, [{ allowDeclarations, allowDefinitionFiles }]) {
    const filename = context.getFilename();

    return {
      "TSModuleDeclaration[global!=true][id.type='Identifier']"(
        node: TSESTree.TSModuleDeclaration
      ) {
        if (
          (node.parent &&
            node.parent.type === AST_NODE_TYPES.TSModuleDeclaration) ||
          (allowDefinitionFiles && util.isDefinitionFile(filename)) ||
          (allowDeclarations && node.declare === true)
        ) {
          return;
        }

        context.report({
          node,
          messageId: 'moduleSyntaxIsPreferred'
        });
      }
    };
  }
});
