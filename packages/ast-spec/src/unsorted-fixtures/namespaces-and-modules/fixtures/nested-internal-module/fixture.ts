// TODO: This fixture might be too large, and if so should be split up.

module A {
  export var x = 'hello world';
  export class Point {
    constructor(public x: number, public y: number) {}
  }
  export module B {
    export interface Id {
      name: string;
    }
  }
}
