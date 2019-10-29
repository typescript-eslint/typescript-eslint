/**
 * This is a compatibility ruleset that converts rules from Airbnb
 * which can be handled better by TypeScript.
 */

const {
  rules: baseBestPracticesRules,
} = require('eslint-config-airbnb-base/rules/best-practices');
const {
  rules: baseErrorsRules,
} = require('eslint-config-airbnb-base/rules/errors');
const { rules: baseES6Rules } = require('eslint-config-airbnb-base/rules/es6');
const {
  rules: baseStyleRules,
} = require('eslint-config-airbnb-base/rules/style');
const {
  rules: baseVariablesRules,
} = require('eslint-config-airbnb-base/rules/variables');

module.exports = {
  extends: [
    // Disable checks overlapping with the ones built into TypeScript
    'plugin:@typescript-eslint/eslint-recommended',

    // Add support for resolving TS imports
    'plugin:import/typescript',
  ],

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        // Using a type system makes it safe enough to spread props
        'react/jsx-props-no-spreading': 'off',
      },
    },
  ],

  rules: {
    // Allow .tsx files to have JSX
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],

    'brace-style': 'off',
    '@typescript-eslint/brace-style': baseStyleRules['brace-style'],

    camelcase: 'off',
    '@typescript-eslint/camelcase': baseStyleRules.camelcase,

    'func-call-spacing': 'off',
    '@typescript-eslint/func-call-spacing': baseStyleRules['func-call-spacing'],

    indent: 'off',
    '@typescript-eslint/indent': baseStyleRules.indent,

    'no-array-constructor': 'off',
    '@typescript-eslint/no-array-constructor':
      baseStyleRules['no-array-constructor'],

    'no-empty-function': 'off',
    '@typescript-eslint/no-empty-function':
      baseBestPracticesRules['no-empty-function'],

    'no-extra-parens': 'off',
    '@typescript-eslint/no-extra-parens': baseErrorsRules['no-extra-parens'],

    'no-magic-numbers': 'off',
    '@typescript-eslint/no-magic-numbers':
      baseBestPracticesRules['no-magic-numbers'],

    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': baseVariablesRules['no-unused-vars'],

    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        ...baseVariablesRules['no-use-before-define'][1],
        typedefs: true,
      },
    ],

    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor':
      baseES6Rules['no-useless-constructor'],

    quotes: 'off',
    '@typescript-eslint/quotes': baseStyleRules.quotes,

    semi: 'off',
    '@typescript-eslint/semi': baseStyleRules.semi,
  },
};
