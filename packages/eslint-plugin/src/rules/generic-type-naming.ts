/**
 * @fileoverview Enforces naming of generic type variables.
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import RuleModule from 'ts-eslint';
import * as util from '../util';

type Options = [string];

const defaultOptions: Options = [
  // Matches: T , TA , TAbc , TA1Bca , T1 , T2
  '^T([A-Z0-9][a-zA-Z0-9]*){0,1}$'
];

const rule: RuleModule<'paramNotMatchRule', Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces naming of generic type variables',
      category: 'Stylistic Issues',
      recommended: false,
      url: util.metaDocsUrl('generic-type-naming')
    },
    messages: {
      paramNotMatchRule: 'Type parameter {{name}} does not match rule {{rule}}.'
    },
    schema: [
      {
        type: 'string'
      }
    ]
  },

  create(context) {
    const rule = util.applyDefault(defaultOptions, context.options)[0];
    const regex = new RegExp(rule);

    return {
      TSTypeParameter(node: TSESTree.TSTypeParameter) {
        const name = node.name.name;

        if (name && !regex.test(name)) {
          context.report({
            node,
            messageId: 'paramNotMatchRule',
            data: {
              name,
              rule
            }
          });
        }
      }
    };
  }
};
export = rule;
