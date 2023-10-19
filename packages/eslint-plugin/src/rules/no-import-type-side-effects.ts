import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import {
  createRule,
  isImportKeyword,
  isTypeKeyword,
  nullThrows,
  NullThrowsReasons,
} from '../util';

type Options = [];
type MessageIds = 'useTopLevelQualifier';

export default createRule<Options, MessageIds>({
  name: 'no-import-type-side-effects',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce the use of top-level import type qualifier when an import only has specifiers with inline type qualifiers',
    },
    fixable: 'code',
    messages: {
      useTopLevelQualifier:
        'TypeScript will only remove the inline type specifiers which will leave behind a side effect import at runtime. Convert this to a top-level type qualifier to properly remove the entire import.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      'ImportDeclaration[importKind!="type"]'(
        node: TSESTree.ImportDeclaration,
      ): void {
        if (node.specifiers.length === 0) {
          return;
        }

        const specifiers: TSESTree.ImportSpecifier[] = [];
        for (const specifier of node.specifiers) {
          if (
            specifier.type !== AST_NODE_TYPES.ImportSpecifier ||
            specifier.importKind !== 'type'
          ) {
            return;
          }
          specifiers.push(specifier);
        }

        context.report({
          node,
          messageId: 'useTopLevelQualifier',
          fix(fixer) {
            const fixes: TSESLint.RuleFix[] = [];
            for (const specifier of specifiers) {
              const qualifier = nullThrows(
                sourceCode.getFirstToken(specifier, isTypeKeyword),
                NullThrowsReasons.MissingToken(
                  'type keyword',
                  'import specifier',
                ),
              );
              fixes.push(
                fixer.removeRange([
                  qualifier.range[0],
                  specifier.imported.range[0],
                ]),
              );
            }

            const importKeyword = nullThrows(
              sourceCode.getFirstToken(node, isImportKeyword),
              NullThrowsReasons.MissingToken('import keyword', 'import'),
            );
            fixes.push(fixer.insertTextAfter(importKeyword, ' type'));

            return fixes;
          },
        });
      },
    };
  },
});
