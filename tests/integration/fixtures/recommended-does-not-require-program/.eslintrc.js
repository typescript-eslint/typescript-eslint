// This integration test exists to make sure that the recommended config does
// not require a program to be specified to ensure a fast and simple initial
// setup. Users can add on one of our other configs if they want to opt in to
// more expensive checks.
module.exports = {
  root: true,
  // Local version of @typescript-eslint/parser
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    // Local version of @typescript-eslint/eslint-plugin
    '@typescript-eslint',
  ],
};
