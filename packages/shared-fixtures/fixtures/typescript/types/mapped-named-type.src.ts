type Test<T> = {
  [P in keyof T as 'a']: T[P];
};
