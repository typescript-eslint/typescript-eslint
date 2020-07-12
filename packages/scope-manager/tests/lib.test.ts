import { parseAndAnalyze } from './util';
import { ImplicitLibVariable } from '../src';

describe('implicit lib definitions', () => {
  it('should define no implicit variables if provided an empty array', () => {
    const { scopeManager } = parseAndAnalyze('', {
      lib: [],
    });

    const variables = scopeManager.variables;
    expect(variables).toHaveLength(0);
  });

  it('should define implicit variables', () => {
    const { scopeManager } = parseAndAnalyze('', {
      lib: ['es2015'],
    });

    const variables = scopeManager.variables;
    expect(variables.length).toBeGreaterThan(0);

    const variable = variables[0];
    expect(variable).toBeInstanceOf(ImplicitLibVariable);
  });
});
