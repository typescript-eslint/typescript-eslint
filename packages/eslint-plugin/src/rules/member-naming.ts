/**
 * @fileoverview Enforces naming conventions for class members by visibility.
 * @author Ian MacLeod
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';
import { getNameFromPropertyName } from '../tsestree-utils';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

interface Config<T = string> {
  private?: T;
  protected?: T;
  public?: T;
}
type Modifiers = keyof Config;
type Options = [Config];
type MessageIds = 'incorrectName';

const defaultOptions: Options = [{}];

const rule: RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces naming conventions for class members by visibility.',
      category: 'Stylistic Issues',
      url: util.metaDocsUrl('member-naming'),
      recommended: false
    },
    messages: {
      incorrectName:
        '{{accessibility}} property {{name}} should match {{convention}}.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          public: {
            type: 'string',
            minLength: 1,
            format: 'regex'
          },
          protected: {
            type: 'string',
            minLength: 1,
            format: 'regex'
          },
          private: {
            type: 'string',
            minLength: 1,
            format: 'regex'
          }
        },
        additionalProperties: false,
        minProperties: 1
      }
    ]
  },

  create(context) {
    const config = util.applyDefault(defaultOptions, context.options)[0];
    const conventions = (Object.keys(config) as Modifiers[]).reduce<
      Config<RegExp>
    >((acc, accessibility) => {
      acc[accessibility] = new RegExp(config[accessibility]!);

      return acc;
    }, {});

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------

    /**
     * Check that the property name matches the convention for its
     * accessibility.
     * @param {ASTNode} node the named node to evaluate.
     * @returns {void}
     * @private
     */
    function validateName(
      node: TSESTree.MethodDefinition | TSESTree.ClassProperty
    ): void {
      const name = getNameFromPropertyName(node.key);
      const accessibility: Modifiers = node.accessibility || 'public';
      const convention = conventions[accessibility];

      if (!convention || convention.test(name)) return;

      context.report({
        node: node.key,
        messageId: 'incorrectName',
        data: { accessibility, name, convention }
      });
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      MethodDefinition: validateName,
      ClassProperty: validateName
    };
  }
};
export default rule;
