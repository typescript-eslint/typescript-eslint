import { Rule } from 'eslint';
import memoize from 'lodash.memoize';
import { Configuration, RuleSeverity } from 'tslint';
import { Program } from 'typescript';
import { CustomLinter } from './custom-linter';

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

/**
 * @todo share types between packages
 */
interface ParserServices {
  program: Program | undefined;
  esTreeNodeToTSNodeMap: WeakMap<object, any> | undefined;
  tsNodeToESTreeNodeMap: WeakMap<object, any> | undefined;
}

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

/**
 * Construct a configFile for TSLint
 */
const tslintConfig = memoize(
  (
    lintFile: string,
    tslintRules: RawRulesConfig,
    tslintRulesDirectory: string[]
  ) => {
    if (lintFile != null) {
      return Configuration.loadConfigurationFromPath(lintFile);
    }
    return Configuration.parseConfigFile({
      rules: tslintRules || {},
      rulesDirectory: tslintRulesDirectory || []
    });
  },
  (lintFile: string | undefined, tslintRules = {}, tslintRulesDirectory = []) =>
    `${lintFile}_${Object.keys(tslintRules).join(',')}_${
      tslintRulesDirectory.length
    }`
);

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
        category: 'TSLint'
      },
      schema: [
        {
          type: 'object',
          properties: {
            rules: {
              type: 'object',
              /**
               * No fixed schema properties for rules, as this would be a permanently moving target
               */
              additionalProperties: true
            },
            rulesDirectory: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            lintFile: {
              type: 'string'
            }
          },
          additionalProperties: false
        }
      ]
    },
    create: function(context: Rule.RuleContext) {
      const fileName = context.getFilename();
      const sourceCode = context.getSourceCode().text;
      const parserServices: ParserServices | undefined = context.parserServices;

      /**
       * The user needs to have configured "project" in their parserOptions
       * for typescript-eslint-parser
       */
      if (!parserServices || !parserServices.program) {
        throw new Error(
          `You must provide a value for the "parserOptions.project" property for typescript-eslint-parser`
        );
      }

      /**
       * The TSLint rules configuration passed in by the user
       */
      const {
        rules: tslintRules,
        rulesDirectory: tslintRulesDirectory,
        lintFile
      } = context.options[0];

      const program: Program = parserServices.program;

      /**
       * Create an instance of TSLint
       * Lint the source code using the configured TSLint instance, and the rules which have been
       * passed via the ESLint rule options for this rule (using "tslint/config")
       */
      const tslintOptions = {
        formatter: 'json',
        fix: false
      };
      const tslint = new CustomLinter(tslintOptions, program);
      const configuration = tslintConfig(
        lintFile,
        tslintRules,
        tslintRulesDirectory
      );
      tslint.lint(fileName, sourceCode, configuration);

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
                column: start.character
              },
              end: {
                line: end.line + 1,
                column: end.character
              }
            }
          });
        });
      }

      /**
       * Return an empty object for the ESLint rule
       */
      return {};
    }
  }
};
