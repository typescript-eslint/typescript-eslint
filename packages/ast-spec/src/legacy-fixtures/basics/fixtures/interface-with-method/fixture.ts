// TODO: This fixture might be too large, and if so should be split up.

interface test {
  h(bar: string): void;
  g<T>(bar: T): T;
}
