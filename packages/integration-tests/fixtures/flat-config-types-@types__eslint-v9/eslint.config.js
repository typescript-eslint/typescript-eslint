// @ts-check

import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import deprecationPlugin from 'eslint-plugin-deprecation';
import jestPlugin from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';

import __dirname from './dirname.cjs';

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
  allConfig: {},
});

// this config is run through eslint as part of the integration test
// so it needs to be a correct config
export default tseslint.config(
  {
    // config with just ignores is the replacement for `.eslintignore`
    ignores: ['**/build/**', '**/dist/**', 'src/some/file/to/ignore.ts'],
  },
  {
    plugins: {
      ['@typescript-eslint']: tseslint.plugin,
      ['deprecation']: deprecationPlugin,
      ['jest']: jestPlugin,
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  stylisticPlugin.configs['recommended-flat'],
);

// wrapped in a function so they aren't executed at lint time
function _otherCases() {
  // these are just tests for the types and are not seen by eslint so they can be whatever
  tseslint.config({
    plugins: {
      ['@stylistic']: stylisticPlugin,
      ['@typescript-eslint']: tseslint.plugin,
      ['deprecation']: deprecationPlugin,
      ['jest']: jestPlugin,
    },
  });
  tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    stylisticPlugin.configs['recommended-flat'],
    jestPlugin.configs['flat/recommended'],
  );
  tseslint.config(
    // @ts-expect-error
    compat.config(deprecationPlugin.configs.recommended),
    ...compat.config(jestPlugin.configs.recommended),
  );
  tseslint.config(
    // @ts-expect-error
    deprecationPlugin.configs.recommended,
    // this should error but doesn't because there are no types exported from the jest plugin
    jestPlugin.configs.recommended,
    // this should error but doesn't because there are no types exported from the jest plugin
    ...jestPlugin.configs['flat/recommended'],
  );
}
