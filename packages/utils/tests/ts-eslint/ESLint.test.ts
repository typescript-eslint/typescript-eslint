import { FlatESLint, LegacyESLint } from 'eslint/use-at-your-own-risk';

import type { FlatConfig } from '../../src/ts-eslint';

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
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const eslint = new ESLint.LegacyESLint({
        // accepts legacy configs
        baseConfig: {
          overrides: [],
          parserOptions: {},
        },
        overrideConfig: {
          overrides: [],
          parserOptions: {},
        },
      });
      expect(eslint).toBeInstanceOf(LegacyESLint);
    });

    it('config type permits basePath (type test)', () => {
      const __config: FlatConfig.Config = {
        basePath: 'some/path',
      };
    });
  });
});
