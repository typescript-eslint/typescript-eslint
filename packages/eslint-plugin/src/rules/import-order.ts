/**
 * @fileoverview Disallows the use of require statements except in import statements.
 * @author Macklin Underdown
 */

import { TSESTree } from '@typescript-eslint/typescript-estree';
import * as util from '../util';

type Options = [];
type MessageIds = 'sourceOrder' | 'namedOrder';

export default util.createRule<Options, MessageIds>({
  name: 'import-order',
  meta: {
    type: 'problem',
    docs: {
      description: 'Specifiers the ordering of import statements',
      // tslintRuleName: 'ordered-imports',
      category: 'Stylistic Issues',

      recommended: 'error'
    },
    messages: {
      sourceOrder: 'Import sources must be alphabetized.',
      namedOrder: 'Named imports must be alphabetized.'
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    let previousNode: TSESTree.ImportDeclaration | undefined = undefined;

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        const localSpecifiers = node.specifiers
          .filter(specifier => specifier.type === 'ImportSpecifier')
          .map(specifier => specifier.local);
        const outOfOrderLocalSpecifiers = spefifiersOutOfOrder(localSpecifiers);

        if (outOfOrderLocalSpecifiers) {
          const [first, second] = outOfOrderLocalSpecifiers;
          context.report({
            node,
            messageId: 'namedOrder',
            loc: {
              start: first.loc.start,
              end: second.loc.end
            }
          });
        }

        if (previousNode) {
          if (
            'value' in node.source &&
            typeof node.source.value === 'string' &&
            'value' in previousNode.source &&
            typeof previousNode.source.value === 'string' &&
            node.source.value.toUpperCase() <
              previousNode.source.value.toUpperCase()
          ) {
            context.report({
              node,
              messageId: 'sourceOrder',
              loc: {
                start: previousNode.loc.start,
                end: node.loc.end
              }
            });
          }
        }

        previousNode = node;
      }
    };
  }
});

function spefifiersOutOfOrder(specifiers: TSESTree.Identifier[]) {
  return pairwise(specifiers).find(
    ([first, second]) => second.name.toUpperCase() < first.name.toUpperCase()
  );
}

function pairwise<T>(xs: T[]): [T, T][] {
  const pairs: [T, T][] = [];
  for (let i = 1; i < xs.length; i++) {
    pairs.push([xs[i - 1], xs[i]]);
  }
  return pairs;
}
