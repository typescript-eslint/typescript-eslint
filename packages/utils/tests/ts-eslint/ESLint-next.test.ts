import { ESLint as BaseESLint } from 'eslint';

import * as ESLint from '../../src/ts-eslint/ESLint';

vi.mock('eslint/use-at-your-own-risk', () => {
  return { default: {} };
});

describe('ESLint v10+', () => {
  describe('FlatESLint', () => {
    it('constructs successfully and has the correct base type', () => {
      const eslint = new ESLint.FlatESLint({
        // accepts flat configs
        baseConfig: [{ ignores: [] }, { languageOptions: {} }],
        overrideConfig: [{ ignores: [] }, { languageOptions: {} }],
      });
      expect(eslint).toBeInstanceOf(BaseESLint);
    });
  });
  describe('LegacyESLint', () => {
    it('constructor fails with an error', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        new ESLint.LegacyESLint();
      }).toThrowError(
        'LegacyESLint is not available with the current version of ESLint.',
      );
    });
    it('configType', () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        ESLint.LegacyESLint.configType,
      ).toBe('eslintrc');
    });
    it('version', () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        ESLint.LegacyESLint.version,
      ).toBe((BaseESLint as typeof ESLint.ESLint).version);
    });
    it('outputFixes fails with an error', async () => {
      await expect(async () =>
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        ESLint.LegacyESLint.outputFixes([]),
      ).rejects.toThrowError(
        'LegacyESLint is not available with the current version of ESLint.',
      );
    });
    it('getErrorResults fails with an error', () => {
      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        ESLint.LegacyESLint.getErrorResults({
          errorCount: 0,
          fatalErrorCount: 0,
          filePath: '',
          fixableErrorCount: 0,
          fixableWarningCount: 0,
          messages: [],
          suppressedMessages: [],
          usedDeprecatedRules: [],
          warningCount: 0,
        }),
      ).toThrowError(
        'LegacyESLint is not available with the current version of ESLint.',
      );
    });
  });
});
