import rules from '../../src/rules';
import allConfig from '../../src/configs/all.json';

describe('all.json config', () => {
  const ruleNames = Object.keys(rules).map(
    name => `@typescript-eslint/${name}`,
  );

  it('contains all available rule modules', () => {
    expect(ruleNames).toEqual(
      expect.arrayContaining(Object.keys(allConfig.rules)),
    );
  });

  it('has all rules enabled either with "warn" or "error"', () => {
    expect(['warn', 'error']).toEqual(
      expect.arrayContaining(Object.values(allConfig.rules)),
    );
  });
});
