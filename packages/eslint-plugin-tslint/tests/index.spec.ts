import { TSESLint } from '@typescript-eslint/experimental-utils';
import * as parser from '@typescript-eslint/parser';
import { readFileSync } from 'fs';
import rule, { Options } from '../src/rules/config';

const ruleTester = new TSESLint.RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
    /**
     * Project is needed to generate the parserServices
     * within @typescript-eslint/parser
     */
    project: './tests/fixture-project/tsconfig.json',
  },
  parser: require.resolve('@typescript-eslint/parser'),
});

/**
 * Inline rules should be supported
 */
const tslintRulesConfig: Options = [
  {
    rules: {
      semicolon: [true, 'always'],
    },
  },
];

/**
 * Custom rules directories should be supported
 */
const tslintRulesDirectoryConfig: Options = [
  {
    rulesDirectory: ['./tests/test-tslint-rules-directory'],
    rules: {
      'always-fail': {
        severity: 'error',
      },
    },
  },
];

ruleTester.run('tslint/config', rule, {
  valid: [
    {
      code: 'var foo = true;',
      options: tslintRulesConfig,
      filename: './tests/fixture-project/1.ts',
    },
    {
      filename: './tests/test-project/file-spec.ts',
      code: readFileSync('./tests/test-project/file-spec.ts', 'utf8').replace(
        /\n/g,
        ' ',
      ),
      parserOptions: {
        project: `${__dirname}/test-project/tsconfig.json`,
      },
      options: tslintRulesConfig,
    },
    {
      code: 'throw "should be ok because rule is not loaded";',
      options: tslintRulesConfig,
      filename: './tests/fixture-project/2.ts',
    },
  ],

  invalid: [
    {
      options: [{ lintFile: './tests/test-project/tslint.json' }],
      code: 'throw "err" // no-string-throw',
      filename: './tests/fixture-project/3.ts',
      errors: [
        {
          messageId: 'failure',
          data: {
            message:
              'Throwing plain strings (not instances of Error) gives no stack traces',
            ruleName: 'no-string-throw',
          },
        },
      ],
    },
    {
      code: 'var foo = true // semicolon',
      options: tslintRulesConfig,
      output: 'var foo = true // semicolon',
      filename: './tests/fixture-project/4.ts',
      errors: [
        {
          messageId: 'failure',
          data: {
            message: 'Missing semicolon',
            ruleName: 'semicolon',
          },
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: 'var foo = true // fail',
      options: tslintRulesDirectoryConfig,
      output: 'var foo = true // fail',
      filename: './tests/fixture-project/5.ts',
      errors: [
        {
          messageId: 'failure',
          data: {
            message: 'failure',
            ruleName: 'always-fail',
          },
          line: 1,
          column: 1,
        },
      ],
    },
    {
      filename: './tests/test-project/source.ts',
      code: readFileSync('./tests/test-project/source.ts', 'utf8').replace(
        /\n/g,
        ' ',
      ),
      parserOptions: {
        project: `${__dirname}/test-project/tsconfig.json`,
      },
      options: [
        {
          rulesDirectory: [
            `${__dirname}/../../../node_modules/tslint/lib/rules`,
          ],
          rules: { 'restrict-plus-operands': true },
        },
      ],
      errors: [
        {
          messageId: 'failure',
          data: {
            message:
              'Operands of \'+\' operation must either be both strings or both numbers, but found 1 + "2". Consider using template literals.',
            ruleName: 'restrict-plus-operands',
          },
        },
      ],
    },
  ],
});

describe('tslint/error', () => {
  function testOutput(code: string, config: TSESLint.Linter.Config): void {
    const linter = new TSESLint.Linter();
    linter.defineRule('tslint/config', rule);
    linter.defineParser('@typescript-eslint/parser', parser);

    expect(() => linter.verify(code, config)).toThrow(
      `You must provide a value for the "parserOptions.project" property for @typescript-eslint/parser`,
    );
  }

  it('should error on missing project', () => {
    testOutput('foo;', {
      rules: {
        'tslint/config': [2, tslintRulesConfig],
      },
      parser: '@typescript-eslint/parser',
    });
  });

  it('should error on default parser', () => {
    testOutput('foo;', {
      parserOptions: {
        project: `${__dirname}/test-project/tsconfig.json`,
      },
      rules: {
        'tslint/config': [2, tslintRulesConfig],
      },
    });
  });

  it('should not crash if there are no tslint rules specified', () => {
    const linter = new TSESLint.Linter();
    jest.spyOn(console, 'warn').mockImplementation();
    linter.defineRule('tslint/config', rule);
    linter.defineParser('@typescript-eslint/parser', parser);
    expect(() =>
      linter.verify(
        'foo;',
        {
          parserOptions: {
            project: `${__dirname}/test-project/tsconfig.json`,
          },
          rules: {
            'tslint/config': [2, {}],
          },
          parser: '@typescript-eslint/parser',
        },
        `${__dirname}/test-project/extra.ts`,
      ),
    ).not.toThrow();

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        `Tried to lint ${__dirname}/test-project/extra.ts but found no valid, enabled rules for this file type and file path in the resolved configuration.`,
      ),
    );
    jest.resetAllMocks();
  });
});
