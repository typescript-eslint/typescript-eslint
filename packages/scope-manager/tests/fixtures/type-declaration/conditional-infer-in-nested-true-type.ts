type Test<T> = T extends (T extends unknown ? infer U : never) ? U : never;
