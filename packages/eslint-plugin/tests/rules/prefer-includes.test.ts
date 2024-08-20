import { RuleTester } from '@typescript-eslint/rule-tester';

import rule from '../../src/rules/prefer-includes';
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

ruleTester.run('prefer-includes', rule, {
  invalid: [
    // positive
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: string): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) != -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: string): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) > -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: string): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) >= 0;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: string): void {
          a.includes(b);
        }
      `,
    },

    // negative
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) === -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: string): void {
          !a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) == -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: string): void {
          !a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) <= -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: string): void {
          !a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: string): void {
          a.indexOf(b) < 0;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: string): void {
          !a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a?: string): void {
          a?.indexOf(b) === -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: null,
    },
    {
      code: `
        function f(a?: string): void {
          a?.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: null,
    },

    // RegExp#test
    {
      code: `
        function f(a: string): void {
          /bar/.test(a);
        }
      `,
      errors: [{ messageId: 'preferStringIncludes' }],
      output: `
        function f(a: string): void {
          a.includes('bar');
        }
      `,
    },
    // test SequenceExpression
    {
      code: `
        function f(a: string): void {
          /bar/.test((1 + 1, a));
        }
      `,
      errors: [{ messageId: 'preferStringIncludes' }],
      output: `
        function f(a: string): void {
          (1 + 1, a).includes('bar');
        }
      `,
    },
    {
      code: `
        function f(a: string): void {
          /\\0'\\\\\\n\\r\\v\\t\\f/.test(a);
        }
      `,
      errors: [{ messageId: 'preferStringIncludes' }],
      output: `
        function f(a: string): void {
          a.includes('\\0\\'\\\\\\n\\r\\v\\t\\f');
        }
      `,
    },
    {
      code: `
        const pattern = new RegExp('bar');
        function f(a: string): void {
          pattern.test(a);
        }
      `,
      errors: [{ messageId: 'preferStringIncludes' }],
      output: `
        const pattern = new RegExp('bar');
        function f(a: string): void {
          a.includes('bar');
        }
      `,
    },
    {
      code: `
        const pattern = /bar/;
        function f(a: string, b: string): void {
          pattern.test(a + b);
        }
      `,
      errors: [{ messageId: 'preferStringIncludes' }],
      output: `
        const pattern = /bar/;
        function f(a: string, b: string): void {
          (a + b).includes('bar');
        }
      `,
    },

    // type variation
    {
      code: `
        function f(a: any[]): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: any[]): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: ReadonlyArray<any>): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: ReadonlyArray<any>): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: Int8Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: Int8Array): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: Int16Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: Int16Array): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: Int32Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: Int32Array): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: Uint8Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: Uint8Array): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: Uint16Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: Uint16Array): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: Uint32Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: Uint32Array): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: Float32Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: Float32Array): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: Float64Array): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: Float64Array): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f<T>(a: T[] | ReadonlyArray<T>): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f<T>(a: T[] | ReadonlyArray<T>): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f<
          T,
          U extends
            | T[]
            | ReadonlyArray<T>
            | Int8Array
            | Uint8Array
            | Int16Array
            | Uint16Array
            | Int32Array
            | Uint32Array
            | Float32Array
            | Float64Array,
        >(a: U): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f<
          T,
          U extends
            | T[]
            | ReadonlyArray<T>
            | Int8Array
            | Uint8Array
            | Int16Array
            | Uint16Array
            | Int32Array
            | Uint32Array
            | Float32Array
            | Float64Array,
        >(a: U): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        type UserDefined = {
          indexOf(x: any): number;
          includes(x: any): boolean;
        };
        function f(a: UserDefined): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        type UserDefined = {
          indexOf(x: any): number;
          includes(x: any): boolean;
        };
        function f(a: UserDefined): void {
          a.includes(b);
        }
      `,
    },
    {
      code: `
        function f(a: Readonly<any[]>): void {
          a.indexOf(b) !== -1;
        }
      `,
      errors: [{ messageId: 'preferIncludes' }],
      output: `
        function f(a: Readonly<any[]>): void {
          a.includes(b);
        }
      `,
    },
  ],
  valid: [
    `
      function f(a: string): void {
        a.indexOf(b);
      }
    `,
    `
      function f(a: string): void {
        a.indexOf(b) + 0;
      }
    `,
    `
      function f(a: string | { value: string }): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      type UserDefined = {
        indexOf(x: any): number; // don't have 'includes'
      };
      function f(a: UserDefined): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      type UserDefined = {
        indexOf(x: any, fromIndex?: number): number;
        includes(x: any): boolean; // different parameters
      };
      function f(a: UserDefined): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      type UserDefined = {
        indexOf(x: any, fromIndex?: number): number;
        includes(x: any, fromIndex: number): boolean; // different parameters
      };
      function f(a: UserDefined): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      type UserDefined = {
        indexOf(x: any, fromIndex?: number): number;
        includes: boolean; // different type
      };
      function f(a: UserDefined): void {
        a.indexOf(b) !== -1;
      }
    `,
    `
      function f(a: string): void {
        /bar/i.test(a);
      }
    `,
    `
      function f(a: string): void {
        /ba[rz]/.test(a);
      }
    `,
    `
      function f(a: string): void {
        /foo|bar/.test(a);
      }
    `,
    `
      function f(a: string): void {
        /bar/.test();
      }
    `,
    `
      function f(a: string): void {
        something.test(a);
      }
    `,
    `
      const pattern = new RegExp('bar');
      function f(a) {
        return pattern.test(a);
      }
    `,
  ],
});
