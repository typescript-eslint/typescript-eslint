export type MakeRequired<Base, Key extends keyof Base> = Omit<Base, Key> & {
  [K in Key]-?: NonNullable<Base[Key]>;
};

export type ValueOf<T> = T[keyof T];
