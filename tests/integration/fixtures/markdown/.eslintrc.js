module.exports = {
  root: true,
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
  plugins: ['markdown', '@typescript-eslint'],
  overrides: [
    {
      // this will also ensure that eslint will force lint the markdown files
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
