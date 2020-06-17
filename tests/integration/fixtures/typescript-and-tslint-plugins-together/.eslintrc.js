module.exports = {
  root: true,
  // Local version of @typescript-eslint/parser
  parser: '@typescript-eslint/parser',
  plugins: [
    // Local version of @typescript-eslint/eslint-plugin
    '@typescript-eslint',
    // Local version of @typescript-eslint/eslint-plugin-tslint
    '@typescript-eslint/tslint',
  ],
  env: {
    es6: true,
    node: true,
  },
  extends: ['plugin:@typescript-eslint/recommended'],
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
    },
    project: '/usr/linked/tsconfig.json',
  },
  rules: {
    '@typescript-eslint/tslint/config': [
      'error',
      {
        rules: {
          semicolon: [true, 'always'],
        },
      },
    ],
  },
};
