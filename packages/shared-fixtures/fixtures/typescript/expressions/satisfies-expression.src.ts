x satisfies T;
x < y satisfies boolean; // (x < y) satisfies boolean;
x === 1 satisfies number; // x === (1 satisfies number);
x satisfies any satisfies T;

const t2 = { a: 1, b: 1 } satisfies I1; // Error
const t3 = { } satisfies I1; // Error
const t4: T1 = { a: "a" } satisfies T1; // Ok
const t5 = (m => m.substring(0)) satisfies T2; // Ok
const t6 = [1, 2] satisfies [number, number];
