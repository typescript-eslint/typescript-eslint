import {
  cloneDeeplyExcludesParent,
  isEqualToCloneExcludingParent,
} from '../src/utils/cloneDeeplyExcludesParent';

describe(isEqualToCloneExcludingParent, () => {
  const create = (): Record<string, unknown> => {
    const child: Record<string, unknown> = {
      kind: 'child',
      range: [1, 2],
      value: /a/g,
    };
    const root = { body: [child, null], kind: 'root', n: -0 };
    child.parent = root;
    return root;
  };

  it('returns true for an unchanged value, ignoring parent', () => {
    const value = create();
    const clone = cloneDeeplyExcludesParent(value);

    expect(isEqualToCloneExcludingParent(clone, value)).toBe(true);
    (value.body as Record<string, unknown>[])[0].parent = {};
    expect(isEqualToCloneExcludingParent(clone, value)).toBe(true);
  });

  it.for([
    ['changed value', (v: Record<string, unknown>): unknown => (v.kind = 'X')],
    ['added key', (v: Record<string, unknown>): unknown => (v.extra = 1)],
    ['removed key', (v: Record<string, unknown>): unknown => delete v.kind],
    ['-0 to 0', (v: Record<string, unknown>): unknown => (v.n = 0)],
    [
      'array length',
      (v: Record<string, unknown>): unknown => (v.body as unknown[]).pop(),
    ],
    [
      'object to array',
      (v: Record<string, unknown>): unknown => (v.body = { length: 2 }),
    ],
    [
      'sparse array',
      (v: Record<string, unknown>): unknown =>
        Reflect.deleteProperty(v.body as unknown[], 1),
    ],
  ] as const)('returns false for %s', ([, mutate]) => {
    const value = create();
    const clone = cloneDeeplyExcludesParent(value);
    mutate(value);

    expect(isEqualToCloneExcludingParent(clone, value)).toBe(false);
  });
});
