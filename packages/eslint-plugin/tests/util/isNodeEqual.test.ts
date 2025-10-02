import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { createRule, isNodeEqual } from '../../src/util';
import { createRuleTesterWithTypes } from '../RuleTester';

const rule = createRule({
  create(context) {
    return {
      LogicalExpression: (node: TSESTree.LogicalExpression): void => {
        if (isNodeEqual(node.left, node.right)) {
          context.report({
            fix(fixer: TSESLint.RuleFixer): TSESLint.RuleFix {
              return fixer.replaceText(
                node,
                context.sourceCode.text.slice(
                  node.left.range[0],
                  node.left.range[1],
                ),
              );
            },
            messageId: 'removeExpression',
            node,
          });
        }
      },
    };
  },
  defaultOptions: [],
  meta: {
    docs: {
      description: 'Remove useless expressions.',
    },
    fixable: 'code',
    messages: {
      removeExpression: 'Remove useless expression',
    },
    schema: [],
    type: 'suggestion',
  },

  name: 'no-useless-expression',
});

const ruleTester = createRuleTesterWithTypes({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
    },
  },
});

ruleTester.run('isNodeEqual', rule, {
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
  valid: [
    { code: 'a || b' },
    { code: '!true || true' },
    { code: 'a() || a()' },
    { code: 'foo.bar || foo.bar.foo' },
  ],
});
