import { noFormat, RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-for-of';

const ruleTester = new RuleTester();

ruleTester.run('prefer-for-of', rule, {
  assertionOptions: {
    requireData: true,
  },
  valid: [
    `
for (let i = 0; i < arr1.length; i++) {
  const x = arr1[i] === arr2[i];
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  arr[i] = 0;
}
    `,
    `
for (var c = 0; c < arr.length; c++) {
  doMath(c);
}
    `,
    `
for (var d = 0; d < arr.length; d++) doMath(d);
    `,
    `
for (var e = 0; e < arr.length; e++) {
  if (e > 5) {
    doMath(e);
  }
  console.log(arr[e]);
}
    `,
    `
for (var f = 0; f <= 40; f++) {
  doMath(f);
}
    `,
    `
for (var g = 0; g <= 40; g++) doMath(g);
    `,
    `
for (var h = 0, len = arr.length; h < len; h++) {}
    `,
    `
for (var i = 0, len = arr.length; i < len; i++) arr[i];
    `,
    `
var m = 0;
for (;;) {
  if (m > 3) break;
  console.log(m);
  m++;
}
    `,
    `
var n = 0;
for (; n < 9; n++) {
  console.log(n);
}
    `,
    `
var o = 0;
for (; o < arr.length; o++) {
  console.log(arr[o]);
}
    `,
    `
for (; x < arr.length; x++) {}
    `,
    `
for (let x = 0; ; x++) {}
    `,
    `
for (let x = 0; x < arr.length;) {}
    `,
    `
for (let x = 0; NOTX < arr.length; x++) {}
    `,
    `
for (let x = 0; x < arr.length; NOTX++) {}
    `,
    `
for (let NOTX = 0; x < arr.length; x++) {}
    `,
    `
for (let x = 0; x < arr.length; x--) {}
    `,
    `
for (let x = 0; x <= arr.length; x++) {}
    `,
    `
for (let x = 1; x < arr.length; x++) {}
    `,
    `
for (let x = 0; x < arr.length(); x++) {}
    `,
    `
for (let x = 0; x < arr.length; x += 11) {}
    `,
    `
for (let x = arr.length; x > 1; x -= 1) {}
    `,
    `
for (let x = 0; x < arr.length; x *= 2) {}
    `,
    `
for (let x = 0; x < arr.length; x = x + 11) {}
    `,
    `
for (let x = 0; x < arr.length; x++) {
  x++;
}
    `,
    `
for (let x = 0; true; x++) {}
    `,
    `
for (var q in obj) {
  if (obj.hasOwnProperty(q)) {
    console.log(q);
  }
}
    `,
    `
for (var r of arr) {
  console.log(r);
}
    `,
    `
for (let x = 0; x < arr.length; x++) {
  let y = arr[x + 1];
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  delete arr[i];
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  arr[i]++;
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  arr[i]!++;
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  arr[i]!!!++;
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  (arr[i] as number)++;
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  (<number>arr[i])++;
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  (arr[i] as unknown as number)++;
}
    `,
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  (arr[i] satisfies number)++;
}
      `,
      // `satisfies` requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
    },
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  (arr[i]! satisfies number)++;
}
      `,
      // `satisfies` requires TS 4.9
      dependencyConstraints: { typescript: '4.9' },
    },
    `
for (let i = 0; i < arr.length; i++) {
  [arr[i]] = [1];
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  [...arr[i]] = [1];
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  [...arr[i]!] = [1];
}
    `,
    `
for (let i = 0; i < arr.length; i++) {
  ({ foo: arr[i] }) = { foo: 0 };
}
    `,
    `
for (let i = 0; i < arr1?.length; i++) {
  const x = arr1[i] === arr2[i];
}
    `,
    `
for (let i = 0; i < arr?.length; i++) {
  arr[i] = 0;
}
    `,
    `
for (var c = 0; c < arr?.length; c++) {
  doMath(c);
}
    `,
    `
for (var d = 0; d < arr?.length; d++) doMath(d);
    `,
    `
for (var c = 0; c < arr.length; c++) {
  doMath?.(c);
}
    `,
    `
for (var d = 0; d < arr.length; d++) doMath?.(d);
    `,
    `
for (let i = 0; i < test.length; ++i) {
  this[i];
}
    `,
    `
for (let i = 0; i < this.length; ++i) {
  yield this[i];
}
    `,
  ],
  invalid: [
    {
      code: `
for (var a = 0; a < obj.arr.length; a++) {
  console.log(obj.arr[a]);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of obj.arr) {
  console.log(value);
}
      `,
    },
    {
      code: `
for (var b = 0; b < arr.length; b++) console.log(arr[b]);
      `,
      errors: [
        {
          column: 1,
          endColumn: 58,
          endLine: 2,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) console.log(value);
      `,
    },
    {
      code: `
for (let a = 0; a < arr.length; a++) {
  console.log(arr[a]);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  console.log(value);
}
      `,
    },
    {
      code: `
for (var b = 0; b < arr.length; b++) console?.log(arr[b]);
      `,
      errors: [
        {
          column: 1,
          endColumn: 59,
          endLine: 2,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) console?.log(value);
      `,
    },
    {
      code: `
for (let a = 0; a < arr.length; a++) {
  console?.log(arr[a]);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  console?.log(value);
}
      `,
    },
    {
      code: `
for (let a = 0; a < arr.length; ++a) {
  arr[a].whatever();
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  value.whatever();
}
      `,
    },
    {
      code: `
for (let x = 0; x < arr.length; x++) {}
      `,
      errors: [
        {
          column: 1,
          endColumn: 40,
          endLine: 2,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {}
      `,
    },
    {
      code: `
for (let x = 0; x < arr.length; x += 1) {}
      `,
      errors: [
        {
          column: 1,
          endColumn: 43,
          endLine: 2,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {}
      `,
    },
    {
      code: `
for (let x = 0; x < arr.length; x = x + 1) {}
      `,
      errors: [
        {
          column: 1,
          endColumn: 46,
          endLine: 2,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {}
      `,
    },
    {
      code: `
for (let x = 0; x < arr.length; x = 1 + x) {}
      `,
      errors: [
        {
          column: 1,
          endColumn: 46,
          endLine: 2,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {}
      `,
    },
    // Nested loops
    /* eslint-disable @typescript-eslint/internal/no-multiple-lines-of-errors */
    {
      code: `
for (let shadow = 0; shadow < arr.length; shadow++) {
  for (let shadow = 0; shadow < arr.length; shadow++) {}
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
        {
          column: 3,
          endColumn: 57,
          endLine: 3,
          line: 3,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  for (const value1 of arr) {}
}
      `,
    },
    {
      code: `
const value = 1;
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);

  for (let j = 0; j < arr2.length; j++) {
    console.log(arr2[j]);
  }
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 9,
          line: 3,
          messageId: 'preferForOf',
        },
        {
          column: 3,
          endColumn: 4,
          endLine: 8,
          line: 6,
          messageId: 'preferForOf',
        },
      ],
      output: `
const value = 1;
for (const value1 of arr) {
  console.log(value1);

  for (const value2 of arr2) {
    console.log(value2);
  }
}
      `,
    },
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  for (let j = 0; j < arr[i].length; j++) {
    console.log(arr[i][j]);
  }
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 6,
          line: 2,
          messageId: 'preferForOf',
        },
        {
          column: 3,
          endColumn: 4,
          endLine: 5,
          line: 3,
          messageId: 'preferForOf',
        },
      ],
      output: [
        `
for (const value of arr) {
  for (let j = 0; j < value.length; j++) {
    console.log(value[j]);
  }
}
      `,
        `
for (const value of arr) {
  for (const value1 of value) {
    console.log(value1);
  }
}
      `,
      ],
    },
    /* eslint-enable @typescript-eslint/internal/no-multiple-lines-of-errors */
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  obj[arr[i]] = 1;
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  obj[value] = 1;
}
      `,
    },
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  delete obj[arr[i]];
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  delete obj[value];
}
      `,
    },
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  [obj[arr[i]]] = [1];
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  [obj[value]] = [1];
}
      `,
    },
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  [...obj[arr[i]]] = [1];
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  [...obj[value]] = [1];
}
      `,
    },
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  ({ foo: obj[arr[i]] } = { foo: 1 });
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  ({ foo: obj[value] } = { foo: 1 });
}
      `,
    },
    {
      code: `
for (let i = 0; i < this.item.length; ++i) {
  this.item[i];
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of this.item) {
  value;
}
      `,
    },
    {
      code: `
for (let i = 0; i < this.array.length; ++i) {
  yield this.array[i];
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of this.array) {
  yield value;
}
      `,
    },
    {
      code: noFormat`
for (let i = 0; i < arr.length; (i++)) {
  console.log(arr[i]);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of arr) {
  console.log(value);
}
      `,
    },
    {
      code: `
for (let i = 0; i < (arr as string[]).length; i++) {
  console.log((arr as string[])[i]);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value of (arr as string[])) {
  console.log(value);
}
      `,
    },
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  const value = arr[i];
  console.log(value);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 5,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value1 of arr) {
  const value = value1;
  console.log(value);
}
      `,
    },
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  arr2.forEach(value => console.log(arr[i]));
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value1 of arr) {
  arr2.forEach(value => console.log(value1));
}
      `,
    },
    {
      code: `
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i], value);
}
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: `
for (const value1 of arr) {
  console.log(value1, value);
}
      `,
    },
    {
      code: `
for (var i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}
console.log(i);
      `,
      errors: [
        {
          column: 1,
          endColumn: 2,
          endLine: 4,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: null,
    },
    {
      code: `
for (let i = 0; i < arr[i].length; i++) {}
      `,
      errors: [
        {
          column: 1,
          endColumn: 43,
          endLine: 2,
          line: 2,
          messageId: 'preferForOf',
        },
      ],
      output: null,
    },
  ],
});
