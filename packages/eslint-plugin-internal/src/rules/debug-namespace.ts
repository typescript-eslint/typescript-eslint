import type { TSESTree } from '@typescript-eslint/utils';

import { getStaticValue } from '@typescript-eslint/utils/ast-utils';

import { createRule } from '../util';

function filePathToNamespace(filePath: string) {
  const matched =
    /typescript-eslint[\\/]+packages[\\/]+([a-z-]+)[\\/]+(.+)/.exec(filePath);
  if (!matched) {
    return;
  }
  const [, packageName, relativeFilePath] = matched;

  const relativeFilePathProcessed = relativeFilePath
    .replace(/^(?:dist|lib|src)\//, '')
    .replace(/\.\w+$/, '')
    .replaceAll(/[^a-z0-9-]+/gi, ':');

  return `typescript-eslint:${packageName}:${relativeFilePathProcessed}`;
}

export default createRule({
  name: __filename,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce consistent debug() namespaces based on package name and file path',
    },
    fixable: 'code',
    messages: {
      mismatched:
        'debug() namespace should match package and file. Use the fixer to update it.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const expected = filePathToNamespace(context.filename);
    if (!expected) {
      return {};
    }

    return {
      'VariableDeclarator[id.name="log"] > CallExpression[arguments.length=1][callee.name="debug"]'(
        node: TSESTree.CallExpression,
      ) {
        const [argument] = node.arguments;
        const staticValue = getStaticValue(argument);
        if (
          typeof staticValue?.value !== 'string' ||
          staticValue.value === expected
        ) {
          return;
        }

        context.report({
          node: argument,
          messageId: 'mismatched',
          fix: fixer => fixer.replaceText(argument, `'${expected}'`),
        });
      },
    };
  },
});
