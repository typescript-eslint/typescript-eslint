// Forked from https://github.com/eslint/eslint/blob/ad9dd6a933fd098a0d99c6a9aa059850535c23ee/lib/rule-tester/rule-tester.js

import assert from 'node:assert';
import path from 'node:path';
import util from 'node:util';

import type { TSESTree } from '@typescript-eslint/utils';
import type {
  AnyRuleModule,
  InvalidTestCase,
  RuleContext,
  RuleModule,
  RunTests,
  ValidTestCase,
} from '@typescript-eslint/utils/ts-eslint';
import { Linter } from '@typescript-eslint/utils/ts-eslint';
// we intentionally import from eslint here because we need to use the same class
// that ESLint uses, not our custom override typed version
import { SourceCode } from 'eslint';
import merge from 'lodash.merge';

import { TestFramework } from './TestFramework';
import type { RuleTesterConfig, TesterConfigWithDefaults } from './types';
import { ajvBuilder } from './utils/ajv';
import { cloneDeeplyExcludesParent } from './utils/cloneDeeplyExcludesParent';
import { validate } from './utils/config-validator';
import { freezeDeeply } from './utils/freezeDeeply';
import { getRuleOptionsSchema } from './utils/getRuleOptionsSchema';
import { hasOwnProperty } from './utils/hasOwnProperty';
import { interpolate } from './utils/interpolate';
import { isReadonlyArray } from './utils/isReadonlyArray';
import * as SourceCodeFixer from './utils/SourceCodeFixer';
import {
  emitLegacyRuleAPIWarning,
  emitMissingSchemaWarning,
  ERROR_OBJECT_PARAMETERS,
  FRIENDLY_ERROR_OBJECT_PARAMETER_LIST,
  FRIENDLY_SUGGESTION_OBJECT_PARAMETER_LIST,
  getCommentsDeprecation,
  REQUIRED_SCENARIOS,
  RuleTesterParameters,
  sanitize,
  SUGGESTION_OBJECT_PARAMETERS,
  wrapParser,
} from './utils/validationHelpers';

const ajv = ajvBuilder({ strictDefaults: true });
const TYPESCRIPT_ESLINT_PARSER_PATH = require.resolve(
  '@typescript-eslint/parser',
);

/*
 * testerDefaultConfig must not be modified as it allows to reset the tester to
 * the initial default configuration
 */
const testerDefaultConfig: Readonly<TesterConfigWithDefaults> = {
  parser: TYPESCRIPT_ESLINT_PARSER_PATH,
  rules: {},
};
let defaultConfig: TesterConfigWithDefaults = { ...testerDefaultConfig };

export class RuleTester extends TestFramework {
  private testerConfig: TesterConfigWithDefaults;
  private rules: Record<string, AnyRuleModule>;
  private linter: Linter;

  /**
   * Creates a new instance of RuleTester.
   */
  constructor(testerConfig?: RuleTesterConfig) {
    super();

    /**
     * The configuration to use for this tester. Combination of the tester
     * configuration and the default configuration.
     */
    this.testerConfig = merge({}, defaultConfig, testerConfig, {
      rules: { 'rule-tester/validate-ast': 'error' },
    });

    /**
     * Rule definitions to define before tests.
     */
    this.rules = {};
    this.linter = new Linter();
  }

  /**
   * Set the configuration to use for all future tests
   */
  static setDefaultConfig(config: RuleTesterConfig): void {
    if (typeof config !== 'object' || config == null) {
      throw new TypeError(
        'RuleTester.setDefaultConfig: config must be an object',
      );
    }
    // Make sure the rules object exists since it is assumed to exist later
    defaultConfig = { rules: {}, ...config };
  }

  /**
   * Get the current configuration used for all tests
   */
  static getDefaultConfig(): Readonly<RuleTesterConfig> {
    return defaultConfig;
  }

  /**
   * Reset the configuration to the initial configuration of the tester removing
   * any changes made until now.
   */
  static resetDefaultConfig(): void {
    defaultConfig = merge({}, testerDefaultConfig);
  }

