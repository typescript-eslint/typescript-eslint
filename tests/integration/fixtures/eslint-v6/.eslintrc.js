module.exports = {
  root: true,
  // Local version of @typescript-eslint/parser
  parser: '@typescript-eslint/parser',
  plugins: [
    // Local version of @typescript-eslint/eslint-plugin
    '@typescript-eslint',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
