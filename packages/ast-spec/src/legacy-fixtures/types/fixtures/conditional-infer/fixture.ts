// TODO: This fixture might be too large, and if so should be split up.

type Element<T> = T extends (infer U)[] ? U : T;
