import { ESLint } from 'eslint';
import useAtYourOwnRisk from 'eslint/use-at-your-own-risk';

import type { FlatConfig } from '../../src/ts-eslint';

import { FlatESLint, LegacyESLint } from '../../src/ts-eslint/ESLint';

describe('ESLint', () => {
  describe('Constructors', () => {
    it('flat constructs successfully and has the correct base type', () => {
      const eslint = new FlatESLint({
        // accepts flat configs
        baseConfig: [{ ignores: [] }, { languageOptions: {} }],
        overrideConfig: [{ ignores: [] }, { languageOptions: {} }],
      });
      if (useAtYourOwnRisk.FlatESLint) {
        expect(eslint).toBeInstanceOf(useAtYourOwnRisk.FlatESLint);
      } else {
        expect(eslint).toBeInstanceOf(ESLint);
      }
    });

    if (useAtYourOwnRisk.LegacyESLint) {
      it('legacy constructs successfully and has the correct base type', () => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const eslint = new LegacyESLint({
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
        expect(eslint).toBeInstanceOf(useAtYourOwnRisk.LegacyESLint);
      });
    } else {
      it('legacy throws an error', () => {
        expect(() => {
          // eslint-disable-next-line @typescript-eslint/no-deprecated
          new LegacyESLint();
        }).toThrowError(
          'LegacyESLint is not available with the current version of ESLint.',
        );
      });
    }

    it('config type permits basePath (type test)', () => {
      const __config: FlatConfig.Config = {
        basePath: 'some/path',
      };
    });
  });
});
