import { createParseSettings } from '../../src/parseSettings/createParseSettings';

describe('createParseSettings', () => {
  describe('tsconfigMatchCache', () => {
    it('reuses the TSConfig match cache when called a subsequent time', () => {
      const parseSettings1 = createParseSettings('input.ts');
      const parseSettings2 = createParseSettings('input.ts');

      expect(parseSettings1.tsconfigMatchCache).toBe(
        parseSettings2.tsconfigMatchCache,
      );
    });
  });
});
