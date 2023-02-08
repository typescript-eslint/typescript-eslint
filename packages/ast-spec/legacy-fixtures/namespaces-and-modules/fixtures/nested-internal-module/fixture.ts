// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

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
