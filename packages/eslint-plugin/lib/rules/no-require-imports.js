/**
 * @fileoverview Disallows invocation of `require()`.
 * @author Kanitkorn Sujautra
 */
'use strict';

const util = require('../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallows invocation of `require()`.',
      extraDescription: [util.tslintRule('no-require-imports')],
      category: 'TypeScript',
      url: util.metaDocsUrl('no-require-imports'),
      recommended: 'error'
    },
    schema: [],
    messages: {
      noRequireImports: 'A `require()` style import is forbidden.'
    }
  },
  create(context) {
    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      CallExpression(node) {
        if (node.callee.name === 'require') {
          context.report({
            node,
            messageId: 'noRequireImports'
          });
        }
      },
      TSExternalModuleReference(node) {
        context.report({
          node,
          messageId: 'noRequireImports'
        });
      }
    };
  }
};
