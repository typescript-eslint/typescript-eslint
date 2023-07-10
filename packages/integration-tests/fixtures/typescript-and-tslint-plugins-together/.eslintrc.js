module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', '@typescript-eslint/tslint'],
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
