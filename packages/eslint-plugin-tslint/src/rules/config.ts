import {
  ESLintUtils,
  ParserServices,
} from '@typescript-eslint/experimental-utils';
import memoize from 'lodash.memoize';
import { Configuration, RuleSeverity } from 'tslint';
import { CustomLinter } from '../custom-linter';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
const version = require('../../package.json').version;

const createRule = ESLintUtils.RuleCreator(
  () =>
    `https://github.com/typescript-eslint/typescript-eslint/blob/v${version}/packages/eslint-plugin-tslint/README.md`,
);
export type RawRulesConfig = Record<
  string,
  | null
  | undefined
  | boolean
  | unknown[]
  | {
      severity?: RuleSeverity | 'warn' | 'none' | 'default';
      options?: unknown;
    }
>;

export type MessageIds = 'failure';
export type Options = [
  {
    rules?: RawRulesConfig;
    rulesDirectory?: string[];
    lintFile?: string;
  },
];

/**
 * Construct a configFile for TSLint
 */
const tslintConfig = memoize(
  (
    lintFile?: string,
    tslintRules?: RawRulesConfig,
    tslintRulesDirectory?: string[],
  ) => {
    if (lintFile != null) {
      return Configuration.loadConfigurationFromPath(lintFile);
    }
    return Configuration.parseConfigFile({
      rules: tslintRules || {},
      rulesDirectory: tslintRulesDirectory || [],
    });
  },
  (lintFile: string | undefined, tslintRules = {}, tslintRulesDirectory = []) =>
    `${lintFile}_${Object.keys(tslintRules).join(',')}_${
      tslintRulesDirectory.length
    }`,
);

export default createRule<Options, MessageIds>({
  name: 'config',
  meta: {
    docs: {
      description:
        'Wraps a TSLint configuration and lints the whole source using TSLint',
      // one off special category for this plugin
      category: 'TSLint' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      recommended: false,
    },
    type: 'problem',
    messages: {
      failure: '{{message}} (tslint:{{ruleName}})',
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
            additionalProperties: true,
          },
          rulesDirectory: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          lintFile: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{}],
  create(context) {
    const fileName = context.getFilename();
    const sourceCode = context.getSourceCode().text;
    const parserServices: ParserServices | undefined = context.parserServices;

    /**
     * The user needs to have configured "project" in their parserOptions
     * for @typescript-eslint/parser
     */
    if (!parserServices || !parserServices.program) {
      throw new Error(
        `You must provide a value for the "parserOptions.project" property for @typescript-eslint/parser`,
      );
    }

    /**
     * The TSLint rules configuration passed in by the user
     */
    const {
      rules: tslintRules,
      rulesDirectory: tslintRulesDirectory,
      lintFile,
    } = context.options[0];

    const program = parserServices.program;

    /**
     * Create an instance of TSLint
     * Lint the source code using the configured TSLint instance, and the rules which have been
     * passed via the ESLint rule options for this rule (using "tslint/config")
     */
    const tslintOptions = {
      formatter: 'json',
      fix: false,
    };
    const tslint = new CustomLinter(tslintOptions, program);
    const configuration = tslintConfig(
      lintFile,
      tslintRules,
      tslintRulesDirectory,
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
          messageId: 'failure',
          data: {
            message: failure.getFailure(),
            ruleName: failure.getRuleName(),
          },
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
});
