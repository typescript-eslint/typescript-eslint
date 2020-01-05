const computed = 'buzz';
const computed2 = 'bazz';
class Foo {
  foo?;
  bar? : string;
  private baz? : string;
  [computed]?;
  ['literal']?;
  [1]?;
  [computed2]?: string;
  ['literal2']?: string;
  [2]?: string;
}
