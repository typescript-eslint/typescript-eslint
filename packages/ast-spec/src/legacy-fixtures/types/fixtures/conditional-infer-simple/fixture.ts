// TODO: This fixture might be too large, and if so should be split up.

type Foo<T> = T extends { a: infer U; b: infer U } ? U : never;
