import type { TSESLint } from '@typescript-eslint/utils';
import type { ESLint, Linter } from 'eslint';

import { ESLintUtils } from '@typescript-eslint/utils';
import { defineConfig } from 'eslint/config';

import type { FlatConfig } from '../src/index';

import tseslint from '../src/index';

/* eslint @typescript-eslint/no-deprecated: ["error", { "allow": [{ "from": "file", "name": "config", "path": "packages/typescript-eslint/src/config-helper.ts" }] }] */

describe('test for compatibility with config helpers', () => {
  test('exported plugin is compatible with tseslint.config()', () => {
    tseslint.config({
      plugins: {
        '@typescript-eslint': tseslint.plugin,
      },
    });
  });

  test('exported plugin is compatible with defineConfig()', () => {
    defineConfig({
      plugins: {
        '@typescript-eslint': tseslint.plugin,
      },
    });
  });

  test('exported parser is compatible with tseslint.config()', () => {
    tseslint.config({
      languageOptions: {
        parser: tseslint.parser,
      },
    });
  });

  test('exported parser is compatible with defineConfig()', () => {
    defineConfig({
      languageOptions: {
        parser: tseslint.parser,
      },
    });
  });

  test('exported configs are compatible with tseslint.config()', () => {
    tseslint.config(tseslint.configs.recommendedTypeChecked);
    tseslint.config(tseslint.configs.strict);
    tseslint.config(tseslint.configs.eslintRecommended);
  });

  test('exported configs are compatible with defineConfig()', () => {
    defineConfig(tseslint.configs.recommendedTypeChecked);
    defineConfig(tseslint.configs.strict);
    defineConfig(tseslint.configs.eslintRecommended);
  });

  test('exported configs are compatible with defineConfig() extends', () => {
    defineConfig({
      extends: [tseslint.configs.recommendedTypeChecked],
      files: ['**/*.ts'],
    });
    defineConfig({
      extends: [tseslint.configs.strict, tseslint.configs.eslintRecommended],
      files: ['**/*.ts'],
    });
  });

  test('exported configs are compatible with ESLint config types', () => {
    const configArray: Linter.Config[] = tseslint.configs.recommended;
    const config: Linter.Config = tseslint.configs.base;
    expect(configArray).toBeDefined();
    expect(config).toBeDefined();
  });
});

// https://github.com/typescript-eslint/typescript-eslint/issues/11543
describe('test for compatibility of FlatConfig types with defineConfig()', () => {
  const createRule = ESLintUtils.RuleCreator(name => name);

  const ruleWithOptions = createRule<[{ option: boolean }], 'messageId'>({
    create(context) {
      return {
        Identifier(node): void {
          context.report({
            data: { data: node.name },
            fix: fixer => fixer.replaceText(node, 'replaced'),
            messageId: 'messageId',
            node,
            suggest: [
              {
                fix: fixer => fixer.remove(node),
                messageId: 'messageId',
              },
            ],
          });
        },
      };
    },
    defaultOptions: [{ option: true }],
    meta: {
      docs: {
        description: 'A rule with options',
      },
      messages: {
        messageId: 'Message {{ data }}',
      },
      schema: [],
      type: 'problem',
    },
    name: 'rule-with-options',
  });

  const ruleWithoutDocs = ESLintUtils.RuleCreator.withoutDocs({
    create() {
      return {};
    },
    defaultOptions: [],
    meta: {
      messages: {
        messageId: 'Message',
      },
      schema: [],
      type: 'problem',
    },
  });

  const plugin: FlatConfig.Plugin = {
    meta: {
      name: 'eslint-plugin-example',
      version: '1.0.0',
    },
    rules: {
      'rule-with-options': ruleWithOptions,
      'rule-without-docs': ruleWithoutDocs,
    },
  };

  const config: FlatConfig.Config = {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
      },
    },
    name: 'example/recommended',
    plugins: {
      example: plugin,
    },
    rules: {
      'example/rule-with-options': ['error', { option: false }],
    },
  };

  const configArray: FlatConfig.ConfigArray = [config];

  const pluginWithConfigs: FlatConfig.Plugin = {
    ...plugin,
    configs: {
      all: configArray,
      recommended: config,
    },
  };

  test('rule types are compatible with ESLint rule types', () => {
    type ESLintRuleDefinition = NonNullable<ESLint.Plugin['rules']>[string];

    expectTypeOf(ruleWithOptions).toExtend<ESLintRuleDefinition>();
    expectTypeOf(ruleWithoutDocs).toExtend<ESLintRuleDefinition>();
    expectTypeOf<
      TSESLint.RuleModule<'messageId', [{ option: boolean }]>
    >().toExtend<ESLintRuleDefinition>();
    expectTypeOf<
      TSESLint.RuleModule<string, unknown[]>
    >().toExtend<ESLintRuleDefinition>();
    expectTypeOf<TSESLint.RuleListener>().toExtend<
      ReturnType<ESLintRuleDefinition['create']>
    >();

    // ESLint's types require mutable rule options
    expectTypeOf<
      TSESLint.RuleModule<'messageId', readonly [{ option: boolean }]>
    >().not.toExtend<ESLintRuleDefinition>();
    expectTypeOf<TSESLint.AnyRuleModule>().not.toExtend<ESLintRuleDefinition>();
  });

  test('FlatConfig types are compatible with ESLint config types', () => {
    expectTypeOf<FlatConfig.Plugin>().toExtend<ESLint.Plugin>();
    expectTypeOf<FlatConfig.Config>().toExtend<Linter.Config>();
    expectTypeOf<FlatConfig.ConfigArray>().toExtend<Linter.Config[]>();
  });

  test('plugins typed with FlatConfig.Plugin are compatible with defineConfig()', () => {
    defineConfig({
      plugins: {
        example: plugin,
      },
    });
    defineConfig({
      plugins: {
        example: pluginWithConfigs,
      },
    });
  });

  test('plugins typed with FlatConfig.Plugin are compatible with tseslint.config()', () => {
    tseslint.config({
      plugins: {
        example: plugin,
      },
    });
  });

  test('parsers typed with FlatConfig.Parser are compatible with defineConfig()', () => {
    const parser: FlatConfig.Parser = tseslint.parser;
    defineConfig({
      languageOptions: {
        parser,
      },
    });
  });

  test('configs typed with FlatConfig.Config are compatible with defineConfig()', () => {
    defineConfig(config);
    defineConfig(configArray);
    defineConfig({
      extends: [config, configArray],
      files: ['**/*.ts'],
    });
  });

  test('configs typed with FlatConfig.Config are compatible with tseslint.config()', () => {
    tseslint.config(config);
    tseslint.config(configArray);
    tseslint.config({
      extends: [config, configArray],
      files: ['**/*.ts'],
    });
  });
});
