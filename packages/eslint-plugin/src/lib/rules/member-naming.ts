/**
 * @fileoverview Enforces naming conventions for class members by visibility.
 * @author Ian MacLeod
 */

import { Rule } from 'eslint';
import * as util from '../util';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

interface Options<T = string> {
  private?: T;
  protected?: T;
  public?: T;
}
type Modifiers = keyof Options;

const defaultOptions: Options[] = [{}];

const rule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforces naming conventions for class members by visibility.',
      category: 'TypeScript',
      url: util.metaDocsUrl('member-naming'),
      recommended: false
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

  create(context: Rule.RuleContext) {
    const config = util.applyDefault(defaultOptions, context.options)[0];
    const conventions = (Object.keys(config) as Modifiers[]).reduce(
      (acc, accessibility) => {
        acc[accessibility] = new RegExp(config[accessibility]!);

        return acc;
      },
      {} as Options<RegExp>
    );

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
    function validateName(node): void {
      const name = node.key.name;
      const accessibility: Modifiers = node.accessibility || 'public';
      const convention = conventions[accessibility];

      if (!convention || convention.test(name)) return;

      context.report({
        node: node.key,
        message:
          '{{accessibility}} property {{name}} should match {{convention}}.',
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
export = rule;
