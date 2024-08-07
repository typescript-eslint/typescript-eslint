import { RuleTester } from '@typescript-eslint/rule-tester';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { createRule, isNodeEqual } from '../../src/util';
import { getFixturesRootDir } from '../RuleTester';

const rule = createRule({
  name: 'no-useless-expression',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Remove useless expressions.',
    },
    messages: {
      removeExpression: 'Remove useless expression',
    },
    schema: [],
  },

  create(context) {
    return {
      LogicalExpression: (node: TSESTree.LogicalExpression): void => {
        if (isNodeEqual(node.left, node.right)) {
          context.report({
            node,
            messageId: 'removeExpression',
            fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
              return fixer.replaceText(
                node,
                context.sourceCode.text.slice(
                  node.left.range[0],
                  node.left.range[1],
                ),
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
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: rootPath,
      project: './tsconfig.json',
    },
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
