// TODO: This fixture might be too large, and if so should be split up.

type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;
