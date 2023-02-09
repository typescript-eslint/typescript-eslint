// TODO: This fixture might be too large, and if so should be split up.

type Foo = {
  h(bar: string): void;
  g<T>(bar: T): T;
};
