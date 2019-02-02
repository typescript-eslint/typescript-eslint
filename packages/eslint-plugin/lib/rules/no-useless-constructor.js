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

/**
 * Check if method with accessibility is not useless
 * @param {MethodDefinition} node
 * @returns {boolean}
 */
function checkAccessibility(node) {
  switch (node.accessibility) {
    case 'protected':
    case 'private':
      return false;
    case 'public':
      if (
        node.parent.type === 'ClassBody' &&
        node.parent.parent &&
        node.parent.parent.superClass
      ) {
        return false;
      }
      break;
  }
  return true;
}

/**
 * Check if method is not unless due to typescript parameter properties
 * @param {MethodDefinition} node
 * @returns {boolean}
 */
function checkParams(node) {
  return (
    !node.value.params ||
    !node.value.params.some(param => param.type === 'TSParameterProperty')
  );
}

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
        if (
          node.value &&
          node.value.type === 'FunctionExpression' &&
          checkAccessibility(node) &&
          checkParams(node)
        ) {
          rules.MethodDefinition(node);
        }
      }
    };
  }
});
