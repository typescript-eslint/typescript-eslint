/**
 * @fileoverview Disallows the use of custom TypeScript modules and namespaces.
 * @author Patricio Trevino
 */

import RuleModule from '../RuleModule';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
  {
    allowDeclarations: false,
    allowDefinitionFiles: true
  }
];

const rule: RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow the use of custom TypeScript modules and namespaces',
      extraDescription: [util.tslintRule('no-namespace')],
      category: 'TypeScript',
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

  create(context: Rule.RuleContext) {
    const { allowDeclarations, allowDefinitionFiles } = util.applyDefault(
      defaultOptions,
      context.options
    )[0];
    const filename = context.getFilename();

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      "TSModuleDeclaration[global!=true][id.type='Identifier']"(node) {
        if (
          (node.parent && node.parent.type === 'TSModuleDeclaration') ||
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
export = rule;
