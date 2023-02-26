// TODO: This fixture might be too large, and if so should be split up.

type Test<T> = {
  [P in keyof T as 'a']: T[P];
};
