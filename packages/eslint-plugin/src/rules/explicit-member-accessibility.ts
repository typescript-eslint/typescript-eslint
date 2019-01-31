/**
 * @fileoverview Enforces explicit accessibility modifier for class members
 * @author Danny Fritz
 */

import RuleModule from '../RuleModule';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule: RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require explicit accessibility modifiers on class properties and methods',
      extraDescription: [util.tslintRule('member-access')],
      category: 'TypeScript',
      url: util.metaDocsUrl('explicit-member-accessibility'),
      recommended: 'error'
    },
    schema: []
  },

  create(context) {
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Checks if a method declaration has an accessibility modifier.
     * @param {ASTNode} methodDefinition The node representing a MethodDefinition.
     */
    function checkMethodAccessibilityModifier(methodDefinition): void {
      if (
        !methodDefinition.accessibility &&
        util.isTypescript(context.getFilename())
      ) {
        context.report({
          node: methodDefinition,
          message:
            'Missing accessibility modifier on method definition {{name}}.',
          data: {
            name: methodDefinition.key.name
          }
        });
      }
    }

    /**
     * Checks if property has an accessibility modifier.
     * @param {ASTNode} classProperty The node representing a ClassProperty.
     */
    function checkPropertyAccessibilityModifier(classProperty): void {
      if (
        !classProperty.accessibility &&
        util.isTypescript(context.getFilename())
      ) {
        context.report({
          node: classProperty,
          message: 'Missing accessibility modifier on class property {{name}}.',
          data: {
            name: classProperty.key.name
          }
        });
      }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      ClassProperty: checkPropertyAccessibilityModifier,
      MethodDefinition: checkMethodAccessibilityModifier
    };
  }
};
export = rule;
