import rule from '../../src/rules/organize-imports';
import { RuleTester } from '../RuleTester';

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  parser: '@typescript-eslint/parser',
});

ruleTester.run('organize-imports', rule, {
  valid: [
    "import { a, b } from 'foo'",
    "import { a, b } from '../foo'",
    "import { A, b } from 'foo'",
    "import { A, b } from '../foo'",
    "import { a, B } from 'foo'",
    "import { a, B } from '../foo'",
    "import { A, B } from 'foo'",
    "import { A, B } from '../foo'",
    "import { a, _b } from 'foo'",
    "import { a, _b } from '../foo'",
    "import * as bar from 'foo'",
    "import * as bar from '../foo'",
    `import b from 'a';
     import a from 'b';
    `,
    `import b from 'b';
     import a from '../a';
     import c from './c';
    `,
    `import c from 'c';
     import a from '../../a';
     import b from '../b';
     import d from './d';
    `,
    `import a from 'a';
     import { b, c } from 'bc';
     import d from 'd';
    `,
    `import a from 'a';
     import c from '../../c';
     import { d } from '../d';
     import { b, e } from './be';
    `,
  ],
  invalid: [
    {
      code: "import { b, a } from 'foo'",
      errors: [
        {
          messageId: 'namedOrder',
          line: 1,
          column: 10,
        },
      ],
    },
    {
      code: "import { b, a } from '../foo'",
      errors: [
        {
          messageId: 'namedOrder',
          line: 1,
          column: 10,
        },
      ],
    },
    {
      code: "import { _a, b } from 'foo'",
      errors: [
        {
          messageId: 'namedOrder',
          line: 1,
          column: 10,
        },
      ],
    },
    {
      code: "import { _a, b } from '../foo'",
      errors: [
        {
          messageId: 'namedOrder',
          line: 1,
          column: 10,
        },
      ],
    },
    {
      code: `import a from 'b';
      import b from 'a';
      `,
      errors: [
        {
          messageId: 'sourceOrder',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `import a from '../a';
      import b from 'b';
      import c from './c';
      `,
      errors: [
        {
          messageId: 'sourceOrder',
          line: 1,
          column: 1,
        },
      ],
    },
    {
      code: `import { a, b } from '../../ab';
      import c from './c';
      import { d, e } from '../de';
      `,
      errors: [
        {
          messageId: 'sourceOrder',
          line: 1,
          column: 1,
        },
      ],
    },
  ],
});
