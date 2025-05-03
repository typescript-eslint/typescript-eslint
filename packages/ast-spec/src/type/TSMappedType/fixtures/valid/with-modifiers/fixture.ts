type T = {
  readonly [P in string]?: number;
  +readonly [P in string]: number;
  -readonly [P in string]-?: number;
};
