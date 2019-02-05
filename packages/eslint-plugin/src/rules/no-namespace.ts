/**
 * @fileoverview Disallows the use of custom TypeScript modules and namespaces.
 * @author Patricio Trevino
 */

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Options = [
  {
    allowDeclarations?: boolean;
    allowDefinitionFiles?: boolean;
  }
];
type MessageIds = 'moduleSyntaxIsPreferred';

const defaultOptions: Options = [
  {
    allowDeclarations: false,
    allowDefinitionFiles: true
  }
];

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow the use of custom TypeScript modules and namespaces',
      extraDescription: [util.tslintRule('no-namespace')],
      category: 'Best Practices',
      url: util.metaDocsUrl('no-namespace'),
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

  create(context) {
    const { allowDeclarations, allowDefinitionFiles } = util.applyDefault(
      defaultOptions,
      context.options
    )[0];
    const filename = context.getFilename();

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
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
};
export default rule;
