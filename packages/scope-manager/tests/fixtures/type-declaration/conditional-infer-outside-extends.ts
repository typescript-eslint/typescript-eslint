type Test<T> = T extends unknown ? infer U : never;
