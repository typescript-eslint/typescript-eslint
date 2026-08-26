// @ts-check

import { ESLintUtils } from '@typescript-eslint/utils';
import { defineConfig } from 'eslint/config';

const createRule = ESLintUtils.RuleCreator(
  ruleName => `https://example.com/rules/${ruleName}`,
);

const noFoo = createRule({
  name: 'no-foo',
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow foo identifiers.' },
    messages: { avoidFoo: 'Avoid foo.' },
    schema: [],
  },
  create(context) {
    return {
      Identifier(node) {
        if (node.name === 'foo') {
          context.report({ messageId: 'avoidFoo', node });
        }
      },
    };
  },
});

// The #11543 workaround wave put @ts-expect-error directives on plugin
// positions like this one. With the types fixed, the directive is no longer
// fulfilled, so tsc reports TS2578 for it — which is exactly what the
// sibling test asserts.
export default defineConfig({
  plugins: {
    example: {
      rules: {
        // @ts-expect-error -- https://github.com/typescript-eslint/typescript-eslint/issues/11543
        'no-foo': noFoo,
      },
    },
  },
});
