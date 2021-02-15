module.exports = {
  root: true,
  // Local version of @typescript-eslint/parser
  parser: '@typescript-eslint/parser',
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'markdown',
    // Local version of @typescript-eslint/eslint-plugin
    '@typescript-eslint',
  ],
  overrides: [
    {
      files: ['**/*.md'],
      processor: 'markdown/markdown',
    },
    {
      files: ['**/*.md/*.{js,ts,jsx,tsx,javascript,node}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        'no-console': 'error',
      },
    },
  ],
};
