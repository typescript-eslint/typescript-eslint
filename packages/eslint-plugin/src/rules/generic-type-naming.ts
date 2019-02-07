import { TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

type Options = [string?];
type MessageIds = 'paramNotMatchRule';

export default util.createRule<Options, MessageIds>({
  name: 'generic-type-naming',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforces naming of generic type variables',
      category: 'Stylistic Issues',
      recommended: false
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
  defaultOptions: [
    // Matches: T , TA , TAbc , TA1Bca , T1 , T2
    '^T([A-Z0-9][a-zA-Z0-9]*){0,1}$'
  ],
  create(context, [rule]) {
    const regex = new RegExp(rule!);

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
});
