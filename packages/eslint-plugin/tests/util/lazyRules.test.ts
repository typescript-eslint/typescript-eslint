import { lazyRules } from '../../src/util/lazyRules.js';

describe(lazyRules, () => {
  const ruleA = { create: () => ({}) } as never;
  const ruleB = { create: () => ({}) } as never;

  it('does not load any rule when created or enumerated', () => {
    const loadA = vi.fn(() => ({ default: ruleA }));
    const loadB = vi.fn(() => ({ default: ruleB }));

    const rules = lazyRules({ a: loadA, b: loadB });

    expect(Object.keys(rules)).toStrictEqual(['a', 'b']);

    expect(loadA).not.toHaveBeenCalled();
    expect(loadB).not.toHaveBeenCalled();
  });

  it('loads only the accessed rule and returns its default export', () => {
    const loadA = vi.fn(() => ({ default: ruleA }));
    const loadB = vi.fn(() => ({ default: ruleB }));

    const rules = lazyRules({ a: loadA, b: loadB });

    expect(rules.a).toBe(ruleA);

    expect(loadA).toHaveBeenCalledOnce();
    expect(loadB).not.toHaveBeenCalled();
  });
});
