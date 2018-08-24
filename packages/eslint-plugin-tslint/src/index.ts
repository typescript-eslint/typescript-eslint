/**
 * @fileoverview TSLint wrapper plugin for ESLint
 * @author James Henry
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import { Linter as TSLintLinter, RuleSeverity, Configuration } from 'tslint';
import * as ts from 'typescript';
import { Rule } from 'eslint';
import { createService } from 'typescript-service';

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

type RawRuleConfig =
  | null
  | undefined
  | boolean
  | any[]
  | {
      severity?: RuleSeverity | 'warn' | 'none' | 'default';
      options?: any;
    };

interface RawRulesConfig {
  [key: string]: RawRuleConfig;
}

interface TSLintPluginOptions {
  rulesDirectory?: string[];
  rules?: RawRulesConfig;
}

let languageService: ReturnType<typeof createService>;

export const rules = {
  /**
   * Expose a single rule called "config", which will be accessed in the user's eslint config files
   * via "tslint/config"
   */
  config: {
    meta: {
      docs: {
        description:
          'Wraps a TSLint configuration and lints the whole source using TSLint',
        category: 'TSLint',
      },
      fixable: false,
      schema: [
        {
          type: 'object',
          properties: {
            rules: {
              type: 'object',
              /**
               * No fixed schema properties for rules, as this would be a permanently moving target
               */
              additionalProperties: true,
            },
            rulesDirectory: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
            configFile: {
              type: 'string',
            },
            compilerOptions: {
              type: 'object',
              additionalProperties: true,
            },
          },
          additionalProperties: false,
        },
      ],
    },
    create: function(context: Rule.RuleContext) {
      const fileName = context.getFilename();
      const sourceCode = context.getSourceCode().text;

      /**
       * The TSLint rules configuration passed in by the user
       */
      const {
        rules: tslintRules,
        rulesDirectory: tslintRulesDirectory,
        configFile,
        compilerOptions,
      } = context.options[0];

      const tslintOptions = {
        formatter: 'json',
        fix: false,
        rulesDirectory: tslintRulesDirectory,
      };

      /**
       * Manually construct a configFile for TSLint
       */
      const rawConfig: TSLintPluginOptions = {};
      rawConfig.rules = tslintRules || {};
      rawConfig.rulesDirectory = tslintRulesDirectory || [];

      const tslintConfig = Configuration.parseConfigFile(rawConfig);

      let program: ts.Program | undefined = undefined;

      if (fileName !== '<input>' && configFile) {
        if (!languageService) {
          languageService = createService({ configFile, compilerOptions });
        }
        program = languageService.getProgram();
      }

      /**
       * Create an instance of TSLint
       */
      const tslint = new TSLintLinter(tslintOptions, program);

      /**
       * Lint the source code using the configured TSLint instance, and the rules which have been
       * passed via the ESLint rule options for this rule (using "tslint/config")
       */
      tslint.lint(fileName, sourceCode, tslintConfig);

      const result = tslint.getResult();

      /**
       * Format the TSLint results for ESLint
       */
      if (result.failures && result.failures.length) {
        result.failures.forEach(failure => {
          const start = failure.getStartPosition().getLineAndCharacter();
          const end = failure.getEndPosition().getLineAndCharacter();
          context.report({
            message: `${failure.getFailure()} (tslint:${failure.getRuleName()})`,
            loc: {
              start: {
                line: start.line + 1,
                column: start.character,
              },
              end: {
                line: end.line + 1,
                column: end.character,
              },
            },
          });
        });
      }

      /**
       * Return an empty object for the ESLint rule
       */
      return {};
    },
  },
};
