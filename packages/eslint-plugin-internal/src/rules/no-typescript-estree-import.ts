import { createRule } from '../util';

const TSESTREE_NAME = '@typescript-eslint/typescript-estree';
const UTILS_NAME = '@typescript-eslint/experimental-utils';

/*
Typescript will not error if people use typescript-estree within eslint-plugin.
This is because it's an indirect dependency.
We don't want people to import it, instead we want them to import from the utils package.
*/

export default createRule({
  name: 'no-typescript-estree-import',
  meta: {
    type: 'problem',
    docs: {
      description: `Enforces that eslint-plugin rules don't require anything from ${TSESTREE_NAME}`,
      category: 'Possible Errors',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      dontImportTSEStree: [
        `Don't import from ${TSESTREE_NAME}. Everything you need should be available in ${UTILS_NAME}.`,
        `${TSESTREE_NAME} is an indirect dependency of this package, and thus should not be used directly.`,
      ].join('\n'),
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node): void {
        if (
          typeof node.source.value === 'string' &&
          node.source.value.startsWith(TSESTREE_NAME)
        ) {
          context.report({
            node,
            messageId: 'dontImportTSEStree',
            fix(fixer) {
              return fixer.replaceTextRange(
                [node.source.range[0] + 1, node.source.range[1] - 1],
                UTILS_NAME,
              );
            },
          });
        }
      },
    };
  },
});
