function processOptionalElementParens(one?: any) {
  (one?.[2]);
  (one?.[2])[3];
  (one[2]?.[3]);
  (one[2]?.[3])[4];
  (one[2]?.[3]?.[4]);
  (one[2]?.[3]?.[4])[5];
}
