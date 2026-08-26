import type {
  AnyRuleModuleWithMetaDocs,
  EcmaVersion,
  FlatConfig,
  Parser,
  ParserOptions,
  RuleModuleWithMetaDocs,
  SourceType,
} from '@typescript-eslint/utils/ts-eslint';

import { ESLintUtils } from '@typescript-eslint/utils';
import { defineConfig } from 'eslint/config';

import tseslint from '../src/index';

/* eslint @typescript-eslint/no-deprecated: ["error", { "allow": [{ "from": "file", "name": "config", "path": "packages/typescript-eslint/src/config-helper.ts" }] }] */

const createRule = ESLintUtils.RuleCreator(
  ruleName => `https://example.com/rules/${ruleName}`,
);

const ruleWithDocs = createRule<
  [{ alias: 'always' | 'never' }],
  'avoidFoo' | 'suggestBar'
>({
  create(context) {
    return {
      Identifier(node) {
        if (node.name === 'foo') {
          context.report({ messageId: 'avoidFoo', node });
        }
      },
    };
  },
  meta: {
    docs: { description: 'Disallow foo identifiers.' },
    hasSuggestions: true,
    messages: { avoidFoo: 'Avoid foo.', suggestBar: 'Use bar instead.' },
    schema: [],
    type: 'suggestion',
  },
  name: 'no-foo',
});

const ruleWithReadonlyOptions = createRule<
  readonly [{ readonly alias: 'always' | 'never' }],
  'avoidFoo'
>({
  create(context) {
    return {
      Identifier(node) {
        if (node.name === 'foo') {
          context.report({ messageId: 'avoidFoo', node });
        }
      },
    };
  },
  meta: {
    docs: { description: 'Disallow foo identifiers.' },
    messages: { avoidFoo: 'Avoid foo.' },
    schema: [],
    type: 'suggestion',
  },
  name: 'no-foo-readonly',
});

// Parameterisation probes for P-assign (generic identity of createNamedRule):
// empty tuple / literal union elements / nested object elements.
const ruleEmptyOptions = createRule<[], 'avoidFoo'>({
  create: () => ({}),
  meta: {
    docs: { description: 'Disallow foo identifiers.' },
    messages: { avoidFoo: 'Avoid foo.' },
    schema: [],
    type: 'suggestion',
  },
  name: 'no-foo-empty',
});

const ruleLiteralUnionOptions = createRule<['a' | 'b'], 'avoidFoo'>({
  create: () => ({}),
  meta: {
    docs: { description: 'Disallow foo identifiers.' },
    messages: { avoidFoo: 'Avoid foo.' },
    schema: [],
    type: 'suggestion',
  },
  name: 'no-foo-union',
});

const ruleNestedOptions = createRule<[{ inner: { deep: string } }], 'avoidFoo'>(
  {
    create: () => ({}),
    meta: {
      docs: { description: 'Disallow foo identifiers.' },
      messages: { avoidFoo: 'Avoid foo.' },
      schema: [],
      type: 'suggestion',
    },
    name: 'no-foo-nested',
  },
);

// The #11543 ecosystem pattern: a third-party plugin built from RuleCreator
// outputs without any annotations (both CL-12 failure forms must pass).
const inferredPlugin = {
  meta: { name: 'example', version: '1.0.0' },
  rules: {
    'no-foo': ruleWithDocs,
    'no-foo-readonly': ruleWithReadonlyOptions,
  },
};

// The wide-typed record form (CL-12 failure form 2): rules annotated with the
// wide public module type instead of inferred per-rule types.
declare const wideTypedRule: RuleModuleWithMetaDocs<string, unknown[]>;
const wideRules: Record<string, AnyRuleModuleWithMetaDocs> = {
  'no-foo-wide': wideTypedRule,
};

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
});

