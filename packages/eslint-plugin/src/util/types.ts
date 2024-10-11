export type MakeRequired<Base, Key extends keyof Base> = {
  [K in Key]-?: NonNullable<Base[Key]>;
} & Omit<Base, Key>;

export type ValueOf<T> = T[keyof T];
