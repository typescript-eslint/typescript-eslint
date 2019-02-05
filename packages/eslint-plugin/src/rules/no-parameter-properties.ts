/**
 * @fileoverview Disallows parameter properties in class constructors.
 * @author Patricio Trevino
 */

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

type Modifier =
  | 'readonly'
  | 'private'
  | 'protected'
  | 'public'
  | 'private readonly'
  | 'protected readonly'
  | 'public readonly';
type Options = [
  {
    allows: Modifier[];
  }
];
type MessageIds = 'noParamProp';

const defaultOptions: Options = [
  {
    allows: []
  }
];

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the use of parameter properties in class constructors.',
      extraDescription: [util.tslintRule('no-parameter-properties')],
      category: 'Stylistic Issues',
      url: util.metaDocsUrl('no-parameter-properties'),
      recommended: 'error'
    },
    messages: {
      noParamProp:
        'Property {{parameter}} cannot be declared in the constructor.'
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
     * @param node the node to be inspected.
     */
    function getModifiers(node: TSESTree.TSParameterProperty): Modifier {
      const modifiers: Modifier[] = [];

      if (node.accessibility) {
        modifiers.push(node.accessibility);
      }
      if (node.readonly) {
        modifiers.push('readonly');
      }

      return modifiers.filter(Boolean).join(' ') as Modifier;
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------
    return {
      TSParameterProperty(node: TSESTree.TSParameterProperty) {
        const modifiers = getModifiers(node);

        if (allows.indexOf(modifiers) === -1) {
          // HAS to be an identifier or assignment or TSC will throw
          if (
            node.parameter.type !== AST_NODE_TYPES.Identifier &&
            node.parameter.type !== AST_NODE_TYPES.AssignmentPattern
          ) {
            return;
          }

          const name =
            node.parameter.type === AST_NODE_TYPES.Identifier
              ? node.parameter.name
              : // has to be an Identifier or TSC will throw an error
                (node.parameter.left as TSESTree.Identifier).name;

          context.report({
            node,
            messageId: 'noParamProp',
            data: {
              parameter: name
            }
          });
        }
      }
    };
  }
};
export default rule;
