module.exports = {
  root: true,
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/restrict-plus-operands': 'error'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false
    }
  }
};
