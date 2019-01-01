type Foo<T> = T extends { a: infer U, b: infer U } ? U : never;
