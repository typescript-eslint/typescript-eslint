import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-loop-func';

const ruleTester = new RuleTester();

ruleTester.run('no-loop-func', rule, {
  valid: [
    `
for (let i = 0; i < 10; i++) {
  function foo() {
    console.log('A');
  }
}
    `,
    `
let someArray: MyType[] = [];
for (let i = 0; i < 10; i += 1) {
  someArray = someArray.filter((item: MyType) => !!item);
}
    `,
    {
      code: `
let someArray: MyType[] = [];
for (let i = 0; i < 10; i += 1) {
  someArray = someArray.filter((item: MyType) => !!item);
}
      `,
      languageOptions: {
        globals: {
          MyType: 'readonly',
        },
      },
    },
    {
      code: `
let someArray: MyType[] = [];
for (let i = 0; i < 10; i += 1) {
  someArray = someArray.filter((item: MyType) => !!item);
}
      `,
      languageOptions: {
        globals: {
          MyType: 'writable',
        },
      },
    },
    `
type MyType = 1;
let someArray: MyType[] = [];
for (let i = 0; i < 10; i += 1) {
  someArray = someArray.filter((item: MyType) => !!item);
}
    `,
  ],
  invalid: [],
});

// Forked from https://github.com/eslint/eslint/blob/89a4a0a260b8eb11487fe3d5d4d80f4630933eb3/tests/lib/rules/no-loop-func.js
ruleTester.run('no-loop-func ESLint tests', rule, {
  valid: [
    "string = 'function a() {}';",
    `
for (var i = 0; i < l; i++) {}
var a = function () {
  i;
};
    `,
    `
for (
  var i = 0,
    a = function () {
      i;
    };
  i < l;
  i++
) {}
    `,
    `
for (var x in xs.filter(function (x) {
  return x != upper;
})) {
}
    `,
    {
      code: `
for (var x of xs.filter(function (x) {
  return x != upper;
})) {
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // no refers to variables that declared on upper scope.
    `
for (var i = 0; i < l; i++) {
  (function () {});
}
    `,
    `
for (var i in {}) {
  (function () {});
}
    `,
    {
      code: `
for (var i of {}) {
  (function () {});
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },

    // functions which are using unmodified variables are OK.
    {
      code: `
for (let i = 0; i < l; i++) {
  (function () {
    i;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (let i in {}) {
  i = 7;
  (function () {
    i;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (const i of {}) {
  (function () {
    i;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (let i = 0; i < 10; ++i) {
  for (let x in xs.filter(x => x != i)) {
  }
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i = 0; i < l; i++) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i in {}) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i of {}) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i = 0; i < l; i++) {
  (function () {
    (function () {
      a;
    });
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i in {}) {
  function foo() {
    (function () {
      a;
    });
  }
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a = 0;
for (let i of {}) {
  () => {
    (function () {
      a;
    });
  };
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a = 0;
for (let i = 0; i < l; i++) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a = 0;
for (let i in {}) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a = 0;
for (let i of {}) {
  (function () {
    a;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: [
        'let result = {};',
        'for (const score in scores) {',
        '  const letters = scores[score];',
        "  letters.split('').forEach(letter => {",
        '    result[letter] = score;',
        '  });',
        '}',
        'result.__default = 6;',
      ].join('\n'),
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: ['while (true) {', '    (function() { a; });', '}', 'let a;'].join(
        '\n',
      ),
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    /*
     * These loops _look_ like they might be unsafe, but because i is undeclared, they're fine
     * at least as far as this rule is concerned - the loop doesn't declare/generate the variable.
     */
    `
while (i) {
  (function () {
    i;
  });
}
    `,
    `
do {
  (function () {
    i;
  });
} while (i);
    `,

    /**
     * These loops _look_ like they might be unsafe, but because i is declared outside the loop
     * and is not updated in or after the loop, they're fine as far as this rule is concerned.
     * The variable that's captured is just the one variable shared by all the loops, but that's
     * explicitly expected in these cases.
     */
    `
var i;
while (i) {
  (function () {
    i;
  });
}
    `,
    `
var i;
do {
  (function () {
    i;
  });
} while (i);
    `,

    /**
     * These loops use an undeclared variable, and so shouldn't be flagged by this rule,
     * they'll be picked up by no-undef.
     */
    {
      code: `
for (var i = 0; i < l; i++) {
  (function () {
    undeclared;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (let i = 0; i < l; i++) {
  (function () {
    undeclared;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var i in {}) {
  i = 7;
  (function () {
    undeclared;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (let i in {}) {
  i = 7;
  (function () {
    undeclared;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (const i of {}) {
  (function () {
    undeclared;
  });
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (let i = 0; i < 10; ++i) {
  for (let x in xs.filter(x => x != undeclared)) {
  }
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    // IIFE
    {
      code: `
let current = getStart();
while (current) {
  (() => {
    current;
    current.a;
    current.b;
    current.c;
    current.d;
  })();

  current = current.upper;
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    `
for (
  var i = 0;
  (function () {
    i;
  })(),
    i < l;
  i++
) {}
    `,
    `
for (
  var i = 0;
  i < l;
  (function () {
    i;
  })(),
    i++
) {}
    `,
    {
      code: `
for (var i = 0; i < 10; ++i) {
  (() => {
    i;
  })();
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var i = 0; i < 10; ++i) {
  (function a() {
    i;
  })();
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var arr = [];
for (var i = 0; i < 5; i++) {
  arr.push((f => f)((() => i)()));
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var arr = [];
for (var i = 0; i < 5; i++) {
  arr.push(
    (() => {
      return (() => i)();
    })(),
  );
}
      `,
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
  ],
  invalid: [
    {
      code: `
for (var i = 0; i < l; i++) {
  (function () {
    i;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
        },
      ],
    },
    {
      code: `
for (var i = 0; i < l; i++) {
  for (var j = 0; j < m; j++) {
    (function () {
      i + j;
    });
  }
}
      `,
      errors: [
        {
          data: { varNames: "'i', 'j'" },
          messageId: 'unsafeRefs',
        },
      ],
    },
    {
      code: `
for (var i in {}) {
  (function () {
    i;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
        },
      ],
    },
    {
      code: `
for (var i of {}) {
  (function () {
    i;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var i = 0; i < l; i++) {
  () => {
    i;
  };
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var i = 0; i < l; i++) {
  var a = function () {
    i;
  };
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
        },
      ],
    },
    {
      code: `
for (var i = 0; i < l; i++) {
  function a() {
    i;
  }
  a();
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
        },
      ],
    },

    // Warns functions which are using modified variables.
    {
      code: `
let a;
for (let i = 0; i < l; i++) {
  a = 1;
  (function () {
    a;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i in {}) {
  (function () {
    a;
  });
  a = 1;
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i of {}) {
  (function () {
    a;
  });
}
a = 1;
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i = 0; i < l; i++) {
  (function () {
    (function () {
      a;
    });
  });
  a = 1;
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i in {}) {
  a = 1;
  function foo() {
    (function () {
      a;
    });
  }
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
for (let i of {}) {
  () => {
    (function () {
      a;
    });
  };
}
a = 1;
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var i = 0; i < 10; ++i) {
  for (let x in xs.filter(x => x != i)) {
  }
}
      `,
      errors: [
        {
          data: { varNames: "'i'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (let x of xs) {
  let a;
  for (let y of ys) {
    a = 1;
    (function () {
      a;
    });
  }
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var x of xs) {
  for (let y of ys) {
    (function () {
      x;
    });
  }
}
      `,
      errors: [
        {
          data: { varNames: "'x'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
for (var x of xs) {
  (function () {
    x;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'x'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a;
for (let x of xs) {
  a = 1;
  (function () {
    a;
  });
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
var a;
for (let x of xs) {
  (function () {
    a;
  });
  a = 1;
}
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
function foo() {
  a = 10;
}
for (let x of xs) {
  (function () {
    a;
  });
}
foo();
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
    {
      code: `
let a;
function foo() {
  a = 10;
  for (let x of xs) {
    (function () {
      a;
    });
  }
}
foo();
      `,
      errors: [
        {
          data: { varNames: "'a'" },
          messageId: 'unsafeRefs',
        },
      ],
      languageOptions: { parserOptions: { ecmaVersion: 6 } },
    },
  ],
});
