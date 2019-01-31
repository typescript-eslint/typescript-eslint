/**
 * @fileoverview Disallow unnecessary constructors
 * @author Armano <https://github.com/armano2>
 */
'use strict';

const baseRule = require('eslint/lib/rules/no-useless-constructor');
const util = require('../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = Object.assign({}, baseRule, {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unnecessary constructors',
      category: 'ECMAScript 6',
      url: util.metaDocsUrl('no-useless-constructor')
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages
  },

  create(context) {
    const rules = baseRule.create(context);

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      MethodDefinition(node) {
        if (!node.value || node.value.type !== 'FunctionExpression') {
          return;
        }
        if (
          node.value.params &&
          node.value.params.some(param => param.type === 'TSParameterProperty')
        ) {
          return;
        }
        rules.MethodDefinition(node);
      }
    };
  }
});
