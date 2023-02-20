// TODO: This fixture might be too large, and if so should be split up.

// in a global file:

var abc = 100;

// Refers to 'abc' from above.
globalThis.abc = 200;

let answer = 42;

// error! Property 'answer' does not exist on 'typeof globalThis'.
globalThis.answer = 333333;