describe('RuleCreator outputs are compatible with config helpers (#11543)', () => {
  test('RuleCreator output is compatible with defineConfig() rules position', () => {
    defineConfig({
      plugins: {
        example: {
          rules: {
            'no-foo': ruleWithDocs,
            'no-foo-readonly': ruleWithReadonlyOptions,
          },
        },
      },
      rules: { 'example/no-foo': 'error' },
    });
  });

  test('RuleCreator output is compatible with tseslint.config() rules position', () => {
    tseslint.config({
      plugins: {
        example: {
          rules: {
            'no-foo': ruleWithDocs,
            'no-foo-readonly': ruleWithReadonlyOptions,
          },
        },
      },
      rules: { 'example/no-foo': 'error' },
    });
  });

  test('inferred plugin from RuleCreator outputs is compatible with defineConfig()', () => {
    defineConfig(
      { plugins: { example: inferredPlugin } },
      { rules: { 'example/no-foo': 'error' } },
    );
  });

  test('inferred plugin from RuleCreator outputs is compatible with tseslint.config()', () => {
    tseslint.config(
      { plugins: { example: inferredPlugin } },
      { rules: { 'example/no-foo': 'error' } },
    );
  });

  test('widely-typed rules record is compatible with defineConfig()', () => {
    defineConfig({
      plugins: {
        example: {
          rules: wideRules,
        },
      },
    });
  });

  test('parameterised RuleCreator instantiations are compatible with defineConfig()', () => {
    defineConfig({
      plugins: {
        example: {
          rules: {
            'no-foo-empty': ruleEmptyOptions,
            'no-foo-nested': ruleNestedOptions,
            'no-foo-union': ruleLiteralUnionOptions,
          },
        },
      },
    });
  });
});

describe('exported configs compose with config helpers', () => {
  test('configs are compatible with defineConfig() via spread', () => {
    defineConfig(
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    );
  });

  test('configs are compatible with tseslint.config() via spread', () => {
    tseslint.config(
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
    );
  });

  test('configs are compatible with defineConfig() via extends', () => {
    defineConfig({
      extends: [
        tseslint.configs.eslintRecommended,
        ...tseslint.configs.recommendedTypeChecked,
      ],
    });
  });

  test('configs are compatible with tseslint.config() via extends', () => {
    tseslint.config({
      extends: [
        tseslint.configs.eslintRecommended,
        ...tseslint.configs.recommendedTypeChecked,
      ],
    });
  });
});

describe('direct TSESLint.FlatConfig annotations are compatible with config helpers', () => {
  const annotatedPlugin: FlatConfig.Plugin = { rules: {} };
  const annotatedParser: FlatConfig.Parser = {
    parseForESLint: () => ({ ast: {} }),
  };
  const annotatedConfig: FlatConfig.Config = {
    languageOptions: { parser: annotatedParser },
  };

  test('annotated values are compatible with defineConfig()', () => {
    defineConfig({
      plugins: { annotated: annotatedPlugin },
      ...annotatedConfig,
    });
  });

  test('annotated values are compatible with tseslint.config()', () => {
    tseslint.config({
      plugins: { annotated: annotatedPlugin },
      ...annotatedConfig,
    });
  });
});

describe('FlatConfig.LanguageOptions is assignable to the core Record plane', () => {
  test('language options values are assignable to Record<string, unknown>', () => {
    expectTypeOf<FlatConfig.LanguageOptions>().toExtend<
      Record<string, unknown>
    >();

    const languageOptions: FlatConfig.LanguageOptions = {
      ecmaVersion: 'latest',
      globals: { window: 'readonly' },
      sourceType: 'module',
    };
    const record: Record<string, unknown> = languageOptions;
    expectTypeOf(record).toExtend<Record<string, unknown>>();

    // tseslint refinements are preserved on the hub; expected shapes come
    // from the origin type definitions, not from the hub itself, so an
    // accidental widening during re-anchoring fails here
    expectTypeOf(languageOptions.ecmaVersion).toEqualTypeOf<
      EcmaVersion | undefined
    >();
    expectTypeOf(languageOptions.parser).toEqualTypeOf<
      Parser.LooseParserModule | undefined
    >();
    expectTypeOf(languageOptions.parserOptions).toEqualTypeOf<
      ParserOptions | undefined
    >();
    expectTypeOf(languageOptions.sourceType).toEqualTypeOf<
      SourceType | undefined
    >();
    expectTypeOf(languageOptions.globals).toEqualTypeOf<
      FlatConfig.GlobalsConfig | undefined
    >();
  });
});
