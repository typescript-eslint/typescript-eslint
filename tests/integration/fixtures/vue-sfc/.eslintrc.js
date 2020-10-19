module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  env: {
    es6: true,
    node: true,
  },
  extends: ['plugin:vue/essential'],
  parserOptions: {
    // Local version of @typescript-eslint/parser
    parser: '@typescript-eslint/parser',
    project: '/usr/linked/tsconfig.json',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  plugins: [
    // Local version of @typescript-eslint/eslint-plugin
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    'semi-spacing': 'error',
  },
};
