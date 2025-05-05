type ReadonlyOptional = {
  readonly [P in string]?: number;
};

type PlusReadonly = {
  +readonly [P in string]: number;
};

type MinusReadonlyOptional = {
  -readonly [P in string]-?: number;
};
