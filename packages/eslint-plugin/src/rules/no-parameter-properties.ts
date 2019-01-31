/**
 * @fileoverview Disallows parameter properties in class constructors.
 * @author Patricio Trevino
 */

import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const defaultOptions = [
  {
    allows: []
  }
];

const rule: RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the use of parameter properties in class constructors.',
      extraDescription: [util.tslintRule('no-parameter-properties')],
      category: 'TypeScript',
      url: util.metaDocsUrl('no-parameter-properties'),
      recommended: 'error'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allows: {
            type: 'array',
            items: {
              enum: [
                'readonly',
                'private',
                'protected',
                'public',
                'private readonly',
                'protected readonly',
                'public readonly'
              ]
            },
            minItems: 1
          }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const { allows } = util.applyDefault(defaultOptions, context.options)[0];

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Gets the modifiers of `node`.
     * @param {ASTNode} node the node to be inspected.
     */
    function getModifiers(node): string {
      const modifiers = [];

      modifiers.push(node.accessibility);
      if (node.readonly || node.isReadonly) {
        modifiers.push('readonly');
      }

      return modifiers.filter(Boolean).join(' ');
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      TSParameterProperty(node) {
        const modifiers = getModifiers(node);

        if (allows.indexOf(modifiers) === -1) {
          context.report({
            node,
            message:
              'Property {{parameter}} cannot be declared in the constructor.',
            data: {
              parameter: node.parameter.name
            }
          });
        }
      }
    };
  }
};
export = rule;
