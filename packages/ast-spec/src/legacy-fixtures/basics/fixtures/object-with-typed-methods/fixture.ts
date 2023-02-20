// TODO: This fixture might be too large, and if so should be split up.

const foo = {
  constructor<T>(): number {
    return 1;
  },
  foo<T>(): number {
    return 1;
  },
  get a(): number {
    return 1;
  },
  set a(x: number): number {},
};
