// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

module 'foo' {
  export default class C {
    method(): C {}
  }
  export default function bar() {}
}
