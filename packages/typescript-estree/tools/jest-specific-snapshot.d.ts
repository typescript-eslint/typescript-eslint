/// <reference types="jest" />

declare namespace jest {
  interface Matchers<R, T> {
    toMatchSpecificSnapshot(fileName: string): R;
  }
}
