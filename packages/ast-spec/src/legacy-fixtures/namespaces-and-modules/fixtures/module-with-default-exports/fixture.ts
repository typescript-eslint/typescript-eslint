// TODO: This fixture might be too large, and if so should be split up.

module 'foo' {
  export default class C {
    method(): C {}
  }
  export default function bar() {}
}
