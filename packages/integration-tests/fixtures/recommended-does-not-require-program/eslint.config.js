import js from '@eslint/js';
import tseslint from 'typescript-eslint';

// This integration test exists to make sure that the recommended config does
// not require a program to be specified to ensure a fast and simple initial
// setup. Users can add on one of our other configs if they want to opt in to
// more expensive checks.
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
