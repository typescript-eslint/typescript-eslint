import { ESLintUtils } from '@typescript-eslint/utils';
import { memoize } from 'lodash';
import type { RuleSeverity } from 'tslint';
import { Configuration } from 'tslint';

import { CustomLinter } from '../custom-linter';

// note - cannot migrate this to an import statement because it will make TSC copy the package.json to the dist folder
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const version: string = require('../../package.json');

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
      rules: tslintRules ?? {},
      rulesDirectory: tslintRulesDirectory ?? [],
    });
  },
  (
    lintFile: string | undefined,
    tslintRules = {},
    tslintRulesDirectory: string[] = [],
  ) =>
    `${lintFile}_${JSON.stringify(tslintRules)}_${tslintRulesDirectory.join()}`,
);

export default createRule<Options, MessageIds>({
  name: 'config',
  meta: {
    docs: {
      description:
        'Wraps a TSLint configuration and lints the whole source using TSLint', // eslint-disable-line eslint-plugin/require-meta-docs-description
    },
    fixable: 'code',
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
  create(
    context,
    [{ rules: tslintRules, rulesDirectory: tslintRulesDirectory, lintFile }],
  ) {
    const fileName = context.getFilename();
    const sourceCode = context.getSourceCode().text;
    const services = ESLintUtils.getParserServices(context);
    const program = services.program;

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
    if (result.failures?.length) {
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
          fix: fixer => {
            const replacements = failure.getFix();

            return Array.isArray(replacements)
              ? replacements.map(replacement =>
                  fixer.replaceTextRange(
                    [replacement.start, replacement.end],
                    replacement.text,
                  ),
                )
              : replacements !== undefined
              ? fixer.replaceTextRange(
                  [replacements.start, replacements.end],
                  replacements.text,
                )
              : [];
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
