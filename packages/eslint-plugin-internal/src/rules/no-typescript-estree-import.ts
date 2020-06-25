import { createRule } from '../util';

const TSESTREE_NAME = '@typescript-eslint/typescript-estree';
const TYPES_NAME = '@typescript-eslint/types';
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
      description: `Enforces that eslint-plugin rules don't require anything from ${TSESTREE_NAME} or ${TYPES_NAME}`,
      category: 'Possible Errors',
      recommended: 'error',
    },
    fixable: 'code',
    schema: [],
    messages: {
      dontImportPackage: [
        `Don't import from {{packageName}}. Everything you need should be available in ${UTILS_NAME}.`,
        `{{packageName}} is an indirect dependency of this package, and thus should not be used directly.`,
      ].join('\n'),
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node): void {
        if (typeof node.source.value !== 'string') {
          return;
        }

        let packageName: string | null = null;
        if (node.source.value.startsWith(TSESTREE_NAME)) {
          packageName = TSESTREE_NAME;
        } else if (node.source.value.startsWith(TYPES_NAME)) {
          packageName = TYPES_NAME;
        }

        if (packageName != null) {
          context.report({
            node,
            messageId: 'dontImportPackage',
            data: {
              packageName,
            },
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
