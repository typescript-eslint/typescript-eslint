import assert from 'node:assert';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { getParserServices } from '@typescript-eslint/utils/eslint-utils';
import type {
  FlatConfig,
  LooseRuleDefinition,
  RuleModule,
} from '@typescript-eslint/utils/ts-eslint';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
import { isEqual } from 'lodash';

import { TestFramework } from './TestFramework';
import type {
  ExpectedError,
  ExpectedSuggestion,
  FileUnawareConfig,
  InvalidSample,
  LegacyInvalidSample,
  LegacyValidSample,
  RuleTesterConfig,
  Sample,
  ValidSample,
} from './types/FlatRuleTester';
import { interpolate } from './utils/interpolate';
import * as SourceCodeFixer from './utils/SourceCodeFixer';
import { sanitize } from './utils/validationHelpers';

// Hide methods publicly by default, for simplicity's sake
export const DATA = Symbol('DATA');
export const CONSTRUCT = Symbol('CONSTRUCT');

// Needed for type exports
// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace FlatRuleTester {
  export type {
    ExpectedError,
    ExpectedSuggestion,
    InvalidSample,
    LegacyInvalidSample,
    LegacyValidSample,
    RuleTesterConfig,
    Sample,
    ValidSample,
    FileUnawareConfig,
  };
}

/**
 * The new, flat rule tester
 *
 * **WARNING:** This is NOT a drop-in-replacement for RuleTester, minor code migration will be needed and major code migration will be needed for optimal performance (See {@linkcode FlatRuleConfig#fromObject})
 *
 * List of current breaking changes:
 * - Uses ESLint's flat config system
 * - Requires type-checking
 * - Does not support string imports for parsers
 */
export class FlatRuleTester<F extends string> extends TestFramework {
  #config: Readonly<RuleTesterConfig<F>>;
  #rules: FlatRuleConfig<string, unknown[]>[];
  #linter: Linter;
  #fixtureDir: string;
  #hasTested: boolean;

