/**
 * @fileoverview Prevent TypeScript-specific variables being falsely marked as unused
 * @author James Henry
 */
'use strict';

const baseRule = require('eslint/lib/rules/no-unused-vars');
const util = require('../util');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = Object.assign({}, baseRule, {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unused variables',
      extraDescription: [util.tslintRule('no-unused-variable')],
      category: 'Variables',
      url: util.metaDocsUrl('no-unused-vars'),
      recommended: 'warn'
    },
    schema: baseRule.meta.schema,
    messages: baseRule.meta.messages
  },

  create(context) {
    const rules = baseRule.create(context);

    /**
     * Mark this function parameter as used
     * @param {Identifier} node The node currently being traversed
     * @returns {void}
     */
    function markThisParameterAsUsed(node) {
      if (node.name) {
        const variable = context
          .getScope()
          .variables.find(scopeVar => scopeVar.name === node.name);

        if (variable) {
          variable.eslintUsed = true;
        }
      }
    }

    /**
     * Mark heritage clause as used
     * @param node The node currently being traversed
     * @returns {void}
     */
    function markHeritageAsUsed(node) {
      switch (node.type) {
        case 'Identifier':
          context.markVariableAsUsed(node.name);
          break;
        case 'MemberExpression':
          markHeritageAsUsed(node.object);
          break;
        case 'CallExpression':
          markHeritageAsUsed(node.callee);
          break;
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return Object.assign({}, rules, {
      "FunctionDeclaration Identifier[name='this']": markThisParameterAsUsed,
      "FunctionExpression Identifier[name='this']": markThisParameterAsUsed,
      'TSTypeReference Identifier'(node) {
        context.markVariableAsUsed(node.name);
      },
      TSInterfaceHeritage(node) {
        if (node.expression) {
          markHeritageAsUsed(node.expression);
        }
      },
      TSClassImplements(node) {
        if (node.expression) {
          markHeritageAsUsed(node.expression);
        }
      },
      'TSParameterProperty Identifier'(node) {
        // just assume parameter properties are used
        context.markVariableAsUsed(node.name);
      },
      'TSEnumMember Identifier'(node) {
        context.markVariableAsUsed(node.name);
      },
      '*[declare=true] Identifier'(node) {
        context.markVariableAsUsed(node.name);
        const scope = context.getScope();
        const { variableScope } = scope;
        if (variableScope !== scope) {
          const superVar = variableScope.set.get(node.name);
          if (superVar) superVar.eslintUsed = true;
        }
      }
    });
  }
});
