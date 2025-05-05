import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/no-duplicate-type-constituents';
import { getFixturesRootDir } from '../RuleTester';

const rootPath = getFixturesRootDir();

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: rootPath,
    },
  },
});

ruleTester.run('no-duplicate-type-constituents', rule, {
  invalid: [
    {
      code: 'type T = 1 | 1;',
      errors: [
        {
          data: {
            previous: '1',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = 1  ;`,
    },
    {
      code: 'type T = true & true;',
      errors: [
        {
          data: {
            previous: 'true',
            type: 'Intersection',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = true  ;`,
    },
    {
      code: 'type T = null | null;',
      errors: [
        {
          data: {
            previous: 'null',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = null  ;`,
    },
    {
      code: 'type T = any | any;',
      errors: [
        {
          data: {
            previous: 'any',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = any  ;`,
    },
    {
      code: 'type T = { a: string | string };',
      errors: [
        {
          data: {
            previous: 'string',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = { a: string   };`,
    },
    {
      code: 'type T = { a: string } | { a: string };',
      errors: [
        {
          data: {
            previous: '{ a: string }',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = { a: string }  ;`,
    },
    {
      code: 'type T = { a: string; b: number } | { a: string; b: number };',
      errors: [
        {
          data: {
            previous: '{ a: string; b: number }',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = { a: string; b: number }  ;`,
    },
    {
      code: 'type T = Set<string> | Set<string>;',
      errors: [
        {
          data: {
            previous: 'Set<string>',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = Set<string>  ;`,
    },
    {
      code: `
type IsArray<T> = T extends any[] ? true : false;
type ActuallyDuplicated = IsArray<number> | IsArray<string>;
      `,
      errors: [
        {
          data: {
            previous: 'IsArray<number>',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type IsArray<T> = T extends any[] ? true : false;
type ActuallyDuplicated = IsArray<number>  ;
      `,
    },
    {
      code: 'type T = string[] | string[];',
      errors: [
        {
          data: {
            previous: 'string[]',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = string[]  ;`,
    },
    {
      code: 'type T = string[][] | string[][];',
      errors: [
        {
          data: {
            previous: 'string[][]',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = string[][]  ;`,
    },
    {
      code: 'type T = [1, 2, 3] | [1, 2, 3];',
      errors: [
        {
          data: {
            previous: '[1, 2, 3]',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = [1, 2, 3]  ;`,
    },
    {
      code: 'type T = () => string | string;',
      errors: [
        {
          data: {
            previous: 'string',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = () => string  ;`,
    },
    {
      code: 'type T = () => null | null;',
      errors: [
        {
          data: {
            previous: 'null',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = () => null  ;`,
    },
    {
      code: 'type T = (arg: string | string) => void;',
      errors: [
        {
          data: {
            previous: 'string',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = (arg: string  ) => void;`,
    },
    {
      code: "type T = 'A' | 'A';",
      errors: [
        {
          data: {
            previous: "'A'",
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `type T = 'A'  ;`,
    },
    {
      code: `
type A = 'A';
type T = A | A;
      `,
      errors: [
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type T = A  ;
      `,
    },
    {
      code: `
type A = 'A';
const a: A | A = 'A';
      `,
      errors: [
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
const a: A   = 'A';
      `,
    },
    {
      code: `
type A = 'A';
type T = A | /* comment */ A;
      `,
      errors: [
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type T = A  /* comment */ ;
      `,
    },
    {
      code: `
type A1 = 'A';
type A2 = 'A';
type A3 = 'A';
type T = A1 | A2 | A3;
      `,
      errors: [
        {
          data: {
            previous: 'A1',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
        {
          data: {
            previous: 'A1',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A1 = 'A';
type A2 = 'A';
type A3 = 'A';
type T = A1    ;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | B | A;
      `,
      errors: [
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type B = 'B';
type T = A | B  ;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | B | A | B;
      `,
      errors: [
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
        {
          data: {
            previous: 'B',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type B = 'B';
type T = A | B    ;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | B | A | A;
      `,
      errors: [
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type B = 'B';
type T = A | B    ;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type C = 'C';
type T = A | B | A | C;
      `,
      errors: [
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type B = 'B';
type C = 'C';
type T = A | B   | C;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = (A | B) | (A | B);
      `,
      errors: [
        {
          data: {
            previous: 'A | B',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type B = 'B';
type T = (A | B)  ;
      `,
    },
    {
      code: `
type A = 'A';
type T = A | (A | A);
      `,
      errors: [
        {
          data: {
            previous: `A`,
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type T = A  ;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type C = 'C';
type D = 'D';
type F = (A | B) | (A | B) | ((C | D) & (A | B)) | (A | B);
      `,
      errors: [
        {
          data: {
            previous: 'A | B',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
        {
          data: {
            previous: 'A | B',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type B = 'B';
type C = 'C';
type D = 'D';
type F = (A | B)   | ((C | D) & (A | B))  ;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type C = (A | B) | A | B | (A | B);
      `,
      errors: [
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
        {
          data: {
            previous: 'B',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
        {
          data: {
            previous: 'A | B',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type B = 'B';
type C = (A | B)      ;
      `,
    },
    {
      code: 'type A = (number | string) | number | string;',
      errors: [
        {
          data: {
            previous: 'number',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
        {
          data: {
            previous: 'string',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: 'type A = (number | string)    ;',
    },
    {
      code: 'type A = (number | (string | null)) | (string | (null | number));',
      errors: [
        {
          data: {
            previous: 'number | (string | null)',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: 'type A = (number | (string | null))  ;',
    },
    {
      code: 'type A = (number & string) & number & string;',
      errors: [
        {
          data: {
            previous: 'number',
            type: 'Intersection',
          },
          messageId: 'duplicate',
        },
        {
          data: {
            previous: 'string',
            type: 'Intersection',
          },
          messageId: 'duplicate',
        },
      ],
      output: 'type A = (number & string)    ;',
    },
    {
      code: 'type A = number & string & (number & string);',
      errors: [
        {
          data: {
            previous: 'number',
            type: 'Intersection',
          },
          messageId: 'duplicate',
        },
        {
          data: {
            previous: 'string',
            type: 'Intersection',
          },
          messageId: 'duplicate',
        },
      ],
      output: [
        'type A = number & string & (  string);',
        'type A = number & string    ;',
      ],
    },
    {
      code: `
type A = 'A';
type T = Record<string, A | A>;
      `,
      errors: [
        {
          data: {
            previous: 'A',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: `
type A = 'A';
type T = Record<string, A  >;
      `,
    },
    {
      code: 'type T = A | A | string | string;',
      errors: [
        {
          data: {
            previous: 'string',
            type: 'Union',
          },
          messageId: 'duplicate',
        },
      ],
      output: 'type T = A | A | string  ;',
    },
    {
      code: '(a?: string | undefined) => {};',
      errors: [{ messageId: 'unnecessary' }],
      output: '(a?: string  ) => {};',
    },
    {
      code: `
        type T = undefined;
        (arg?: T | string) => {};
      `,
      errors: [{ messageId: 'unnecessary' }],
      output: `
        type T = undefined;
        (arg?:   string) => {};
      `,
    },
    {
      code: `
        interface F {
          (a?: string | undefined): void;
        }
      `,
      errors: [{ messageId: 'unnecessary' }],
      output: `
        interface F {
          (a?: string  ): void;
        }
      `,
    },
    {
      code: 'type fn = new (a?: string | undefined) => void;',
      errors: [{ messageId: 'unnecessary' }],
      output: 'type fn = new (a?: string  ) => void;',
    },
    {
      code: 'function f(a?: string | undefined) {}',
      errors: [{ messageId: 'unnecessary' }],
      output: 'function f(a?: string  ) {}',
    },
    {
      code: 'f = function (a?: string | undefined) {};',
      errors: [{ messageId: 'unnecessary' }],
      output: 'f = function (a?: string  ) {};',
    },
    {
      code: 'declare function f(a?: string | undefined): void;',
      errors: [{ messageId: 'unnecessary' }],
      output: 'declare function f(a?: string  ): void;',
    },
    {
      code: `
        declare class bb {
          f(a?: string | undefined): void;
        }
      `,
      errors: [{ messageId: 'unnecessary' }],
      output: `
        declare class bb {
          f(a?: string  ): void;
        }
      `,
    },
    {
      code: `
        interface ee {
          f(a?: string | undefined): void;
        }
      `,
      errors: [{ messageId: 'unnecessary' }],
      output: `
        interface ee {
          f(a?: string  ): void;
        }
      `,
    },
    {
      code: `
        interface ee {
          new (a?: string | undefined): void;
        }
      `,
      errors: [{ messageId: 'unnecessary' }],
      output: `
        interface ee {
          new (a?: string  ): void;
        }
      `,
    },
    {
      code: 'type fn = (a?: string | undefined) => void;',
      errors: [{ messageId: 'unnecessary' }],
      output: 'type fn = (a?: string  ) => void;',
    },
    {
      code: 'type fn = (a?: string | (undefined | number)) => void;',
      errors: [{ messageId: 'unnecessary' }],
      output: 'type fn = (a?: string | (  number)) => void;',
    },
    {
      code: 'type fn = (a?: (undefined | number) | string) => void;',
      errors: [{ messageId: 'unnecessary' }],
      output: 'type fn = (a?: (  number) | string) => void;',
    },
    {
      code: `
        abstract class cc {
          abstract f(a?: string | undefined): void;
        }
      `,
      errors: [{ messageId: 'unnecessary' }],
      output: `
        abstract class cc {
          abstract f(a?: string  ): void;
        }
      `,
    },
  ],
  valid: [
    {
      code: 'type T = 1 | 2;',
    },
    {
      code: "type T = 1 | '1';",
    },
    {
      code: 'type T = true & boolean;',
    },
    {
      code: 'type T = null | undefined;',
    },
    {
      code: 'type T = any | unknown;',
    },
    {
      code: 'type T = { a: string } | { b: string };',
    },
    {
      code: 'type T = { a: string; b: number } | { b: number; a: string };',
    },
    {
      code: 'type T = { a: string | number };',
    },
    {
      code: 'type T = Set<string> | Set<number>;',
    },
    {
      code: 'type T = Class<string> | Class<number>;',
    },
    {
      code: 'type T = string[] | number[];',
    },
    {
      code: 'type T = string[][] | string[];',
    },
    {
      code: 'type T = [1, 2, 3] | [1, 2, 4];',
    },
    {
      code: 'type T = [1, 2, 3] | [1, 2, 3, 4];',
    },
    {
      code: "type T = 'A' | string[];",
    },
    {
      code: 'type T = (() => string) | (() => void);',
    },
    {
      code: 'type T = () => string | void;',
    },
    {
      code: 'type T = () => null | undefined;',
    },
    {
      code: 'type T = (arg: string | number) => void;',
    },
    {
      code: 'type T = A | A;',
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | B;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
const a: A | B = 'A';
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = A | /* comment */ B;
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = 'A' | 'B';
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type C = 'C';
type T = A | B | C;
      `,
    },
    {
      code: 'type T = readonly string[] | string[];',
    },
    {
      code: `
type A = 'A';
type B = 'B';
type C = 'C';
type D = 'D';
type T = (A | B) | (C | D);
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = (A | B) | (A & B);
      `,
    },
    {
      code: `
type A = 'A';
type B = 'B';
type T = Record<string, A | B>;
      `,
    },
    {
      code: 'type T = A | A;',
      options: [
        {
          ignoreUnions: true,
        },
      ],
    },
    {
      code: 'type T = A & A;',
      options: [
        {
          ignoreIntersections: true,
        },
      ],
    },
    {
      code: 'type T = Class<string> | Class<string>;',
    },
    {
      code: 'type T = A | A | string;',
    },
    { code: '(a: string | undefined) => {};' },
  ],
});
