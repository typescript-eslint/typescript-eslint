// A minimal plugin authored with @typescript-eslint/utils, the way third-party
// plugins commonly are. Its exports use the annotated (not `satisfies`) forms
// of our types, which is the harder case for compatibility with ESLint's types.
// https://github.com/typescript-eslint/typescript-eslint/issues/11543

import type { TSESLint } from '@typescript-eslint/utils';

import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  name => `https://example.com/rules/${name}`,
);

export const noFoo = createRule<
  [{ allowBar: boolean }],
  'noFoo' | 'renameToBar'
>({
  name: 'no-foo',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow identifiers named `foo`.',
    },
    hasSuggestions: true,
    messages: {
      noFoo: 'Identifier `{{ name }}` is not allowed.',
      renameToBar: 'Rename to `bar`.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowBar: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ allowBar: false }],
  create(context, [{ allowBar }]) {
    return {
      Identifier(node): void {
        if (node.name !== 'foo') {
          return;
        }

        context.report({
          node,
          messageId: 'noFoo',
          data: { name: node.name },
          suggest: allowBar
            ? [
                {
                  messageId: 'renameToBar',
                  fix: fixer => fixer.replaceText(node, 'bar'),
                },
              ]
            : [],
        });
      },
    };
  },
});

export const plugin: TSESLint.FlatConfig.Plugin = {
  meta: {
    name: 'eslint-plugin-example',
    version: '1.0.0',
  },
  rules: {
    'no-foo': noFoo,
  },
};

export const recommended: TSESLint.FlatConfig.Config = {
  name: 'example/recommended',
  plugins: {
    example: plugin,
  },
  rules: {
    'example/no-foo': 'error',
  },
};

export const configs: TSESLint.FlatConfig.SharedConfigs = {
  recommended,
  'recommended-array': [recommended],
};
