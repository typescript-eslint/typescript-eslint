type Test<T> = T extends (T extends infer U ? U : never) ? U : never;