  /**
   * Adds the `only` property to a test to run it in isolation.
   */
  static only<TOptions extends Readonly<unknown[]>>(
    item: string | ValidTestCase<TOptions>,
  ): ValidTestCase<TOptions>;
  /**
   * Adds the `only` property to a test to run it in isolation.
   */
  static only<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    item: InvalidTestCase<TMessageIds, TOptions>,
  ): InvalidTestCase<TMessageIds, TOptions>;
  static only<TMessageIds extends string, TOptions extends Readonly<unknown[]>>(
    item:
      | string
      | ValidTestCase<TOptions>
      | InvalidTestCase<TMessageIds, TOptions>,
  ): ValidTestCase<TOptions> | InvalidTestCase<TMessageIds, TOptions> {
    if (typeof item === 'string') {
      return { code: item, only: true };
    }

    return { ...item, only: true };
  }

  /**
   * Define a rule for one particular run of tests.
   */
  defineRule(name: string, rule: AnyRuleModule): void {
    this.rules[name] = rule;
  }

  /**
   * Adds a new rule test to execute.
   */
  run<TMessageIds extends string, TOptions extends readonly unknown[]>(
    ruleName: string,
    rule: RuleModule<TMessageIds, TOptions>,
    test: RunTests<TMessageIds, TOptions>,
  ): void {
    const testerConfig = this.testerConfig;
    const linter = this.linter;

    if (!test || typeof test !== 'object') {
      throw new TypeError(
        `Test Scenarios for rule ${ruleName} : Could not find test scenario object`,
      );
    }

    const scenarioErrors: string[] = [];
    REQUIRED_SCENARIOS.forEach(scenarioType => {
      if (!test[scenarioType]) {
        scenarioErrors.push(
          `Could not find any ${scenarioType} test scenarios`,
        );
      }
    });

    if (scenarioErrors.length > 0) {
      throw new Error(
        [
          `Test Scenarios for rule ${ruleName} is invalid:`,
          ...scenarioErrors,
        ].join('\n'),
      );
    }

    if (typeof rule === 'function') {
      emitLegacyRuleAPIWarning(ruleName);
    }

    linter.defineRule(
      ruleName,
      Object.assign({}, rule, {
        // Create a wrapper rule that freezes the `context` properties.
        create(context: RuleContext<TMessageIds, TOptions>) {
          freezeDeeply(context.options);
          freezeDeeply(context.settings);
          freezeDeeply(context.parserOptions);

          return (typeof rule === 'function' ? rule : rule.create)(context);
        },
      }),
    );

    linter.defineRules(this.rules);

    /**
     * Run the rule for the given item
     * @throws {Error} If an invalid schema.
     */
    function runRuleForItem(
      item: ValidTestCase<TOptions> | InvalidTestCase<TMessageIds, TOptions>,
    ): {
      messages: Linter.LintMessage[];
      output: string;
      beforeAST: TSESTree.Program;
      afterAST: TSESTree.Program;
    } {
      let config: TesterConfigWithDefaults = merge({}, testerConfig);
      let code;
      let filename;
      let output;
      let beforeAST: TSESTree.Program;
      let afterAST: TSESTree.Program;

      if (typeof item === 'string') {
        code = item;
      } else {
        code = item.code;

        /*
         * Assumes everything on the item is a config except for the
         * parameters used by this tester
         */
        const itemConfig: Record<string, unknown> = { ...item };

        for (const parameter of RuleTesterParameters) {
          delete itemConfig[parameter];
        }

        /*
         * Create the config object from the tester config and this item
         * specific configurations.
         */
        config = merge(config, itemConfig);
      }

      if (item.filename) {
        filename = item.filename;
      }

      if (hasOwnProperty(item, 'options')) {
        assert(Array.isArray(item.options), 'options must be an array');
        if (
          item.options.length > 0 &&
          typeof rule === 'object' &&
          (!rule.meta || (rule.meta && rule.meta.schema == null))
        ) {
          emitMissingSchemaWarning(ruleName);
        }
        config.rules[ruleName] = ['error', ...item.options];
      } else {
        config.rules[ruleName] = 'error';
      }

      const schema = getRuleOptionsSchema(rule);

      /*
       * Setup AST getters.
       * The goal is to check whether or not AST was modified when
       * running the rule under test.
       */
      linter.defineRule('rule-tester/validate-ast', {
        create() {
          return {
            Program(node): void {
              beforeAST = cloneDeeplyExcludesParent(node);
            },
            'Program:exit'(node): void {
              afterAST = node;
            },
          };
        },
      });

      if (typeof config.parser === 'string') {
        assert(
          path.isAbsolute(config.parser),
          'Parsers provided as strings to RuleTester must be absolute paths',
        );
      } else {
        config.parser = TYPESCRIPT_ESLINT_PARSER_PATH;
      }

      linter.defineParser(
        config.parser,
        wrapParser(require(config.parser) as Linter.ParserModule),
      );

      if (schema) {
        ajv.validateSchema(schema);

        if (ajv.errors) {
          const errors = ajv.errors
            .map(error => {
              const field =
                error.dataPath[0] === '.'
                  ? error.dataPath.slice(1)
                  : error.dataPath;

              return `\t${field}: ${error.message}`;
            })
            .join('\n');

          throw new Error(
            [`Schema for rule ${ruleName} is invalid:`, errors].join(
              // no space after comma to match eslint core
              ',',
            ),
          );
        }

        /*
         * `ajv.validateSchema` checks for errors in the structure of the schema (by comparing the schema against a "meta-schema"),
         * and it reports those errors individually. However, there are other types of schema errors that only occur when compiling
         * the schema (e.g. using invalid defaults in a schema), and only one of these errors can be reported at a time. As a result,
         * the schema is compiled here separately from checking for `validateSchema` errors.
         */
        try {
          ajv.compile(schema);
        } catch (err) {
          throw new Error(
            `Schema for rule ${ruleName} is invalid: ${(err as Error).message}`,
          );
        }
      }

      validate(config, 'rule-tester', id => (id === ruleName ? rule : null));

      // Verify the code.
      // @ts-expect-error -- we don't define deprecated members on our types
      const { getComments } = SourceCode.prototype as { getComments: unknown };
      let messages;

      try {
        // @ts-expect-error -- we don't define deprecated members on our types
        SourceCode.prototype.getComments = getCommentsDeprecation;
        messages = linter.verify(code, config, filename);
      } finally {
        // @ts-expect-error -- we don't define deprecated members on our types
        SourceCode.prototype.getComments = getComments;
      }

      const fatalErrorMessage = messages.find(m => m.fatal);

      assert(
        !fatalErrorMessage,
        `A fatal parsing error occurred: ${fatalErrorMessage?.message}`,
      );

      // Verify if autofix makes a syntax error or not.
      if (messages.some(m => m.fix)) {
        output = SourceCodeFixer.applyFixes(code, messages).output;
        const errorMessageInFix = linter
          .verify(output, config, filename)
          .find(m => m.fatal);

        assert(
          !errorMessageInFix,
          [
            'A fatal parsing error occurred in autofix.',
            `Error: ${errorMessageInFix?.message}`,
            'Autofix output:',
            output,
          ].join('\n'),
        );
      } else {
        output = code;
      }

      return {
        messages,
        output,
        // is definitely assigned within the `rule-tester/validate-ast` rule
        beforeAST: beforeAST!,
        // is definitely assigned within the `rule-tester/validate-ast` rule
        afterAST: cloneDeeplyExcludesParent(afterAST!),
      };
    }

    /**
     * Check if the AST was changed
     */
    function assertASTDidntChange(beforeAST: unknown, afterAST: unknown): void {
      assert.deepStrictEqual(
        beforeAST,
        afterAST,
        'Rule should not modify AST.',
      );
    }

    /**
     * Check if the template is valid or not
     * all valid cases go through this
     */
    function testValidTemplate(itemIn: string | ValidTestCase<TOptions>): void {
      const item: ValidTestCase<TOptions> =
        typeof itemIn === 'object' ? itemIn : { code: itemIn };

      assert.ok(
        typeof item.code === 'string',
        "Test case must specify a string value for 'code'",
      );
      if (item.name) {
        assert.ok(
          typeof item.name === 'string',
          "Optional test case property 'name' must be a string",
        );
      }

      const result = runRuleForItem(item);
      const messages = result.messages;

      assert.strictEqual(
        messages.length,
        0,
        util.format(
          'Should have no errors but had %d: %s',
          messages.length,
          util.inspect(messages),
        ),
      );

      assertASTDidntChange(result.beforeAST, result.afterAST);
    }

    /**
     * Asserts that the message matches its expected value. If the expected
     * value is a regular expression, it is checked against the actual
     * value.
     */
    function assertMessageMatches(
      actual: string,
      expected: string | RegExp,
    ): void {
      if (expected instanceof RegExp) {
        // assert.js doesn't have a built-in RegExp match function
        assert.ok(
          expected.test(actual),
          `Expected '${actual}' to match ${expected}`,
        );
      } else {
        assert.strictEqual(actual, expected);
      }
    }

    /**
     * Check if the template is invalid or not
     * all invalid cases go through this.
     */
    function testInvalidTemplate(
      item: InvalidTestCase<TMessageIds, TOptions>,
    ): void {
      assert.ok(
        typeof item.code === 'string',
        "Test case must specify a string value for 'code'",
      );
      if (item.name) {
        assert.ok(
          typeof item.name === 'string',
          "Optional test case property 'name' must be a string",
        );
      }
      assert.ok(
        item.errors || item.errors === 0,
        `Did not specify errors for an invalid test of ${ruleName}`,
      );

      if (Array.isArray(item.errors) && item.errors.length === 0) {
        assert.fail('Invalid cases must have at least one error');
      }

      const ruleHasMetaMessages =
        hasOwnProperty(rule, 'meta') && hasOwnProperty(rule.meta, 'messages');
      const friendlyIDList = ruleHasMetaMessages
        ? `[${Object.keys(rule.meta.messages)
            .map(key => `'${key}'`)
            .join(', ')}]`
        : null;

      const result = runRuleForItem(item);
      const messages = result.messages;

      if (typeof item.errors === 'number') {
        if (item.errors === 0) {
          assert.fail("Invalid cases must have 'error' value greater than 0");
        }

        assert.strictEqual(
          messages.length,
          item.errors,
          util.format(
            'Should have %d error%s but had %d: %s',
            item.errors,
            item.errors === 1 ? '' : 's',
            messages.length,
            util.inspect(messages),
          ),
        );
      } else {
        assert.strictEqual(
          messages.length,
          item.errors.length,
          util.format(
            'Should have %d error%s but had %d: %s',
            item.errors.length,
            item.errors.length === 1 ? '' : 's',
            messages.length,
            util.inspect(messages),
          ),
        );

        const hasMessageOfThisRule = messages.some(m => m.ruleId === ruleName);

        for (let i = 0, l = item.errors.length; i < l; i++) {
          const error = item.errors[i];
          const message = messages[i];

          assert(
            hasMessageOfThisRule,
            'Error rule name should be the same as the name of the rule being tested',
          );

          if (typeof error === 'string' || error instanceof RegExp) {
            // Just an error message.
            assertMessageMatches(message.message, error);
          } else if (typeof error === 'object' && error != null) {
            /*
             * Error object.
             * This may have a message, messageId, data, node type, line, and/or
             * column.
             */

            Object.keys(error).forEach(propertyName => {
              assert.ok(
                ERROR_OBJECT_PARAMETERS.has(propertyName),
                `Invalid error property name '${propertyName}'. Expected one of ${FRIENDLY_ERROR_OBJECT_PARAMETER_LIST}.`,
              );
            });

            // @ts-expect-error -- we purposely don't define `message` on our types as the current standard is `messageId`
            if (hasOwnProperty(error, 'message')) {
              assert.ok(
                !hasOwnProperty(error, 'messageId'),
                "Error should not specify both 'message' and a 'messageId'.",
              );
              assert.ok(
                !hasOwnProperty(error, 'data'),
                "Error should not specify both 'data' and 'message'.",
              );
              assertMessageMatches(
                message.message,
                // @ts-expect-error -- we purposely don't define `message` on our types as the current standard is `messageId`
                error.message as unknown,
              );
            } else if (hasOwnProperty(error, 'messageId')) {
              assert.ok(
                ruleHasMetaMessages,
                "Error can not use 'messageId' if rule under test doesn't define 'meta.messages'.",
              );
              if (!hasOwnProperty(rule.meta.messages, error.messageId)) {
                assert(
                  false,
                  `Invalid messageId '${error.messageId}'. Expected one of ${friendlyIDList}.`,
                );
              }
              assert.strictEqual(
                message.messageId,
                error.messageId,
                `messageId '${message.messageId}' does not match expected messageId '${error.messageId}'.`,
              );
              if (hasOwnProperty(error, 'data')) {
                /*
                 *  if data was provided, then directly compare the returned message to a synthetic
                 *  interpolated message using the same message ID and data provided in the test.
                 *  See https://github.com/eslint/eslint/issues/9890 for context.
                 */
                const unformattedOriginalMessage =
                  rule.meta.messages[error.messageId];
                const rehydratedMessage = interpolate(
                  unformattedOriginalMessage,
                  error.data,
                );

                assert.strictEqual(
                  message.message,
                  rehydratedMessage,
                  `Hydrated message "${rehydratedMessage}" does not match "${message.message}"`,
                );
              }
            }

            assert.ok(
              hasOwnProperty(error, 'data')
                ? hasOwnProperty(error, 'messageId')
                : true,
              "Error must specify 'messageId' if 'data' is used.",
            );

            if (error.type) {
              assert.strictEqual(
                message.nodeType,
                error.type,
                `Error type should be ${error.type}, found ${message.nodeType}`,
              );
            }

            if (hasOwnProperty(error, 'line')) {
              assert.strictEqual(
                message.line,
                error.line,
                `Error line should be ${error.line}`,
              );
            }

            if (hasOwnProperty(error, 'column')) {
              assert.strictEqual(
                message.column,
                error.column,
                `Error column should be ${error.column}`,
              );
            }

            if (hasOwnProperty(error, 'endLine')) {
              assert.strictEqual(
                message.endLine,
                error.endLine,
                `Error endLine should be ${error.endLine}`,
              );
            }

            if (hasOwnProperty(error, 'endColumn')) {
              assert.strictEqual(
                message.endColumn,
                error.endColumn,
                `Error endColumn should be ${error.endColumn}`,
              );
            }

            if (hasOwnProperty(error, 'suggestions')) {
              // Support asserting there are no suggestions
              if (
                !error.suggestions ||
                (isReadonlyArray(error.suggestions) &&
                  error.suggestions.length === 0)
              ) {
                if (
                  Array.isArray(message.suggestions) &&
                  message.suggestions.length > 0
                ) {
                  assert.fail(
                    `Error should have no suggestions on error with message: "${message.message}"`,
                  );
                }
              } else {
                assert(
                  Array.isArray(message.suggestions),
                  `Error should have an array of suggestions. Instead received "${String(
                    message.suggestions,
                  )}" on error with message: "${message.message}"`,
                );
                const messageSuggestions = message.suggestions;
                assert.strictEqual(
                  messageSuggestions.length,
                  error.suggestions.length,
                  `Error should have ${error.suggestions.length} suggestions. Instead found ${messageSuggestions.length} suggestions`,
                );

                error.suggestions.forEach((expectedSuggestion, index) => {
                  assert.ok(
                    typeof expectedSuggestion === 'object' &&
                      expectedSuggestion != null,
                    "Test suggestion in 'suggestions' array must be an object.",
                  );
                  Object.keys(expectedSuggestion).forEach(propertyName => {
                    assert.ok(
                      SUGGESTION_OBJECT_PARAMETERS.has(propertyName),
                      `Invalid suggestion property name '${propertyName}'. Expected one of ${FRIENDLY_SUGGESTION_OBJECT_PARAMETER_LIST}.`,
                    );
                  });

                  const actualSuggestion = messageSuggestions[index];
                  const suggestionPrefix = `Error Suggestion at index ${index} :`;

                  // @ts-expect-error -- we purposely don't define `desc` on our types as the current standard is `messageId`
                  if (hasOwnProperty(expectedSuggestion, 'desc')) {
                    assert.ok(
                      !hasOwnProperty(expectedSuggestion, 'data'),
                      `${suggestionPrefix} Test should not specify both 'desc' and 'data'.`,
                    );
                    // @ts-expect-error -- we purposely don't define `desc` on our types as the current standard is `messageId`
                    const expectedDesc = expectedSuggestion.desc as string;
                    assert.strictEqual(
                      actualSuggestion.desc,
                      expectedDesc,
                      `${suggestionPrefix} desc should be "${expectedDesc}" but got "${actualSuggestion.desc}" instead.`,
                    );
                  }

                  if (hasOwnProperty(expectedSuggestion, 'messageId')) {
                    assert.ok(
                      ruleHasMetaMessages,
                      `${suggestionPrefix} Test can not use 'messageId' if rule under test doesn't define 'meta.messages'.`,
                    );
                    assert.ok(
                      hasOwnProperty(
                        rule.meta.messages,
                        expectedSuggestion.messageId,
                      ),
                      `${suggestionPrefix} Test has invalid messageId '${expectedSuggestion.messageId}', the rule under test allows only one of ${friendlyIDList}.`,
                    );
                    assert.strictEqual(
                      actualSuggestion.messageId,
                      expectedSuggestion.messageId,
                      `${suggestionPrefix} messageId should be '${expectedSuggestion.messageId}' but got '${actualSuggestion.messageId}' instead.`,
                    );
                    if (hasOwnProperty(expectedSuggestion, 'data')) {
                      const unformattedMetaMessage =
                        rule.meta.messages[expectedSuggestion.messageId];
                      const rehydratedDesc = interpolate(
                        unformattedMetaMessage,
                        expectedSuggestion.data,
                      );

                      assert.strictEqual(
                        actualSuggestion.desc,
                        rehydratedDesc,
                        `${suggestionPrefix} Hydrated test desc "${rehydratedDesc}" does not match received desc "${actualSuggestion.desc}".`,
                      );
                    }
                  } else {
                    assert.ok(
                      !hasOwnProperty(expectedSuggestion, 'data'),
                      `${suggestionPrefix} Test must specify 'messageId' if 'data' is used.`,
                    );
                  }

                  if (hasOwnProperty(expectedSuggestion, 'output')) {
                    const codeWithAppliedSuggestion =
                      SourceCodeFixer.applyFixes(item.code, [
                        actualSuggestion,
                      ]).output;

                    assert.strictEqual(
                      codeWithAppliedSuggestion,
                      expectedSuggestion.output,
                      `Expected the applied suggestion fix to match the test suggestion output for suggestion at index: ${index} on error with message: "${message.message}"`,
                    );
                  }
                });
              }
            }
          } else {
            // Message was an unexpected type
            assert.fail(
              `Error should be a string, object, or RegExp, but found (${util.inspect(
                message,
              )})`,
            );
          }
        }
      }

      if (hasOwnProperty(item, 'output')) {
        if (item.output == null) {
          assert.strictEqual(
            result.output,
            item.code,
            'Expected no autofixes to be suggested',
          );
        } else {
          assert.strictEqual(
            result.output,
            item.output,
            'Output is incorrect.',
          );
        }
      } else {
        assert.strictEqual(
          result.output,
          item.code,
          "The rule fixed the code. Please add 'output' property.",
        );
      }

      assertASTDidntChange(result.beforeAST, result.afterAST);
    }

    /*
     * This creates a mocha test suite and pipes all supplied info through
     * one of the templates above.
     */
    const constructor = this.constructor as typeof RuleTester;
    constructor.describe(ruleName, () => {
      constructor.describe('valid', () => {
        test.valid.forEach(valid => {
          const isOnly = typeof valid === 'object' && valid.only;
          const testName = ((): string => {
            if (typeof valid === 'object') {
              if (valid.name == null || valid.name.length === 0) {
                return valid.code;
              }
              return valid.name;
            }
            return valid;
          })();
          constructor[isOnly ? 'itOnly' : 'it'](sanitize(testName), () => {
            testValidTemplate(valid);
          });
        });
      });

      constructor.describe('invalid', () => {
        test.invalid.forEach(invalid => {
          const name = ((): string => {
            if (invalid.name == null || invalid.name.length === 0) {
              return invalid.code;
            }
            return invalid.name;
          })();
          constructor[invalid.only ? 'itOnly' : 'it'](sanitize(name), () => {
            testInvalidTemplate(invalid);
          });
        });
      });
    });
  }
}
