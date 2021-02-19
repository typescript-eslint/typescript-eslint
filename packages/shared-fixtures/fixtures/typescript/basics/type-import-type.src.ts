type A = typeof import('A');
type B = import('B').X<Y>;
// prettier-ignore
type C = typeof /* test */ import('A');
