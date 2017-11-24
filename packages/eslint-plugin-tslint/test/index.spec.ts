/**
 * @fileoverview TSLint wrapper plugin for ESLint
 * @author James Henry
 */
//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../lib/index').rules.config;
const RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

const parserOptions = {
  ecmaVersion: 6,
  sourceType: 'module',
  ecmaFeatures: {},
};

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
  rulesDirectory: ['./test/test-tslint-rules-directory'],
  rules: {
    'always-fail': {
      severity: 'error',
    },
  },
};

ruleTester.run('tslint/config', rule, {
  valid: [
    {
      code: 'var foo = true;',
      parser: 'typescript-eslint-parser',
      parserOptions,
      options: [tslintRulesConfig],
    },
  ],

  invalid: [
    {
      code: 'var foo = true',
      parser: 'typescript-eslint-parser',
      parserOptions,
      options: [tslintRulesConfig],
      output: 'var foo = true',
      errors: [
        {
          message: 'Missing semicolon (tslint:semicolon)',
          line: 1,
          column: 15,
        },
      ],
    },
    {
      code: 'var foo = true',
      parser: 'typescript-eslint-parser',
      parserOptions,
      options: [tslintRulesDirectoryConfig],
      output: 'var foo = true',
      errors: [
        {
          message: 'failure (tslint:always-fail)',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});
