import { rules } from '../src';
import { Linter, RuleTester } from 'eslint';
import { readFileSync } from 'fs';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {},
    /**
     * Project is needed to generate the parserServices
     * within @typescript-eslint/parser
     */
    project: './tests/tsconfig.json',
  },
  parser: '@typescript-eslint/parser',
});

/**
 * Inline rules should be supported
 */
const tslintRulesConfig = {
  rules: {
    semicolon: [true, 'always'],
  },
};

/**
 * Custom rules directories should be supported
 */
const tslintRulesDirectoryConfig = {
  rulesDirectory: ['./tests/test-tslint-rules-directory'],
  rules: {
    'always-fail': {
      severity: 'error',
    },
  },
};

ruleTester.run('tslint/config', rules.config, {
  valid: [
    {
      code: 'var foo = true;',
      options: [tslintRulesConfig],
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
      options: [
        {
          ...tslintRulesConfig,
        },
      ],
    },
    {
      code: 'throw "should be ok because rule is not loaded";',
      options: [tslintRulesConfig],
    },
  ],

  invalid: [
    {
      options: [{ lintFile: './tests/test-project/tslint.json' }],
      code: 'throw "err" // no-string-throw',
      errors: [
        {
          message:
            'Throwing plain strings (not instances of Error) gives no stack traces (tslint:no-string-throw)',
        },
      ],
    },
    {
      code: 'var foo = true // semicolon',
      options: [tslintRulesConfig],
      output: 'var foo = true // semicolon',
      errors: [
        {
          message: 'Missing semicolon (tslint:semicolon)',
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: 'var foo = true // fail',
      options: [tslintRulesDirectoryConfig],
      output: 'var foo = true // fail',
      errors: [
        {
          message: 'failure (tslint:always-fail)',
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
          message:
            "Operands of '+' operation must either be both strings or both numbers, consider using template literals (tslint:restrict-plus-operands)",
        },
      ],
    },
  ],
});

describe('tslint/error', () => {
  function testOutput(code: string, config: Linter.Config): void {
    const linter = new Linter();
    linter.defineRule('tslint/config', rules.config);

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
});
