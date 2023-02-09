// TODO: This fixture might be too large, and if so should be split up.

const computed = 'buzz';
const computed2 = 'bazz';
class Foo {
  foo?;
  bar?: string;
  private baz?: string;
  [computed]?;
  ['literal']?;
  [1]?;
  [computed2]?: string;
  ['literal2']?: string;
  [2]?: string;
}
