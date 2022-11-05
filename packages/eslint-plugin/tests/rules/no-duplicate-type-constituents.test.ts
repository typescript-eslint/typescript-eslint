import type { TSESLint } from '@typescript-eslint/utils';

import type {
  MessageIds,
  Options,
} from '../../src/rules/no-duplicate-type-constituents';
import rule from '../../src/rules/no-duplicate-type-constituents';
import { getFixturesRootDir, noFormat, RuleTester } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: rootPath,
    project: './tsconfig.json',
  },
});

const valid = (operator: '|' | '&'): TSESLint.ValidTestCase<Options>[] => [
  {
    code: `type T = A ${operator} B;`,
  },
  {
    code: `const a : A ${operator} B = "A";`,
  },
  {
    code: `type T = A ${operator} /* comment */ B;`,
  },
  {
    code: `type T = 'A' ${operator} 'B';`,
  },
  {
    code: `type T = 1 ${operator} 2;`,
  },
  {
    code: `type T = 1 ${operator} '1';`,
  },
  {
    code: `type T = true ${operator} boolean;`,
  },
  {
    code: `type T = null ${operator} undefined;`,
  },
  {
    code: `type T = any ${operator} unknown;`,
  },
  {
    code: noFormat`type T = (A) ${operator} (B);`,
  },
  {
    code: `type T = { a: string } ${operator} { b: string };`,
  },
  {
    code: `type T = { a: string, b: number } ${operator} { b: number, a: string };`,
  },
  {
    code: `type T = { a: string ${operator} number };`,
  },
  {
    code: `type T = [1, 2, 3] ${operator} [1, 2, 4];`,
  },
  {
    code: `type T = [1, 2, 3] ${operator} [1, 2, 3, 4];`,
  },
  {
    code: `type T = (() => string) ${operator} (() => void);`,
  },
  {
    code: `type T = () => string ${operator} void;`,
  },
  {
    code: `type T = () => null ${operator} undefined;`,
  },
  {
    code: `type T = (arg : string ${operator} number) => void;`,
  },
  {
    code: `type T = A ${operator} B ${operator} C;`,
  },
  {
    code: `type T = readonly string[] ${operator} string[];`,
  },
  {
    code: `type T = (A | B) ${operator} (A | C);`,
  },
  {
    code: `type T = (A | B) ${operator} (A & B);`,
  },
  {
    code: `type T = Record<string, A ${operator} B>;`,
  },
];
const invalid = (
  operator: '|' | '&',
): TSESLint.InvalidTestCase<MessageIds, Options>[] => {
  const type = operator === '|' ? 'Union' : 'Intersection';
  return [
    {
      code: `type T = A ${operator} A;`,
      output: `type T = A  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
      ],
    },
    {
      code: `const a : A ${operator} A = 'A';`,
      output: `const a : A   = 'A';`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
      ],
    },
    {
      code: `type T = 1 ${operator} 1;`,
      output: `type T = 1  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: '1',
          },
        },
      ],
    },
    {
      code: `type T = true ${operator} true;`,
      output: `type T = true  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'true',
          },
        },
      ],
    },
    {
      code: `type T = null ${operator} null;`,
      output: `type T = null  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'null',
          },
        },
      ],
    },
    {
      code: `type T = any ${operator} any;`,
      output: `type T = any  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'any',
          },
        },
      ],
    },
    {
      code: `type T = 'A' ${operator} "A";`,
      output: `type T = 'A'  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: '"A"',
          },
        },
      ],
    },
    {
      code: noFormat`type T = (A) ${operator} (A);`,
      output: noFormat`type T = (A)  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
      ],
    },
    {
      code: noFormat`type T = (A) ${operator} ((A));`,
      output: noFormat`type T = (A)  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
      ],
    },
    {
      code: `type T = { a: string } ${operator} { a: string };`,
      output: `type T = { a: string };`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: '{ a: string }',
          },
        },
      ],
    },
    {
      code: `type T = { a: string, b: number } ${operator} { a: string, b: number };`,
      output: `type T = { a: string, b: number };`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: '{ a: string, b: number }',
          },
        },
      ],
    },
    {
      code: `type T = { a: string ${operator} string };`,
      output: `type T = { a: string   };`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'string',
          },
        },
      ],
    },
    {
      code: `type T = [1, 2, 3] ${operator} [1, 2, 3];`,
      output: `type T = [1, 2, 3]  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: '[1, 2, 3]',
          },
        },
      ],
    },
    {
      code: `type T = (() => string) ${operator} (() => string);`,
      output: `type T = (() => string)  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: '() => string',
          },
        },
      ],
    },
    {
      code: `type T = () => string ${operator} string;`,
      output: `type T = () => string  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'string',
          },
        },
      ],
    },
    {
      code: `type T = () => null ${operator} null;`,
      output: `type T = () => null  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'null',
          },
        },
      ],
    },
    {
      code: `type T = (arg : string ${operator} string) => void;`,
      output: `type T = (arg : string  ) => void;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'string',
          },
        },
      ],
    },
    {
      code: `type T = A ${operator} /* comment */ A;`,
      output: `type T = A  /* comment */ ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
      ],
    },
    {
      code: `type T = A ${operator} B ${operator} A;`,
      output: `type T = A ${operator} B  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
      ],
    },
    {
      code: `type T = A ${operator} B ${operator} A ${operator} B;`,
      output: `type T = A ${operator} B    ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'B',
          },
        },
      ],
    },
    {
      code: `type T = A ${operator} B ${operator} A ${operator} A;`,
      output: `type T = A ${operator} B    ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
      ],
    },
    {
      code: `type T = A ${operator} B ${operator} A ${operator} C;`,
      output: `type T = A ${operator} B   ${operator} C;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
      ],
    },
    {
      code: `type T = (A | B) ${operator} (A | B);`,
      output: `type T = (A | B)  ;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A | B',
          },
        },
      ],
    },
    {
      code: `type T = Record<string, A ${operator} A>;`,
      output: `type T = Record<string, A  >;`,
      errors: [
        {
          messageId: 'duplicate',
          data: {
            type,
            name: 'A',
          },
        },
      ],
    },
  ];
};

ruleTester.run('no-duplicate-type-constituents', rule, {
  valid: [
    ...valid('|'),
    {
      code: 'type T = A | A;',
      options: [
        {
          ignoreUnions: true,
        },
      ],
    },

    ...valid('&'),
    {
      code: 'type T = A & A;',
      options: [
        {
          ignoreIntersections: true,
        },
      ],
    },
  ],
  invalid: [...invalid('|'), ...invalid('&')],
});
