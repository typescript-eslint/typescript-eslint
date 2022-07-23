import { TSESTree, TSESLint } from '@typescript-eslint/utils';
import { getFixturesRootDir, RuleTester } from '../RuleTester';
import { createRule, isNodeEqual } from '../../src/util';

const rule = createRule({
  name: 'no-useless-expression',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Remove useless expressions.',
      recommended: false,
    },
    messages: {
      removeExpression: 'Remove useless expression',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      LogicalExpression: (node: TSESTree.LogicalExpression): void => {
        if (
          (node.operator === '??' ||
            node.operator === '||' ||
            node.operator === '&&') &&
          isNodeEqual(node.left, node.right)
        ) {
          context.report({
            node,
            messageId: 'removeExpression',
            fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
              return fixer.replaceText(
                node,
                sourceCode.text.slice(node.left.range[0], node.left.range[1]),
              );
            },
          });
        }
      },
    };
  },
});

const rootPath = getFixturesRootDir();
const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

ruleTester.run('isNodeEqual', rule, {
  valid: [
    { code: 'a || b' },
    { code: '!true || true' },
    { code: 'a() || a()' },
    { code: 'foo.bar || foo.bar.foo' },
  ],
  invalid: [
    {
      code: 'undefined || undefined',
      errors: [{ messageId: 'removeExpression' }],
      output: 'undefined',
    },
    {
      code: 'true && true',
      errors: [{ messageId: 'removeExpression' }],
      output: 'true',
    },
    {
      code: 'a || a',
      errors: [{ messageId: 'removeExpression' }],
      output: 'a',
    },
    {
      code: 'a && a',
      errors: [{ messageId: 'removeExpression' }],
      output: 'a',
    },
    {
      code: 'a ?? a',
      errors: [{ messageId: 'removeExpression' }],
      output: 'a',
    },
    {
      code: 'foo.bar || foo.bar',
      errors: [{ messageId: 'removeExpression' }],
      output: 'foo.bar',
    },
    {
      code: 'this.foo.bar || this.foo.bar',
      errors: [{ messageId: 'removeExpression' }],
      output: 'this.foo.bar',
    },
    {
      code: 'x.z[1][this[this.o]]["3"][a.b.c] || x.z[1][this[this.o]]["3"][a.b.c]',
      errors: [{ messageId: 'removeExpression' }],
      output: 'x.z[1][this[this.o]]["3"][a.b.c]',
    },
  ],
});
