// TODO: This fixture should be migrated to a single-purpose fixture.
// See the ast-spec README.md for details.

function processOptionalElement(one?: any) {
  one?.[2];
  one?.[2][3];
  one[2]?.[3];
  one[2]?.[3];
  one[2]?.[3][4];
  one[2]?.[3]?.[4];
}
