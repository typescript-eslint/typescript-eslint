// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

const computed1 = 'buzz';
const computed2 = 'bazz';
const obj = {
  member: 'member',
  member2: 'member2',
};
class X {
  [computed1]?();
  [computed2]?() {}
  [1]?();
  [2]?() {}
  ['literal1']?();
  ['literal2']?() {}
  [obj.member]?() {}
  [obj.member2]?();
  [f()]?() {}
}