  constructor(readonly config: Readonly<RuleTesterConfig<F>>) {
    super();
    this.#hasTested = false;
    this.#config = config;
    this.#rules = [];
    this.#linter = new Linter({
      // @ts-expect-error: Broken types
      configType: 'flat',
    });

    this.#fixtureDir = this.#config.fixtureRootDir;
    assert.ok(existsSync(this.#fixtureDir), 'Fixture directory must exist');
  }

  /**
   * Defines a new rule
   *
   * It is up to the caller to ensure no rules are duplicated
   */
  rule<M extends string, O extends unknown[]>(
    name: string,
    rule: RuleModule<M, O>,
  ): FlatRuleConfig<M, O> {
    const tester = FlatRuleConfig[CONSTRUCT](name, rule);
    this.#rules.push(tester);
    return tester;
  }

  /**
   * Run the defined tests.
   *
   * Must be called exactly once, after all tests have been defined.
   *
   * Explanation of why we need to do this below:
   * ```md
   * Some testing frameworks do not allow tests to be defined in the afterAll hook, this is a problem and prevents us from automatically running tests.
   * Thus, for consistency, we always require the calling of the test() method
   * ```
   */
  test(): void {
    assert.ok(!this.#hasTested, 'You should only call the test() method once!');
    this.#hasTested = true;

    for (const ruleDef of this.#rules) {
      const { rule, name, configurations } = ruleDef[DATA]();

      FlatRuleTester.describe(name, () => {
        configurations
          .map(c => c[DATA]())
          .forEach(data => {
            const custom: FlatConfig.Config = {
              languageOptions: {
                parserOptions: {
                  tsconfigRootDir: this.#fixtureDir,
                  project: true,
                },
              },
              plugins: {
                assertions: {
                  meta: {
                    name: 'assertions',
                  },
                  rules: {
                    assertions: {
                      meta: {
                        messages: {
                          assert: 'assert',
                        },
                        schema: [],
                        type: 'problem',
                      },
                      defaultOptions: [],
                      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                      create(ctx) {
                        assert.doesNotThrow(
                          () => getParserServices(ctx),
                          'Parser services must be available',
                        );

                        return {};
                      },
                    } satisfies RuleModule<'assert'> as LooseRuleDefinition,
                  },
                },
                rule: {
                  meta: {
                    name: 'rule',
                  },
                  rules: {
                    rule,
                  },
                },
              },
              rules: {
                'rule/rule': ['error', ...data.configuration],
                'assertions/assertions': ['error'],
              },
              files: ['**/*.*'],
            };

            FlatRuleTester.describe('valid', () =>
              data.valid.forEach(validCase =>
                FlatRuleTester.it(validCase.name, () => {
                  if (validCase.extension) {
                    assert.ok(validCase.extension in this.#config.extensions);
                  }

                  const name = `/file.${validCase.extension ?? 'ts'}`;
                  assert.ok(
                    existsSync(join(this.#fixtureDir, name)),
                    `Fixtures must exist for format: ${name}`,
                  );

                  const fullConfig: FlatConfig.ConfigArray = [
                    custom,
                    {
                      ...this.#config.baseOptions,
                      files: ['**/*.*'],
                    },
                  ];
                  if (validCase.extension) {
                    const formatConfig =
                      this.#config.extensions[validCase.extension as F];
                    fullConfig.splice(1, 0, {
                      ...formatConfig,
                      files: [`**/*.${validCase.extension}`],
                    });
                  }

                  const results = this.#linter.verify(
                    validCase.code,
                    fullConfig,
                    join(this.#fixtureDir, name),
                  );

                  results.forEach(msg => {
                    throw new Error(
                      `Got error ${msg.message} (${msg.messageId}), expected nothing`,
                    );
                  });
                }),
              ),
            );
            FlatRuleTester.describe('invalid', () =>
              data.invalid.forEach(invalidCase =>
                FlatRuleTester.it(sanitize(invalidCase.name), () => {
                  if (invalidCase.extension) {
                    assert.ok(
                      invalidCase.extension in this.#config.extensions,
                      `Undefined format: ${sanitize(invalidCase.extension)}, should be in ${sanitize(Object.keys(this.#config.extensions).join(', '))}`,
                    );
                  }

                  const name = `/file.${invalidCase.extension ?? 'ts'}`;
                  assert.ok(
                    existsSync(join(this.#fixtureDir, name)),
                    'Fixtures must exist',
                  );

                  const fullConfig: FlatConfig.ConfigArray = [
                    custom,
                    {
                      ...this.#config.baseOptions,
                      files: ['**/*.*'],
                    },
                  ];
                  if (invalidCase.extension) {
                    const formatConfig =
                      this.#config.extensions[invalidCase.extension as F];
                    fullConfig.splice(1, 0, {
                      ...formatConfig,
                      files: [`**/*.${invalidCase.extension}`],
                    });
                  }

                  const allMessages: Linter.LintMessage[] = [];
                  const results = this.#linter.verifyAndFix(
                    invalidCase.code,
                    fullConfig,
                    {
                      filename: join(this.#fixtureDir, name),
                      fix: true,
                      postprocess: messages => {
                        const e = messages.reduce((prev, cur) => [
                          ...prev,
                          ...cur,
                        ]);
                        allMessages.push(...e);
                        return e;
                      },
                    },
                  );
                  results.messages = allMessages; // ESLint bug ._. this fixes it

                  if (typeof invalidCase.output === 'string') {
                    assert.strictEqual(
                      results.output,
                      invalidCase.output,
                      'Output code and fix differ',
                    );
                  } else {
                    assert.strictEqual(
                      results.output,
                      invalidCase.code,
                      'Result output must be untouched',
                    );
                  }

                  assert.strictEqual(
                    results.messages.length,
                    invalidCase.errors.length,
                    'Result messages must be the same length',
                  );

                  results.messages.forEach((message, idx) => {
                    assert.ok(
                      message.ruleId != null,
                      `Parser/linter error occured: ${message.message}`,
                    );

                    assert.ok(
                      message.ruleId === 'rule/rule',
                      `Errors must be from the defined rule, as opposed to typescript-eslint or eslint: ${message.ruleId}`,
                    );

                    const expectedMessage = invalidCase.errors[idx];

                    if (expectedMessage.column) {
                      assert.strictEqual(
                        expectedMessage.column,
                        message.column,
                        'Error column must be the same',
                      );
                    }
                    if (expectedMessage.endColumn) {
                      assert.strictEqual(
                        expectedMessage.endColumn,
                        message.endColumn,
                        'Error end column must be the same',
                      );
                    }
                    if (expectedMessage.line) {
                      assert.strictEqual(
                        expectedMessage.line,
                        message.line,
                        'Error line must be the same',
                      );
                    }
                    if (expectedMessage.endLine) {
                      assert.strictEqual(
                        expectedMessage.endLine,
                        message.endLine,
                        'Error end line must be the same',
                      );
                    }
                    if (expectedMessage.message) {
                      assert.strictEqual(
                        expectedMessage.message,
                        message.message,
                        'Error message must be the same',
                      );
                    }
                    if (expectedMessage.messageId) {
                      assert.strictEqual(
                        expectedMessage.messageId,
                        message.messageId,
                        'Error message ID must be the same',
                      );
                    }
                    if (expectedMessage.type) {
                      assert.strictEqual(
                        expectedMessage.type,
                        message.nodeType,
                        'Error message ID must be the same',
                      );
                    }

                    // eslint-disable-next-line deprecation/deprecation
                    if (expectedMessage.data) {
                      this.#config;
                      assert.ok(message.messageId !== undefined);

                      const hydrated = interpolate(
                        rule.meta.messages[message.messageId],
                        // eslint-disable-next-line deprecation/deprecation
                        expectedMessage.data as Record<string, unknown>,
                      );

                      assert.strictEqual(
                        message.message,
                        hydrated,
                        'Message must be equal to data-hydrated message',
                      );
                    }

                    if (expectedMessage.suggestions !== undefined) {
                      assert.ok(
                        message.suggestions !== undefined,
                        'Suggestions must not be undefined',
                      );

                      assert.strictEqual(
                        expectedMessage.suggestions.length,
                        message.suggestions.length,
                        'Result suggestions must be the same length',
                      );
                      message.suggestions.forEach((suggestion, idx) => {
                        const expectedSuggestion =
                          // @ts-expect-error: TS forgot that we did an assertion
                          expectedMessage.suggestions[idx];

                        if (expectedSuggestion.desc) {
                          assert.strictEqual(
                            expectedSuggestion.desc,
                            suggestion.desc,
                            'Suggestion description must be the same',
                          );
                        }
                        if (expectedSuggestion.output) {
                          assert.strictEqual(
                            expectedSuggestion.output,
                            SourceCodeFixer.applyFixes(results.output, [
                              suggestion,
                            ]).output,
                            'Suggestion must be the same must be the same',
                          );
                        }
                        if (expectedSuggestion.messageId) {
                          assert.strictEqual(
                            expectedSuggestion.messageId,
                            suggestion.messageId,
                            'Suggestion message ID must be the same',
                          );
                        }
                      });
                    }
                  });
                }),
              ),
            );
          });
      });

      for (const [_, value] of Object.entries(
        // No actual cast done, just removing the type argument
        this.#config.extensions as RuleTesterConfig<string>['extensions'],
      )) {
        // eslint-disable-next-line @typescript-eslint/consistent-type-imports
        type parser = typeof import('@typescript-eslint/parser');
        if (
          value.languageOptions?.parser &&
          (value.languageOptions.parser as parser | { clearCaches: undefined })
            .clearCaches
        ) {
          (value.languageOptions.parser as parser).clearCaches();
        }
      }
    }
  }
}

export class FlatRuleConfig<
  MessageIds extends string,
  Options extends unknown[],
> {
  #name: string;
  #configurations: FlatRuleConfiguration<MessageIds, Options>[];
  #rule: RuleModule<MessageIds, Options>;

  #findOrMakeConfiguration(
    configuration: Options,
  ): FlatRuleConfiguration<MessageIds, Options> {
    let found: FlatRuleConfiguration<MessageIds, Options> | undefined =
      this.#configurations.find(val =>
        isEqual(val[DATA]().configuration, configuration),
      );
    if (!found) {
      found = new FlatRuleConfiguration(configuration);
      this.#configurations.push(found);
    }

    return found;
  }

  private constructor(name: string, rule: RuleModule<MessageIds, Options>) {
    this.#name = name;
    this.#rule = rule;
    this.#configurations = [];
  }

  /**
   * Defines a new configuration
   *
   * Use this over fromObject
   */
  configuration(
    ...configuration: Options
  ): FlatRuleConfiguration<MessageIds, Options> {
    const opt = new FlatRuleConfiguration<MessageIds, Options>(configuration);
    this.#configurations.push(opt);
    return opt;
  }

  /**
   * Defines a group of rules from an object of a similar schema to the RuleTester.run() method
   * Used for API compatibility
   *
   * Do not use for new rules
   */
  fromObject(
    defaultConfiguration: Options | null,
    obj: {
      valid: (LegacyValidSample<Options> | string)[];
      invalid: LegacyInvalidSample<MessageIds, Options>[];
      format?: string;
    },
  ): void {
    const format = obj.format ?? 'ts';
    if (defaultConfiguration == null) {
      defaultConfiguration = this.#rule.defaultOptions;
    }

    obj.valid.forEach(it => {
      if (typeof it === 'string') {
        it = {
          code: it,
          name: it,
          options: undefined,
        };

        const config = this.#findOrMakeConfiguration(
          it.options ?? defaultConfiguration,
        );

        config.valid(it.name ?? it.code, it.code, format);
      }
    });

    obj.invalid.forEach(it => {
      const config = this.#findOrMakeConfiguration(
        it.options ?? defaultConfiguration,
      );

      config.invalid(
        it.name ?? it.code,
        it.code,
        it.output ?? null,
        it.errors,
        format,
      );
    });
  }

  [DATA](): {
    configurations: FlatRuleConfiguration<MessageIds, Options>[];
    rule: RuleModule<MessageIds, Options>;
    name: string;
  } {
    return {
      configurations: this.#configurations,
      rule: this.#rule,
      name: this.#name,
    };
  }

  static [CONSTRUCT]<M extends string, O extends unknown[]>(
    name: string,
    rule: RuleModule<M, O>,
  ): FlatRuleConfig<M, O> {
    return new FlatRuleConfig(name, rule);
  }
}

/**
 * A singular rule configuration, used to define valid and invalid tests
 */
export class FlatRuleConfiguration<
  MessageIds extends string,
  Config extends unknown[],
> {
  #validSamples: ValidSample[];
  #invalidSamples: InvalidSample<MessageIds>[];
  #configuration: Config;

  constructor(configuration: Config) {
    this.#validSamples = [];
    this.#invalidSamples = [];
    this.#configuration = configuration;
  }

  // We return this to allow method chaining
  valid(name: string, code: string, format?: string): this {
    this.#validSamples.push({
      code,
      name,
      extension: format,
    });
    return this;
  }

  invalid(
    name: string,
    code: string,
    output: string | null,
    errors: ExpectedError<MessageIds>[],
    format?: string,
  ): this {
    this.#invalidSamples.push({
      code,
      name,
      output,
      errors,
      extension: format,
    });
    return this;
  }

  [DATA](): {
    valid: ValidSample[];
    invalid: InvalidSample<MessageIds>[];
    configuration: Config;
  } {
    return {
      valid: this.#validSamples,
      invalid: this.#invalidSamples,
      configuration: this.#configuration,
    };
  }
}
