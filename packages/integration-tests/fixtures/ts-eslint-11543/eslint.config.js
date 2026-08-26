// @ts-check

import { ESLintUtils } from '@typescript-eslint/utils';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

const createRule = ESLintUtils.RuleCreator(
  ruleName => `https://example.com/rules/${ruleName}`,
);

// mini-fixture: a third-party plugin rule authored with RuleCreator (#11543, consumer class 4)
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

// inferred plugin object, no type annotations (CL-12 failure form 1)
const inferredPlugin = {
  meta: { name: 'example', version: '1.0.0' },
  rules: {
    'no-foo': noFoo,
  },
};

// this config is run through eslint as part of the integration test
// so it needs to be a correct config
export default defineConfig(
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ['**/build/**', '**/dist/**'],
  },
  {
    plugins: {
      example: inferredPlugin,
    },
    rules: {
      'example/no-foo': 'error',
    },
  },
);

// wrapped in a function so they aren't executed at lint time
function _otherCases() {
  // these are just tests for the types and are not seen by eslint so they can be whatever

  // the #11543 workaround (@ts-expect-error on the plugin position) is no
  // longer needed: the inferred plugin passes without any directive
  defineConfig({
    plugins: {
      example: inferredPlugin,
    },
  });

  // both entries accept the plugin
  tseslint.config({
    plugins: {
      example: inferredPlugin,
    },
  });

  // wide-typed rules record (CL-12 failure form 2)
  /**
   * @type {Record<
   *   string,
   *   import('@typescript-eslint/utils/ts-eslint').AnyRuleModuleWithMetaDocs
   * >}
   */
  const wideRules = {
    'no-foo-wide': {
      create: () => ({}),
      meta: {
        docs: { description: 'wide' },
        messages: { avoidFoo: 'Avoid foo.' },
        schema: [],
        type: 'suggestion',
      },
    },
  };
  defineConfig({
    plugins: {
      wide: {
        rules: wideRules,
      },
    },
  });

  // configs compose through both helpers, including extends and spread
  defineConfig(...tseslint.configs.recommended, {
    extends: [tseslint.configs.eslintRecommended, ...tseslint.configs.strict],
  });
  tseslint.config(...tseslint.configs.recommended, {
    extends: [tseslint.configs.eslintRecommended],
  });
}
