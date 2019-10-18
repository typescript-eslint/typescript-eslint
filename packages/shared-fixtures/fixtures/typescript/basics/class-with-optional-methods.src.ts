const computed1 = "buzz";
const computed2 = "bazz";
const obj = {
  member: "member"
};
class Foo {
  foo?();
  bar?(): string;
  private baz?(): string;
  [computed1]?();
  [computed2]?() {};
  [1]?();
  [2]?() {};
  ["literal1"]?();
  ["literal2"]?() {};
  [obj.member]?() {};
}
