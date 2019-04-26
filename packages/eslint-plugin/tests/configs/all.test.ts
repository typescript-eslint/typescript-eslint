import rules from '../../src/rules';
import allConfig from '../../src/configs/all.json';

describe('all.json config', () => {
  const ruleNames = Object.keys(rules).map(
    name => `@typescript-eslint/${name}`,
  );
  // with end of Node.js 6 support, we can use Object.values(allConfig.rules) here
  const configRules: Record<string, any> = allConfig.rules;
  const configRuleValues = Object.keys(configRules).map(
    key => configRules[key],
  );

  it('contains all available rule modules', () => {
    expect(ruleNames).toEqual(
      expect.arrayContaining(Object.keys(allConfig.rules)),
    );
  });

  it('has all rules enabled with "error"', () => {
    expect(['error']).toEqual(expect.arrayContaining(configRuleValues));
  });
});
