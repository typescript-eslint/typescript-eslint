import { FlatESLint, LegacyESLint } from 'eslint/use-at-your-own-risk';

import * as ESLint from '../../src/ts-eslint/ESLint';

describe('ESLint', () => {
  describe('Constructs successfully and has the correct base type', () => {
    it('flat', () => {
      const eslint = new ESLint.FlatESLint({
        // accepts flat configs
        baseConfig: [{ ignores: [] }, { languageOptions: {} }],
        overrideConfig: [{ ignores: [] }, { languageOptions: {} }],
      });
      expect(eslint).toBeInstanceOf(FlatESLint);
    });
    it('legacy', () => {
      const eslint = new ESLint.LegacyESLint({
        // accepts legacy configs
        baseConfig: {
          parserOptions: {},
          overrides: [],
        },
        overrideConfig: {
          parserOptions: {},
          overrides: [],
        },
      });
      expect(eslint).toBeInstanceOf(LegacyESLint);
    });
  });
});
