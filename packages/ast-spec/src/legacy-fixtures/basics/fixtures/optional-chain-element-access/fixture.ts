// TODO: This fixture might be too large, and if so should be split up.

function processOptionalElement(one?: any) {
  one?.[2];
  one?.[2][3];
  one[2]?.[3];
  one[2]?.[3];
  one[2]?.[3][4];
  one[2]?.[3]?.[4];
}
