import type {
  InvalidTestCase,
  ValidTestCase,
} from '@typescript-eslint/rule-tester';

import { RuleTester } from '@typescript-eslint/rule-tester';

import type { MessageIds, Options } from '../../src/rules/no-base-to-string';

import rule from '../../src/rules/no-base-to-string';
import { getFixturesRootDir } from '../RuleTester';

const rootDir = getFixturesRootDir();
const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootDir,
    },
  },
});

const literalListBasic: string[] = [
  "''",
  "'text'",
  'true',
  'false',
  '1',
  '1n',
  '[]',
  '/regex/',
];

const literalListNeedParen: string[] = [
  "__dirname === 'foobar'",
  '{}.constructor()',
  '() => {}',
  'function() {}',
];

const literalListArray = literalListBasic.map(i => `[${i}]`);

const literalList = [
  ...literalListBasic,
  ...literalListArray,
  ...literalListNeedParen,
];

const literalListWrapped = [
  ...literalListBasic,
  ...literalListArray,
  ...literalListNeedParen.map(i => `(${i})`),
];

const validArray = (type: string): ValidTestCase<Options>[] => [
  // Array
  {
    code: `
      function test(type: (${type})[]) {
        return \`\${type}\`;
      }
    `,
  },
  {
    code: `
      function test(type: (${type})[]) {
        return type.toString();
      }
    `,
  },
  {
    code: `
      function test(type: (${type})[]) {
        return type.join();
      }
    `,
  },

  // Tuple
  {
    code: `
      function test(type: [${type}]) {
        return \`\${type}\`;
      }
    `,
  },
  {
    code: `
      function test(type: [${type}]) {
        return type.toString();
      }
    `,
  },
  {
    code: `
      function test(type: [${type}]) {
        return type.join();
      }
    `,
  },
];

const invalidArray = (
  type: string,
  certainty: string,
): InvalidTestCase<MessageIds, Options>[] => {
  return [
    // Array
    {
      code: `
        function test(type: (${type})[]) {
          return \`\${type}\`;
        }
      `,
      errors: [
        {
          data: {
            certainty,
            name: 'type',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        function test(type: (${type})[]) {
          return type.toString();
        }
      `,
      errors: [
        {
          data: {
            certainty,
            name: 'type',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        function test(type: (${type})[]) {
          return type.join();
        }
      `,
      errors: [
        {
          data: {
            certainty,
            name: 'type.join()',
          },
          messageId: 'baseToString',
        },
      ],
    },

    // Tuple
    {
      code: `
        function test(type: [${type}]) {
          return \`\${type}\`;
        }
      `,
      errors: [
        {
          data: {
            certainty,
            name: 'type',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        function test(type: [${type}]) {
          return type.toString();
        }
      `,
      errors: [
        {
          data: {
            certainty,
            name: 'type',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        function test(type: [${type}]) {
          return type.join();
        }
      `,
      errors: [
        {
          data: {
            certainty,
            name: 'type.join()',
          },
          messageId: 'baseToString',
        },
      ],
    },
  ];
};

ruleTester.run('no-base-to-string', rule, {
  valid: [
    // template
    ...literalList.map(i => `\`\${${i}}\`;`),

    // operator + +=
    ...literalListWrapped.flatMap(l =>
      literalListWrapped.map(r => `${l} + ${r};`),
    ),

    // toString()
    ...literalListWrapped.map(i => `${i === '1' ? `(${i})` : i}.toString();`),

    // variable toString() and template
    ...literalList.map(
      i => `
        let value = ${i};
        value.toString();
        let text = \`\${value}\`;
      `,
    ),

    `
function someFunction() {}
someFunction.toString();
let text = \`\${someFunction}\`;
    `,
    'unknownObject.toString();',
    'unknownObject.someOtherMethod();',
    `
class CustomToString {
  toString() {
    return 'Hello, world!';
  }
}
'' + new CustomToString();
    `,
    `
const literalWithToString = {
  toString: () => 'Hello, world!',
};
'' + literalToString;
    `,
    `
const printer = (inVar: string | number | boolean) => {
  inVar.toString();
};
printer('');
printer(1);
printer(true);
    `,
    'let _ = {} * {};',
    'let _ = {} / {};',
    'let _ = ({} *= {});',
    'let _ = ({} /= {});',
    'let _ = ({} = {});',
    'let _ = {} == {};',
    'let _ = {} === {};',
    'let _ = {} in {};',
    'let _ = {} & {};',
    'let _ = {} ^ {};',
    'let _ = {} << {};',
    'let _ = {} >> {};',
    `
function tag() {}
tag\`\${{}}\`;
    `,
    `
      function tag() {}
      tag\`\${{}}\`;
    `,
    `
      interface Brand {}
      function test(v: string & Brand): string {
        return \`\${v}\`;
      }
    `,
    "'' += new Error();",
    "'' += new URL();",
    "'' += new URLSearchParams();",

    {
      code: `
        function test(type: string[] | number[]) {
          return \`\${type}\`;
        }
      `,
    },
    ...validArray('{} & string'),
    ...validArray('string | number'),
    ...validArray('string[][]'),
  ],
  invalid: [
    {
      code: '`${{}})`;',
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: '({}).toString();',
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: "'' + {};",
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: "'' += {};",
      errors: [
        {
          data: {
            certainty: 'will',
            name: '{}',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrString = Math.random() ? { a: true } : 'text';
        someObjectOrString.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'someObjectOrString',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrString = Math.random() ? { a: true } : 'text';
        someObjectOrString + '';
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'someObjectOrString',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
        someObjectOrObject.toString();
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'someObjectOrObject',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        let someObjectOrObject = Math.random() ? { a: true, b: true } : { a: true };
        someObjectOrObject + '';
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'someObjectOrObject',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        interface A {}
        interface B {}
        function test(intersection: A & B): string {
          return \`\${intersection}\`;
        }
      `,
      errors: [
        {
          data: {
            certainty: 'will',
            name: 'intersection',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        function test(type: string[] | {}[]) {
          return \`\${type}\`;
        }
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'type',
          },
          messageId: 'baseToString',
        },
      ],
    },
    {
      code: `
        function test(type: string[] | {}[][]) {
          return \`\${type}\`;
        }
      `,
      errors: [
        {
          data: {
            certainty: 'may',
            name: 'type',
          },
          messageId: 'baseToString',
        },
      ],
    },
    ...invalidArray('{}', 'will'),
    ...invalidArray('{} | string', 'may'),
    ...invalidArray('{a: number} | {b: number}', 'will'),
    ...invalidArray('{}[]', 'will'),
  ],
});
